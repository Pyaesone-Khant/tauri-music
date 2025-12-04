import { useEffect, useRef } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { cn } from "../../libs/cn";
import { useLyricsContext } from "../contexts/LyricsContext";

export function SongLyrics() {
	const { currentTime, audioRef, setCurrentTime } = usePlayerContext();

	const { loading, lyricsSegments, activeLineIndex, setActiveLineIndex } =
		useLyricsContext();

	const activeSegmentRef = useRef<HTMLParagraphElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

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

		if (newLineSegment !== activeLineIndex) {
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
				setActiveLineIndex(newLineSegment);
			}
		}
	}, [currentTime]);

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
									index === activeLineIndex
										? activeSegmentRef
										: null
								}
								key={index}
								className={cn(
									`whitespace-pre-wrap text-[1.5rem] p-2 transition-colors duration-300 text-white/50 cursor-pointer hover:blur-none hover:text-white hover:font-semibold`,
									{
										"text-white font-semibold mix-blend-overlay":
											index === activeLineIndex,
										"blur-[1px]": checkLyricsPosition(
											index,
											activeLineIndex,
											2
										),
										"blur-[1.5px]": checkLyricsPosition(
											index,
											activeLineIndex,
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

function checkLyricsPosition(
	lineIndex: number,
	activeLineIndex: number,
	distance: number
) {
	return (
		lineIndex > activeLineIndex + distance ||
		lineIndex < activeLineIndex - distance
	);
}
