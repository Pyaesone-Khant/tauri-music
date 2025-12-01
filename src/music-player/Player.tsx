import { useHotkeys } from "@mantine/hooks";
import { useEffect } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import { useGetGradientBackgroundColor } from "../hooks/useGetColorFromPhoto";
import { useGetImage } from "../hooks/useGetImage";
import { cn } from "../libs/cn";
import { Playlist } from "./components/Playlist";
import { SongLyrics } from "./components/SongLyrics";
import { SongPlayer } from "./components/SongPlayer";
import "./style.css";

export function Player() {
	const { currentSong, audioRef, playNext, playPrevious } =
		usePlayerContext();

	const { isImageLoaded } = useGetImage(
		currentSong?.metadata?.base64_cover || null
	);

	const { gradientBackground } = useGetGradientBackgroundColor(
		currentSong?.metadata?.base64_cover || null
	);

	// Keyboard shortcuts
	useHotkeys([
		[
			"space",
			() => {
				if (audioRef?.current) {
					if (audioRef.current.paused) {
						audioRef.current.play();
					} else {
						audioRef.current.pause();
					}
				}
			},
		],
		[
			"F7",
			() => {
				playPrevious();
			},
		],
		[
			"F9",
			() => {
				playNext();
			},
		],
	]);

	// Media Session API integration
	useEffect(() => {
		if (!audioRef?.current) return;
		if ("mediaSession" in navigator) {
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				playPrevious();
			});
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				playNext();
			});
		}
	}, [audioRef, playNext, playPrevious]);

	return (
		<div
			className={cn(
				"min-h-screen flex flex-col text-white p-4 md:p-8 font-sans antialiased",
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
			<div className="max-w-6xl mx-auto grid grid-cols-6 max-md:grid-cols-1 gap-8 flex-1">
				<div className="col-span-4 max-md:col-span-1 space-y-8 flex flex-col">
					<SongPlayer />
					<Playlist />
				</div>
				<div className="col-span-2 max-md:col-span-1 flex flex-col">
					<SongLyrics />
				</div>
			</div>
		</div>
	);
}
