import { MarqueeText } from "../../components";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { extractSpecificMetadata } from "../../libs/utils";
import { Controls } from "./Controls";
import { CoverImage } from "./CoverImage";
import { PlaybackProgress } from "./PlaybackProgress";

export function SongPlayer() {
	const { currentSong } = usePlayerContext();

	return (
		<div className="grid grid-cols-3 gap-4 p-4 bg-primary/10 border-primary rounded-md">
			<CoverImage
				base64_cover={
					extractSpecificMetadata(currentSong, "base64_cover") as
						| string
						| null
				}
			/>
			<div className="col-span-2 flex flex-col p-4">
				<article className="space-y-1">
					<MarqueeText
						classNames={{
							text: "text-xl font-semibold text-primary-200 whitespace-nowrap",
						}}
						isAnimated={false}
					>
						{extractSpecificMetadata(currentSong, "title") ||
							currentSong?.name ||
							"Unknown Title"}
					</MarqueeText>
					<MarqueeText
						classNames={{
							text: "text-primary-200/70 whitespace-nowrap truncate",
						}}
						isAnimated={false}
					>
						{extractSpecificMetadata(currentSong, "artist") ||
							"Unknown Artist"}{" "}
						|{" "}
						{extractSpecificMetadata(currentSong, "album") ||
							"Unknown Album"}
					</MarqueeText>
				</article>

				<div className="mt-auto">
					<PlaybackProgress />
					<Controls />
				</div>
			</div>
		</div>
	);
}
