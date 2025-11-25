import { MarqueeText } from "../../components";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { extractSpecificMetadata } from "../../libs/utils";
import { Controls } from "./Controls";
import { CoverImage } from "./CoverImage";
import { PlaybackProgress } from "./PlaybackProgress";

export function SongPlayer() {
	const { currentSong } = usePlayerContext();

	return (
		<div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 rounded-md">
			<div className="shadow-xl">
				<CoverImage
					base64_cover={
						extractSpecificMetadata(currentSong, "base64_cover") as
							| string
							| null
					}
				/>
			</div>
			<div className="col-span-2 max-sm:col-span-1 flex flex-col p-4 border border-white/20 rounded-md shadow-xl gap-6">
				<article className="space-y-1">
					<MarqueeText
						classNames={{
							text: "text-xl font-semibold whitespace-nowrap mix-blend-overlay",
						}}
						isAnimated={false}
					>
						{extractSpecificMetadata(currentSong, "title") ||
							currentSong?.name ||
							"Unknown Title"}
					</MarqueeText>
					<MarqueeText
						classNames={{
							text: "whitespace-nowrap truncate mix-blend-overlay",
						}}
						isAnimated={false}
					>
						{extractSpecificMetadata(currentSong, "artist") ||
							"Unknown Artist"}{" "}
						|{" "}
						{extractSpecificMetadata(currentSong, "album") ||
							"Unknown Album"}
					</MarqueeText>
					<MarqueeText
						classNames={{
							text: "mix-blend-overlay opacity-60",
						}}
						isAnimated={false}
					>
						Released:{" "}
						{extractSpecificMetadata(currentSong, "year") ||
							"Unknown Year"}
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
