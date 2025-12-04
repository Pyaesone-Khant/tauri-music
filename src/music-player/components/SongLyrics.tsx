import { useMediaQuery } from "@mantine/hooks";
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

	const isLargerDevice = useMediaQuery("(min-width: 1024px)");

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

					console.log("offset top: ", offsetTop);
					console.log("container offset top: ", container.offsetTop);
					console.log(
						"active element offset top: ",
						activeElement.offsetTop
					);
					console.log("container height: ", container.clientHeight);

					// Smoothly scroll to center the active line
					container.scrollTop =
						offsetTop -
						(isLargerDevice
							? activeElement.offsetTop / 2 + container.offsetTop
							: activeElement.clientHeight / 3);
				}
			}
			setActiveLineIndex(newLineSegment);
		}
	}, [currentTime, isLargerDevice]);

	return (
		<div
			ref={containerRef}
			className=" max-h-[93vh] max-md:max-h-[65vh] overflow-y-scroll flex-1 flex flex-col mix-blend-overlay scroll-smooth"
		>
			{loading ? (
				<p className="self-center my-auto text-sm animate-ping">
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
								`whitespace-pre-wrap w-fit text-[1.5rem] p-2 transition-colors duration-300 text-white/50 cursor-pointer hover:blur-none hover:text-white hover:font-semibold`,
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
							style={{
								opacity: checkLyricsPosition(
									index,
									activeLineIndex,
									6
								)
									? 0.5
									: 1,
							}}
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
