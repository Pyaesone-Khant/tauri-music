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
	const { currentSong, audioRef, playNext, playPrevious, showLyrics } =
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
			<div className="flex max-lg:flex-col flex-1 gap-4 px-4">
				<div className="lg:flex-1 lg:self-center">
					<SongPlayer />
				</div>
				<div className="flex-1 flex">
					{showLyrics ? <SongLyrics /> : <Playlist />}
				</div>
			</div>
		</div>
	);
}
