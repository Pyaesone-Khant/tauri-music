import { useMediaQuery } from "@mantine/hooks";
import { animate } from "framer-motion";
// @ts-ignore
import { zg2uni } from "rabbit-node/index";

import { Button } from "@mantine/core";
import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { KaraokeLine } from "../../components/KaraokeLine";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { cn } from "../../libs/cn";
import { isZawgyiCode } from "../../services/check-zawgyi";
import { useLyricsContext } from "../contexts/LyricsContext";

export function SongLyrics() {
	const { currentTime, audioRef, setCurrentTime, currentSong } =
		usePlayerContext();

	const {
		loading,
		lyricsSegments,
		activeLineIndex,
		setActiveLineIndex,
		handleUploadSongLyrics,
	} = useLyricsContext();

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

					const offsetTop =
						activeElement.offsetTop - container.offsetTop;

					// Target scroll position
					const target =
						offsetTop -
						(isLargerDevice
							? container.clientHeight / 2 -
							  activeElement.clientHeight / 2
							: activeElement.clientHeight);

					animate(container.scrollTop, target, {
						duration: 0.4,
						ease: "easeOut",
						onUpdate: (v) => (container.scrollTop = v),
					});
				}
			}
			setActiveLineIndex(newLineSegment);
		}
	}, [currentTime, isLargerDevice]);

	return (
		<div
			ref={containerRef}
			className=" max-h-[93vh] max-md:max-h-[65vh] overflow-y-scroll flex-1 flex flex-col scroll-smooth"
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
								}
							)}
							onClick={() => {
								if (!audioRef || !audioRef.current) return;
								setCurrentTime(segment.startTime);
								audioRef.current.currentTime =
									segment.startTime;
							}}
						>
							<KaraokeLine
								text={
									isZawgyiCode(segment.lyric)
										? zg2uni(segment.lyric)
										: segment.lyric
								}
								isActive={index === activeLineIndex}
								index={index}
								activeLineIndex={activeLineIndex}
							/>
						</p>
					))}
				</>
			) : (
				<div className="my-auto self-center space-y-3 flex flex-col items-center max-w-md text-center">
					<div className="mix-blend-overlay space-y-3">
						<p>No lyrics available for this song.</p>

						<p>
							You can provide custom lyrics file (formatted with
							.lrc),
							<br />
							if you have one.
						</p>
					</div>

					{currentSong && (
						<Button
							leftSection={<Upload size={16} />}
							variant="white"
							className="mt-6 mix-blend-luminosity!"
							onClick={handleUploadSongLyrics}
						>
							Upload
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
