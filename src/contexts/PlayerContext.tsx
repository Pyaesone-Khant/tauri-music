import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type PlayerContextType = {
	playlist: Song[];
	currentSongIndex: number;
	currentSong: Song | null;
	isPlaying: boolean;
	onLoadSong: (index: number) => void;
	audioRef: React.RefObject<HTMLAudioElement | null> | null;
	statusMessage: string;
	onTogglePlayPause: () => void;
	playNext: () => void;
	playPrevious: () => void;
	selectMusicFiles: () => Promise<void>;
	currentTime: number;
	duration: number;
	setCurrentTime: (time: number) => void;
};

const PlayerContext = createContext<PlayerContextType>({
	playlist: [],
	currentSongIndex: -1,
	currentSong: null,
	isPlaying: false,
	onLoadSong: () => {},
	audioRef: null,
	statusMessage: "",
	onTogglePlayPause: () => {},
	playNext: () => {},
	playPrevious: () => {},
	selectMusicFiles: async () => {},
	currentTime: 0,
	duration: 0,
	setCurrentTime: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
	const [playlist, setPlaylist] = useState<Song[]>([]);
	const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [statusMessage, setStatusMessage] = useState<string>("");

	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const audioRef = useRef<HTMLAudioElement | null>(null);

	const onLoadSong = useCallback(
		(index: number) => {
			if (index < 0 || index >= playlist.length) return;
			const isAlreadyPlayingCurrent = index === currentSongIndex;

			if (isAlreadyPlayingCurrent) {
				if (isPlaying) {
					audioRef.current?.pause();
					setIsPlaying(false);
					return;
				}

				audioRef.current
					?.play()
					.then(() => setIsPlaying(true))
					.catch((err) => {
						console.error("Error playing audio:", err);
						setStatusMessage("Failed to play the selected song.");
						setIsPlaying(false);
					});
			} else {
				setCurrentSongIndex(index);
				setIsPlaying(false);

				if (audioRef.current === null) return;
				audioRef.current.src = playlist[index].url;
				audioRef.current.load();

				setTimeout(() => {
					if (!audioRef.current) return;

					audioRef.current
						.play()
						.then(() => setIsPlaying(true))
						.catch((err) => {
							console.error("Error playing audio:", err);
							setStatusMessage(
								"Failed to play the selected song."
							);
							setIsPlaying(false);
						});
				}, 100);
			}
		},
		[playlist, isPlaying, currentSongIndex]
	);

	const onTogglePlayPause = () => {
		if (!audioRef.current) return;

		if (audioRef.current.src === "") {
			audioRef.current.src = playlist[currentSongIndex]?.url || "";
			audioRef.current.load();
			audioRef.current.currentTime = currentTime;
		}

		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current
				.play()
				.then(() => setIsPlaying(true))
				.catch((err) => {
					console.error("Error playing audio:", err);
					setStatusMessage("Failed to play the selected song.");
					setIsPlaying(false);
				});
		}
	};

	const playNext = () => {
		if (playlist.length === 0) return;

		const nextIndex = (currentSongIndex + 1) % playlist.length;
		onLoadSong(nextIndex);
	};

	const playPrevious = () => {
		if (playlist.length === 0) return;

		const prevIndex =
			(currentSongIndex - 1 + playlist.length) % playlist.length;
		onLoadSong(prevIndex);
	};

	// auto play next song when current ends
	useEffect(() => {
		if (!audioRef.current) return;

		const handleEnded = () => {
			playNext();
		};

		audioRef.current.addEventListener("ended", handleEnded);

		return () => {
			if (!audioRef.current) return;
			audioRef.current.removeEventListener("ended", handleEnded);
		};
	}, [playNext]);

	// --- File Dialog and Loading ---
	const selectMusicFiles = async () => {
		setStatusMessage("Opening file dialog...");
		const initialPlaylistLength = playlist.length;

		try {
			/** @type {string | string[] | null} */
			// Use the locally defined 'open' function (which handles the Tauri global fallback)
			const selected = await open({
				multiple: true,
				title: "Select Music Files (mp3, wav, ogg, flac) ",
				filters: [
					{
						name: "Audio",
						extensions: ["mp3", "wav", "ogg", "flac"],
					},
				],
			});

			if (!selected) {
				setStatusMessage(
					"File selection cancelled or Tauri API not available."
				);
				return;
			}

			// Ensure selected is always an array of paths
			const paths = Array.isArray(selected) ? selected : [selected];

			setStatusMessage(
				`Found ${paths.length} songs. Fetching metadata...`
			);

			const metadataPromises = paths.map((path) => getMetadata(path));
			const metadataResults = await Promise.all(metadataPromises);

			// 3. Combine file paths and metadata results into Song objects
			const enrichedSongs = paths.map((path, index) => {
				const metadata = metadataResults[index] as Metadata | undefined;
				return {
					path,
					url: convertFileSrc(path),
					name: path.split(/[/\\]/).pop() ?? path, // Extract the file name
					metadata,
				};
			});

			// 4. Add new songs to the playlist
			setPlaylist((prev) => {
				// Avoid adding duplicates based on file path
				const existingPaths = new Set(prev.map((song) => song.path));
				const newSongs = enrichedSongs.filter(
					(song) => !existingPaths.has(song.path)
				);
				return [...prev, ...newSongs];
			});
			setStatusMessage(
				`${enrichedSongs.length} songs added and metadata loaded.`
			);

			// Auto play the first added song if nothing is playing
			if (currentSongIndex === -1 && initialPlaylistLength === 0) {
				setCurrentSongIndex(initialPlaylistLength);
				onLoadSong(initialPlaylistLength);

				// auto play
				if (audioRef.current) {
					audioRef.current.src = enrichedSongs[0].url;
					audioRef.current.load();

					audioRef.current
						.play()
						.then(() => {
							setIsPlaying(true);
						})
						.catch((err) => {
							console.error("Error auto playing audio:", err);
							setStatusMessage(
								"Failed to auto play the selected song."
							);
							setIsPlaying(false);
						});
				}
			}
		} catch (error) {
			console.error("Tauri dialog or metadata error:", error);
			setStatusMessage(
				"Error selecting/reading files. Check Tauri configuration and Rust logs."
			);
		}
	};

	// fetch metadata when a new song is loaded
	const getMetadata = async (path: string) => {
		try {
			// Calls the Rust command defined in src-tauri/main.rs
			const metadata = await invoke<Metadata | null>("get_metadata", {
				filePath: path,
			});
			return metadata;
		} catch (error) {
			console.error("Failed to fetch metadata:", error);
			setStatusMessage("Error reading file metadata. Check Rust logs.");
		}
	};

	const currentSong = useMemo(() => {
		return playlist[currentSongIndex] || null;
	}, [playlist, currentSongIndex]);

	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		setCurrentTime(audioRef.current.currentTime);
	};

	const handleLoadedMetadata = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration);
	};

	const isSongPlaying = useMemo(() => {
		return isPlaying && currentSongIndex !== -1;
	}, [isPlaying, currentSongIndex]);

	// toggle isPlaying when audio element's play/pause events occur
	useEffect(() => {
		if (audioRef.current === null) return;

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audioRef.current.addEventListener("play", handlePlay);
		audioRef.current.addEventListener("pause", handlePause);

		return () => {
			if (audioRef.current === null) return;
			audioRef.current.removeEventListener("play", handlePlay);
			audioRef.current.removeEventListener("pause", handlePause);
		};
	}, [audioRef.current?.played, audioRef.current?.paused]);

	const contextValue: PlayerContextType = {
		playlist,
		currentSongIndex,
		currentSong,
		isPlaying: isSongPlaying,
		onLoadSong,
		audioRef,
		statusMessage,
		onTogglePlayPause,
		playNext,
		playPrevious,
		selectMusicFiles,
		currentTime,
		duration,
		setCurrentTime,
	};

	return (
		<PlayerContext.Provider value={contextValue}>
			{children}
			<audio
				ref={audioRef}
				className="hidden"
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
			/>
		</PlayerContext.Provider>
	);
};

export const usePlayerContext = () => useContext(PlayerContext);
