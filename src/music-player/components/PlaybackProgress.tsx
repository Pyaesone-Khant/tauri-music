import { Slider } from "@mantine/core";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { formatTime } from "../../libs/utils";

export function PlaybackProgress() {
	const { currentSong, audioRef, currentTime, setCurrentTime, duration } =
		usePlayerContext();

	const handleSkipTime = (newTime: number) => {
		if (!(audioRef && audioRef.current)) return;
		setCurrentTime(newTime);
		audioRef.current.currentTime = newTime;
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm font-mono mix-blend-overlay">
				<span>{formatTime(currentTime)}</span>
				<span>-{formatTime(duration - currentTime)}</span>
			</div>
			<Slider
				defaultValue={0}
				value={currentTime}
				max={duration}
				onChangeEnd={handleSkipTime}
				disabled={!currentSong}
				label={formatTime(currentTime)}
				size={"lg"}
				className=" mix-blend-luminosity"
			/>
		</div>
	);
}
