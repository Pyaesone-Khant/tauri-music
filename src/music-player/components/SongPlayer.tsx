import { usePlayerContext } from "../../contexts/PlayerContext";
import { extractSpecificMetadata } from "../../libs/utils";
import { Controls } from "./Controls";
import { CoverImage } from "./CoverImage";
import { PlaybackProgress } from "./PlaybackProgress";

export function SongPlayer() {
	const { currentSong } = usePlayerContext();

	return (
		<div className="rounded-md md:max-w-lg mx-auto">
			<div className="grid md:grid-cols-1 grid-cols-3 gap-4">
				<CoverImage
					base64_cover={
						extractSpecificMetadata(currentSong, "base64_cover") as
							| string
							| null
					}
					className=""
				/>
				<article className="space-y-1 col-span-2">
					<h3 className="text-xl font-semibold whitespace-nowrap mix-blend-lighten">
						{extractSpecificMetadata(currentSong, "title") ||
							currentSong?.name ||
							"Unknown Title"}
					</h3>
					<p className="whitespace-nowrap truncate mix-blend-lighten">
						{extractSpecificMetadata(currentSong, "artist") ||
							"Unknown Artist"}{" "}
						|{" "}
						{extractSpecificMetadata(currentSong, "album") ||
							"Unknown Album"}
					</p>
					<p className="mix-blend-lighten opacity-60">
						Released:{" "}
						{extractSpecificMetadata(currentSong, "year") ||
							"Unknown Year"}
					</p>
				</article>
			</div>
			<div className="mt-6 space-y-4 max-md:fixed max-md:p-6 bottom-0 left-0 w-full z-10">
				<PlaybackProgress />
				<Controls />
			</div>
		</div>
	);
}
