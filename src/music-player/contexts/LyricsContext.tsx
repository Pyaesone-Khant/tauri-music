import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { parseLRC } from "../../services/parse-lrc";

type LyricsContextType = {
	loading: boolean;
	lyricsSegments: LyricData[];
	activeLineIndex: number;
	setActiveLineIndex: React.Dispatch<React.SetStateAction<number>>;
	handleUploadSongLyrics: () => Promise<void>;
};

const LyricsContext = createContext<LyricsContextType>({
	loading: false,
	lyricsSegments: [],
	activeLineIndex: -1,
	setActiveLineIndex: () => {},
	handleUploadSongLyrics: async () => {},
});

export const LyricsProvider = ({ children }: { children: React.ReactNode }) => {
	const { currentSong, duration, setPlaylist, currentSongPath } =
		usePlayerContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
	const [lyricsSegments, setLyricsSegments] = useState<LyricData[]>([]);

	// fetch lyrics if when the current song
	useEffect(() => {
		if (!currentSong) return;

		// Reset state for new song
		setActiveLineIndex(-1);

		// Check if we already have lyrics in the playlist object
		if (currentSong.lyrics && currentSong.lyrics.length > 0) {
			setLyricsSegments(currentSong.lyrics);
			setLoading(false);
		} else {
			// Only fetch if we don't have them
			setLyricsSegments([]); // Clear old lyrics immediately
			fetchCurrentSongLyrics();
		}
	}, [currentSongPath]); // Depending on Path is usually safer to prevent loops

	// 1. Dependency: Add currentSong to the dependency array to ensure the closure is fresh
	const fetchCurrentSongLyrics = useCallback(async () => {
		// CAPTURE HERE: Freezing the identity of the song requesting lyrics
		const targetSong = currentSong;
		const targetPath = currentSong?.path;

		if (!targetPath) return;

		if (!targetSong?.metadata?.title || !targetSong?.metadata?.artist) {
			setLoading(false);
			return;
		}

		setLoading(true);

		const { title, artist } = targetSong.metadata;
		const searchTitle = title?.includes("(") ? title.split("(")[0] : title;

		await invoke<LrcLibLyric>("fetch_synced_lyrics", {
			track: searchTitle,
			artist: artist,
		})
			.then((data) => {
				const { syncedLyrics } = data;
				if (!syncedLyrics) return;

				const lyricsWithSecond = parseLRC(syncedLyrics, duration);

				// USE CAPTURED PATH: Even if 'currentSong' has changed to Song B,
				// 'targetPath' is still Song A. This puts the data in the correct place.
				updateSongLyrics(targetPath, lyricsWithSecond);

				// UI SYNC: Only update the visual lyrics if the user is STILL listening to this song
				if (currentSongPath === targetPath) {
					setLyricsSegments(lyricsWithSecond);
				}
			})
			.catch((error) => {
				console.log("error fetching synced lyrics: ", error);
				// Only clear UI if we are still on the failing song
				if (currentSongPath === targetPath) {
					setActiveLineIndex(-1);
				}
			})
			.finally(() => {
				// Only stop loading if we are still on the same song
				if (currentSongPath === targetPath) {
					setLoading(false);
				}
			});
	}, [currentSong, currentSongPath, duration]); // Ensure dependencies are complete

	const handleUploadSongLyrics = async () => {
		if (!currentSong) return;

		// CAPTURE HERE
		const targetPath = currentSong.path;

		try {
			const selected = await open({
				multiple: false,
				title: "Select Lyric File (.lrc)",
				filters: [{ name: "Lyrics", extensions: ["lrc"] }],
			});

			if (!selected) return;

			const data = (await invoke("read_file_content", {
				filePath: selected,
			})) as string;

			const lyricsSegments = parseLRC(data, duration);

			// USE CAPTURED PATH
			updateSongLyrics(targetPath, lyricsSegments);

			// UI SYNC: Update view instantly if we are still on that song
			if (currentSongPath === targetPath) {
				setLyricsSegments(lyricsSegments);
			}
		} catch (error) {
			console.log("File selection error: ", error);
			alert("Error selecting file!");
		}
	};

	const updateSongLyrics = (path: string, lyricsData: LyricData[]) => {
		setPlaylist((prevPlaylist) =>
			prevPlaylist.map((song) =>
				song.path === path ? { ...song, lyrics: lyricsData } : song
			)
		);
	};

	const contextValue = {
		loading,
		lyricsSegments,
		activeLineIndex,
		setActiveLineIndex,
		handleUploadSongLyrics,
	};

	return (
		<LyricsContext.Provider value={contextValue}>
			{children}
		</LyricsContext.Provider>
	);
};

export const useLyricsContext = () => useContext(LyricsContext);
