import { ActionIcon } from "@mantine/core";
import { DynamicIcon } from "lucide-react/dynamic";
import { usePlayerContext } from "../../contexts/PlayerContext";

export function Controls() {
	const { playNext, playPrevious, onTogglePlayPause, isPlaying, playlist } =
		usePlayerContext();

	const disabled = playlist.length === 0;

	return (
		<div className="flex items-center justify-center gap-2 mix-blend-luminosity">
			<ActionIcon
				size={"xl"}
				onClick={playPrevious}
				disabled={disabled}
				radius={"xl"}
				bg={"transparent"}
				aria-label="Previous"
				title="Previous"
			>
				<DynamicIcon name="skip-back" size={20} />
			</ActionIcon>
			<ActionIcon
				size={"input-lg"}
				onClick={onTogglePlayPause}
				disabled={disabled}
				radius={"xl"}
				aria-label={isPlaying ? "Pause" : "Play"}
				title={isPlaying ? "Pause" : "Play"}
			>
				<DynamicIcon name={isPlaying ? "pause" : "play"} size={24} />
			</ActionIcon>
			<ActionIcon
				size={"xl"}
				onClick={playNext}
				disabled={disabled}
				radius={"xl"}
				bg={"transparent"}
				aria-label="Next"
				title="Next"
			>
				<DynamicIcon name="skip-forward" size={20} />
			</ActionIcon>
		</div>
	);
}
