import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { cn } from "../../libs/cn";

type LyricData = {
	startTime: number;
	endTime: number;
	lyric: string;
};

export function SongLyrics() {
	const { currentSong, currentTime, duration, audioRef, setCurrentTime } =
		usePlayerContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [lyricsSegmentIndex, setLyricsSegmentIndex] = useState<number>(-1);
	const [lyricsSegments, setLyricsSegments] = useState<LyricData[]>([]);

	const activeSegmentRef = useRef<HTMLParagraphElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Fetch lyrics using Tauri command
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
						setLyricsSegmentIndex(-1);
						setLyricsSegments([]);
						activeSegmentRef.current = null;
						return;
					})
					.finally(() => {
						setLoading(false);
					});
			} else {
				setLyricsSegmentIndex(-1);
				setLyricsSegments([]);
				setLoading(false);
				activeSegmentRef.current = null;
			}
		})();
	}, [currentSong, duration]);

	// Auto-scroll lyrics based on segments
	useEffect(() => {
		let newLineSegment = lyricsSegments.findIndex(
			(item) =>
				currentTime >= item.startTime && currentTime < item.endTime
		);

		const lastSegmentIndex = lyricsSegments.length - 1;

		if (newLineSegment === -1 && lastSegmentIndex >= 0) {
			const lastSegment = lyricsSegments[lastSegmentIndex];

			// If currentTime is past the start of the final line, keep it highlighted indefinitely.
			if (currentTime >= lastSegment.startTime) {
				newLineSegment = lastSegmentIndex;
			}
		}

		if (newLineSegment !== lyricsSegmentIndex) {
			if (newLineSegment >= 0 && newLineSegment < lyricsSegments.length) {
				if (activeSegmentRef.current && containerRef.current) {
					const activeElement = activeSegmentRef.current;
					const container = containerRef.current;

					// Calculate how far the line is from the top of the container
					const offsetTop =
						activeElement.offsetTop - container.offsetTop;

					// Smoothly scroll to center the active line
					container.scrollTop =
						offsetTop -
						container.clientHeight / 2 +
						activeElement.clientHeight / 2;
				}
				setLyricsSegmentIndex(newLineSegment);
			}
		}
	}, [lyricsSegments, lyricsSegmentIndex, currentTime]);

	return (
		<div
			ref={containerRef}
			className="border border-white/20 rounded-md shadow-xl md:max-h-[86.8vh] overflow-y-scroll flex flex-col flex-1 overscroll-none scroll-smooth"
		>
			<div className="flex-1 flex flex-col mix-blend-overlay scroll-smooth">
				<div className="sticky top-0 backdrop-blur-3xl bg-black/50 p-4 border-b border-white/20 flex items-center gap-4 justify-between">
					<h3 className="text-lg font-bold">Lyrics</h3>
				</div>
				{loading ? (
					<p className="self-center my-auto text-sm">
						Loading lyrics...
					</p>
				) : lyricsSegments?.length > 0 ? (
					<>
						{lyricsSegments.map((segment, index) => (
							<p
								ref={
									index === lyricsSegmentIndex
										? activeSegmentRef
										: null
								}
								key={index}
								className={cn(
									`whitespace-pre-wrap text-xs md:text-xl p-2 transition-colors duration-300 text-white/50 cursor-pointer hover:blur-none hover:text-white hover:font-semibold`,
									{
										"text-white font-semibold mix-blend-overlay":
											index === lyricsSegmentIndex,
										"blur-[1px]": checkLyricsPosition(
											index,
											lyricsSegmentIndex,
											2
										),
										"blur-[1.5px]": checkLyricsPosition(
											index,
											lyricsSegmentIndex,
											4
										),
									}
								)}
								onClick={() => {
									if (!audioRef || !audioRef.current) return;
									setCurrentTime(segment.startTime);
									audioRef.current.currentTime =
										segment.startTime;
								}}
							>
								{segment.lyric}
							</p>
						))}
					</>
				) : (
					<p className="self-center my-auto text-sm">
						No lyrics available for this song.
					</p>
				)}
			</div>
		</div>
	);
}

function parseLRC(lrcText: string, duration: number) {
	const lines = lrcText.trim().split("\n");
	const lyricData: LyricData[] = [];

	// Regex captures: [1]=minutes, [2]=seconds, [3]=milliseconds (2 or 3 digits)
	const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

	lines.forEach((line) => {
		let match;
		const matches = [];

		// Find all time tags in the line
		while ((match = timeRegex.exec(line)) !== null) {
			matches.push({
				minutes: parseInt(match[1], 10),
				seconds: parseInt(match[2], 10),
				msString: match[3], // Keep as string for precision handling
				index: timeRegex.lastIndex,
			});
		}

		// Extract the text portion after the last time tag
		const text = line
			.substring(
				matches.length > 0 ? matches[matches.length - 1].index : 0
			)
			.trim();

		if (text.length === 0) return; // Skip empty lines

		matches.forEach((m) => {
			const { minutes, seconds, msString } = m;

			// CRITICAL: Convert milliseconds to three digits (e.g., "39" -> 390, "750" -> 750)
			// This ensures "01:05.39" is 390ms, not 39ms.
			const ms = parseInt(msString.padEnd(3, "0"), 10);

			// Convert total time to seconds (floating point)
			const totalSeconds = minutes * 60 + seconds + ms / 1000;

			lyricData.push({
				startTime: totalSeconds,
				lyric: text,
				endTime: duration, // set end time to duration for the last segment end time. to be at the song duration.
			});
		});
	});

	// Sort by time to ensure correct order
	lyricData.sort((a, b) => a.startTime - b.startTime);

	for (let i = 0; i < lyricData.length; i++) {
		if (i < lyricData.length - 1) {
			// Set end time to the start time of the subsequent line
			lyricData[i].endTime = lyricData[i + 1].startTime;
		} else {
			// For the last line, set a default end time to song duration
			lyricData[i].endTime = duration;
		}
	}

	return lyricData;
}

function checkLyricsPosition(
	currentLineIndex: number,
	activeLineIndex: number,
	distance: number
) {
	return (
		currentLineIndex > activeLineIndex + distance ||
		currentLineIndex < activeLineIndex - distance
	);
}
