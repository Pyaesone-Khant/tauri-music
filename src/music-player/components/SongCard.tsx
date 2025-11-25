import { memo } from "react";
import { MarqueeText } from "../../components";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { cn } from "../../libs/cn";
import { extractSpecificMetadata } from "../../libs/utils";
import "../style.css";
import { CoverImage } from "./CoverImage";

export const SongCard = memo((props: Song & { index: number }) => {
	const { currentSongIndex, isPlaying, onLoadSong } = usePlayerContext();

	const { index } = props;

	return (
		<div
			onClick={() => onLoadSong(index)}
			className={cn(
				"flex items-center p-3 rounded-lg cursor-pointer transition border-l-4 border-transparent mix-blend-luminosity gap-2",
				{
					"bg-primary-800 border-l-4 border-white/70 font-medium":
						index === currentSongIndex,
					"hover:bg-primary-800/30": index !== currentSongIndex,
				}
			)}
		>
			<span className="w-8 text-center text-sm font-mono mix-blend-difference">
				{index + 1}.
			</span>
			<div className="flex flex-1 items-center gap-2 pr-2 overflow-hidden">
				<CoverImage
					base64_cover={
						extractSpecificMetadata(props, "base64_cover") as
							| string
							| null
							| undefined
					}
					className="w-12 bg-primary-100"
					iconSize={20}
				/>
				<article className="space-y-0.5 flex-1">
					<MarqueeText
						isAnimated={index === currentSongIndex && isPlaying}
					>
						{extractSpecificMetadata(props, "title") ||
							props.name ||
							"Unknown Title"}
					</MarqueeText>
					<MarqueeText
						isAnimated={index === currentSongIndex && isPlaying}
						classNames={{
							text: "text-sm",
						}}
					>
						{extractSpecificMetadata(props, "artist") ||
							"Unknown Artist"}{" "}
						|{" "}
						{extractSpecificMetadata(props, "album") ||
							"Unknown Album"}
					</MarqueeText>
				</article>
			</div>
			{index === currentSongIndex && (
				<SongBarAnimation isPlaying={isPlaying} />
			)}
		</div>
	);
});

SongCard.displayName = "SongCard";

const SongBarAnimation = ({ isPlaying }: { isPlaying: boolean }) => {
	return (
		<div className="playing">
			{Array(5)
				.fill(0)
				.map((_, i) => (
					<div
						key={i}
						className={cn(
							`audio-bar ${
								isPlaying ? `bar-${i + 1}` : `bar-paused`
							}`
						)}
					/>
				))}
		</div>
	);
};
