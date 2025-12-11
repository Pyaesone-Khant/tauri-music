import { useDisclosure } from "@mantine/hooks";
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
import { PlayMode } from "../constants/playmode.enum";

type PlayerContextType = {
	playlist: Song[];
	setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>;
	currentSong: Song | null;
	isPlaying: boolean;
	onLoadSong: (path: string) => void;
	audioRef: React.RefObject<HTMLAudioElement | null> | null;
	statusMessage: string;
	onTogglePlayPause: () => void;
	playNext: () => void;
	playPrevious: () => void;
	selectMusicFiles: () => Promise<void>;
	currentTime: number;
	duration: number;
	setCurrentTime: (time: number) => void;
	currentSongPath: string | null;
	setCurrentSongIndex: React.Dispatch<React.SetStateAction<number>>;
	currentPlayMode: PlayMode;
	handleChangePlayMode: () => void;
	showLyrics: boolean;
	handleShowLyrics: () => void;
	handleRemoveSong: (path: string) => void;
};

const PlayerContext = createContext<PlayerContextType>({
	playlist: [],
	setPlaylist: () => {},
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
	currentSongPath: null,
	setCurrentSongIndex: () => {},
	currentPlayMode: PlayMode.REPEAT,
	handleChangePlayMode: () => {},
	showLyrics: false,
	handleShowLyrics: () => {},
	handleRemoveSong: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
	const [playlist, setPlaylist] = useState<Song[]>([]);
	const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [statusMessage, setStatusMessage] = useState<string>("");

	const [showLyrics, { toggle }] = useDisclosure(false);

	// to make current playing song not to change when Dnd Sorting changes was made.
	const [currentSongPath, setCurrentSongPath] = useState<string | null>(null);

	// play mode options: "repeat", "repeat-one", "shuffle"
	const [currentPlayMode, setCurrentPlayMode] = useState<PlayMode>(
		PlayMode.REPEAT
	);

	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleChangePlayMode = () => {
		const nextMode =
			currentPlayMode === PlayMode.REPEAT
				? PlayMode["REPEAT-1"]
				: currentPlayMode === PlayMode["REPEAT-1"]
				? PlayMode.SHUFFLE
				: PlayMode.REPEAT;
		setCurrentPlayMode(nextMode);
	};

	useEffect(() => {
		if (playlist.length === 0) return;
		if (currentPlayMode === PlayMode.SHUFFLE) {
			const currentSong = playlist.find(
				(song) => song.path === currentSongPath
			);

			const remainingSongs = playlist.filter(
				(song) => song.path !== currentSongPath
			);

			// Simple shuffle algorithm
			for (let i = remainingSongs.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[remainingSongs[i], remainingSongs[j]] = [
					remainingSongs[j],
					remainingSongs[i],
				];
			}

			const newPlaylist = currentSong
				? [currentSong, ...remainingSongs]
				: remainingSongs;

			const newCurrentIndex = newPlaylist.findIndex(
				(song) => song.path === currentSongPath
			);

			setCurrentSongIndex(newCurrentIndex);
			setPlaylist(newPlaylist);
		}

		if (currentPlayMode === PlayMode.REPEAT) {
			// Reset to original playlist order if needed
			const originalPlaylist = [...playlist].sort(
				(a, b) => a.timestamp - b.timestamp
			);
			const newCurrentIndex = originalPlaylist.findIndex(
				(song) => song.path === currentSongPath
			);
			setCurrentSongIndex(newCurrentIndex);
			setPlaylist(originalPlaylist);
		}
	}, [currentPlayMode]);

	// load song
	const onLoadSong = useCallback(
		(path: string) => {
			if (path === null) return;
			const isAlreadyPlayingCurrent = path === currentSongPath;

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
				const selectedSong = playlist.find(
					(song) => song.path === path
				);

				const selectedSongIndex = playlist.findIndex(
					(song) => song.path === path
				);

				if (!selectedSong) {
					setStatusMessage("Selected song not found in playlist.");
					return;
				}

				const frontPartRemainingSongs = playlist.slice(
					0,
					selectedSongIndex
				);

				const backPartRemainingSongs = playlist.slice(
					selectedSongIndex + 1
				);

				const newPlaylist = [
					selectedSong,
					...backPartRemainingSongs,
				].concat(frontPartRemainingSongs);

				setPlaylist(newPlaylist);

				setCurrentSongIndex(0);
				setCurrentSongPath(path);
				setIsPlaying(false);

				if (audioRef.current === null) return;

				audioRef.current.src = selectedSong?.url || "";
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
		[playlist, isPlaying, currentSongPath]
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
		const nextIndex = currentSongIndex + 1;
		setCurrentSongIndex(nextIndex);
		onLoadSong(playlist[nextIndex]?.path || "");
	};

	const playPrevious = () => {
		if (playlist.length === 0) return;

		const prevIndex = currentSongIndex - 1 + playlist.length;
		setCurrentSongIndex(prevIndex);
		onLoadSong(playlist[prevIndex]?.path || "");
	};

	// auto play next song when current ends
	useEffect(() => {
		if (!audioRef.current) return;
		const handleEnded = () => {
			// handle according to play mode
			if (currentPlayMode === PlayMode["REPEAT-1"]) {
				audioRef.current?.play().catch((err) => {
					console.error("Error replaying audio:", err);
					setStatusMessage("Failed to replay the selected song.");
					setIsPlaying(false);
				});
			} else {
				playNext();
			}
		};

		audioRef.current.addEventListener("ended", handleEnded);

		return () => {
			if (!audioRef.current) return;
			audioRef.current.removeEventListener("ended", handleEnded);
		};
	}, [playNext, currentPlayMode]);

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
					timestamp: Date.now(),
					lyrics: [],
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
			if (currentSongPath === null && initialPlaylistLength === 0) {
				setCurrentSongPath(enrichedSongs[0]?.path);
				setCurrentSongIndex(0);
				onLoadSong(enrichedSongs[0]?.path);

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
		return playlist.find((song) => song.path === currentSongPath) || null;
	}, [currentSongPath, playlist]);

	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		setCurrentTime(audioRef.current.currentTime);
	};

	const handleLoadedMetadata = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration);
	};

	const isSongPlaying = useMemo(() => {
		return isPlaying && currentSongPath !== null;
	}, [isPlaying, currentSongPath]);

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

	const handleRemoveSong = (path: string) => {
		const isRemovingCurrentSong = currentSongPath === path;
		if (isRemovingCurrentSong) {
			const newPlaylist = playlist.filter(
				(it) => it.path !== currentSongPath && it.path !== path
			);

			if (newPlaylist.length > 0) {
				const newSong = newPlaylist[0];
				onLoadSong(newSong.path);
			} else {
				if (audioRef && audioRef.current) {
					audioRef.current.src = "";
					audioRef.current = null;
				}
				setCurrentSongIndex(-1);
				setCurrentSongPath(null);
			}
			setDuration(0);
			setCurrentTime(0);
			setPlaylist(newPlaylist);
		} else {
			setPlaylist((prev) => prev.filter((it) => it.path !== path));
		}
	};

	const contextValue: PlayerContextType = {
		playlist,
		setPlaylist,
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
		currentSongPath,
		setCurrentSongIndex,
		currentPlayMode,
		handleChangePlayMode,
		showLyrics,
		handleShowLyrics: toggle,
		handleRemoveSong,
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
