import { invoke } from "@tauri-apps/api/core";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { parseLRC } from "../../services/parse-lrc";

type LyricsContextType = {
	loading: boolean;
	lyricsSegments: LyricData[];
	activeLineIndex: number;
	setActiveLineIndex: React.Dispatch<React.SetStateAction<number>>;
};

const LyricsContext = createContext<LyricsContextType>({
	loading: false,
	lyricsSegments: [],
	activeLineIndex: -1,
	setActiveLineIndex: () => {},
});

export const LyricsProvider = ({ children }: { children: React.ReactNode }) => {
	const { currentSong, duration } = usePlayerContext();

	const [loading, setLoading] = useState<boolean>(true);
	const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
	const [lyricsSegments, setLyricsSegments] = useState<LyricData[]>([]);

	// fetch lyrics if when the current song
	useEffect(() => {
		setActiveLineIndex(-1);
		(async () => {
			setLoading(true);
			if (currentSong?.metadata?.title && currentSong?.metadata?.artist) {
				// synced song lyrics with timestamps
				await invoke<LrcLibLyric>("fetch_synced_lyrics", {
					track: currentSong.metadata.title,
					artist: currentSong.metadata.artist,
				})
					.then((data) => {
						const { syncedLyrics } = data;
						if (!syncedLyrics) return null;
						const lyricsWithSecond = parseLRC(
							syncedLyrics,
							duration
						);
						setLyricsSegments(lyricsWithSecond);
					})
					.catch((error) => {
						console.log("error fetching synced lyrics: ", error);
						setActiveLineIndex(-1);
						setLyricsSegments([]);
						return;
					})
					.finally(() => {
						setLoading(false);
					});
			} else {
				setActiveLineIndex(-1);
				setLyricsSegments([]);
				setLoading(false);
			}
		})();
	}, [currentSong]);

	const contextValue = {
		loading,
		lyricsSegments,
		activeLineIndex,
		setActiveLineIndex,
	};

	return (
		<LyricsContext.Provider value={contextValue}>
			{children}
		</LyricsContext.Provider>
	);
};

export const useLyricsContext = () => useContext(LyricsContext);
