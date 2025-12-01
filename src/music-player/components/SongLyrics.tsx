import { NumberInput } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";

export function SongLyrics() {
	const { currentSong, currentTime, duration, audioRef } = usePlayerContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [scrollSpeed, setScrollSpeed] = useState<number>(0);
	const [lyricsSegmentIndex, setLyricsSegmentIndex] = useState<number>(-1);
	const [lyricsSegments, setLyricsSegments] = useState<string[]>([]);

	const activeSegmentRef = useRef<HTMLParagraphElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Fetch lyrics using Tauri command
		(async () => {
			setLoading(true);
			if (currentSong?.metadata?.title && currentSong?.metadata?.artist) {
				const fetchedSongLyrics = await invoke<string | null>(
					"get_song_lyrics",
					{
						songTitle: currentSong.metadata.title,
						artistName: currentSong.metadata.artist,
					}
				)
					.then((res) => {
						const rawLyrics = res?.includes("Read More")
							? res?.split("Read More")[1].trim()
							: `[Verse 1]\n` + res?.split("[Verse 1]")[1].trim();
						return rawLyrics;
					})
					.catch((err) => {
						console.error("Error fetching lyrics:", err);
						return null;
					})
					.finally(() => {
						setLoading(false);
					});

				const segments = fetchedSongLyrics
					? fetchedSongLyrics
							.split(/\n/)
							.filter(
								(line) =>
									!(
										line.startsWith("[") &&
										line.endsWith("]")
									)
							)
					: [];
				setLyricsSegments(segments);
				setLyricsSegmentIndex(0);
			} else {
				setLyricsSegmentIndex(-1);
				setLyricsSegments([]);
				setLoading(false);
			}
		})();
	}, [currentSong]);

	// Auto-scroll lyrics based on segments
	useEffect(() => {
		let totalChars = 0;
		const segmentsWithCharCount = lyricsSegments.map((text) => {
			const charCount = text.trim().length;
			totalChars += charCount;
			return { text, charCount };
		});

		let cumulativeTime = 0;
		const lyricsTimeMap = segmentsWithCharCount.map((segment) => {
			const proportion = segment.charCount / totalChars;
			const segmentDuration = proportion * duration;
			const startTime = cumulativeTime;
			const endTime = cumulativeTime + segmentDuration;
			cumulativeTime = endTime;
			return {
				text: segment.text,
				startTime: startTime,
				endTime: endTime,
				duration: segmentDuration, // Optional, for debugging
			};
		});

		const currentSegment = lyricsTimeMap.findIndex(
			(segment) =>
				currentTime >= segment.startTime &&
				currentTime < segment.endTime
		);

		if (currentSegment !== -1 && currentSegment !== lyricsSegmentIndex) {
			setLyricsSegmentIndex(currentSegment);
		}

		if (activeSegmentRef.current && containerRef.current) {
			const activeElement = activeSegmentRef.current;
			const container = containerRef.current;

			// Calculate how far the line is from the top of the container
			const offsetTop = activeElement.offsetTop - container.offsetTop;

			// Smoothly scroll to center the active line
			container.scrollTop =
				offsetTop -
				container.clientHeight / 2 +
				activeElement.clientHeight / 2;
		}
	}, [
		lyricsSegments,
		lyricsSegmentIndex,
		scrollSpeed,
		currentTime,
		duration,
	]);

	return (
		<div
			ref={containerRef}
			className="border border-white/20 rounded-md shadow-xl md:max-h-[86.8vh] overflow-y-scroll flex flex-col flex-1 overscroll-none scroll-smooth"
		>
			<div className="flex-1 flex flex-col mix-blend-overlay scroll-smooth">
				<div className="sticky top-0 backdrop-blur-3xl bg-black/50 p-4 border-b border-white/20 flex items-center gap-4 justify-between">
					<h3 className="text-lg font-bold">Lyrics</h3>

					<NumberInput
						classNames={{
							section: "w-20",
						}}
						className="w-28"
						step={100}
						suffix="ms"
						value={scrollSpeed}
						onChange={(value) =>
							setScrollSpeed(value ? Number(value) : 0)
						}
						aria-label="Scroll Speed"
						title="Scroll Speed"
						placeholder="Scroll Speed"
					/>
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
								className={`whitespace-pre-wrap text-sm md:text-xl p-2 transition-colors duration-300 ${
									index === lyricsSegmentIndex
										? "text-primary-200 font-semibold"
										: "text-white/80"
								}`}
							>
								{segment}
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
