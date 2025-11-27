import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";
import { MarqueeText } from "../../components";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { cn } from "../../libs/cn";
import { extractSpecificMetadata } from "../../libs/utils";
import "../style.css";
import { CoverImage } from "./CoverImage";

export const SongCard = memo((props: Song & { index: number }) => {
	const { index, path } = props;

	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.path, disabled: index === 0 });

	const { currentSongPath, isPlaying, onLoadSong, playlist } =
		usePlayerContext();

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<div className="relative">
				<div
					onClick={() => onLoadSong(path)}
					className={cn(
						"flex items-center p-3 rounded-lg cursor-pointer transition border-l-4 border-transparent mix-blend-luminosity gap-2",
						{
							"bg-primary-950 border-white font-medium":
								path === currentSongPath,
							"hover:bg-primary-950/30": path !== currentSongPath,
						}
					)}
				>
					<div
						{...listeners}
						{...attributes}
						className={cn(
							"w-8 text-center text-sm font-mono mix-blend-exclusion cursor-move self-stretch flex flex-col items-center justify-center pointer-events-auto",
							{
								"cursor-auto pointer-events-none": index === 0,
							}
						)}
					>
						<ChevronUp
							size={16}
							className={cn({
								" opacity-0 ": index === 0,
							})}
						/>
						<span className="mix-blend-exclusion">{index + 1}</span>
						<ChevronDown
							size={16}
							className={cn({
								" opacity-0 ":
									index === 0 ||
									index === playlist.length - 1,
							})}
						/>
					</div>
					<div className="flex flex-1 items-center gap-2 pr-2 overflow-hidden">
						<CoverImage
							base64_cover={
								extractSpecificMetadata(
									props,
									"base64_cover"
								) as string | null | undefined
							}
							className="w-12 bg-primary-100"
							iconSize={20}
						/>
						<article className="space-y-0.5 flex-1">
							<MarqueeText
								isAnimated={
									path === currentSongPath && isPlaying
								}
							>
								{extractSpecificMetadata(props, "title") ||
									props.name ||
									"Unknown Title"}
							</MarqueeText>
							<MarqueeText
								isAnimated={
									path === currentSongPath && isPlaying
								}
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
					{path === currentSongPath && (
						<SongBarAnimation isPlaying={isPlaying} />
					)}
				</div>
			</div>
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
