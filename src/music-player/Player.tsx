import { usePlayerContext } from "../contexts/PlayerContext";
import { useGetGradientBackgroundColor } from "../hooks/useGetColorFromPhoto";
import { useGetImage } from "../hooks/useGetImage";
import { cn } from "../libs/cn";
import { Playlist } from "./components/Playlist";
import { SongPlayer } from "./components/SongPlayer";
import "./style.css";

export function Player() {
	const { currentSong } = usePlayerContext();

	const { isImageLoaded } = useGetImage(
		currentSong?.metadata?.base64_cover || null
	);

	const { gradientBackground } = useGetGradientBackgroundColor(
		currentSong?.metadata?.base64_cover || null
	);

	return (
		<div
			className={cn(
				"min-h-screen text-white p-4 md:p-8 font-sans antialiased",
				{
					"bg-linear-to-br from-primary-950 via-red-900 to-purple-950":
						true,
				}
			)}
			style={{
				background:
					currentSong && gradientBackground && isImageLoaded
						? `linear-gradient(135deg, ${gradientBackground})`
						: undefined,
			}}
		>
			<h1 className="text-3xl font-extrabold mb-8 text-center mx-auto mix-blend-overlay ">
				Tauri Music
			</h1>
			<div className="max-w-4xl mx-auto space-y-8">
				<SongPlayer />
				<Playlist />
			</div>
		</div>
	);
}
