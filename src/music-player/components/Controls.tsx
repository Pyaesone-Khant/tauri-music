import { ActionIcon } from "@mantine/core";
import { DynamicIcon } from "lucide-react/dynamic";
import { usePlayerContext } from "../../contexts/PlayerContext";

export function Controls() {
	const {
		playNext,
		playPrevious,
		onTogglePlayPause,
		isPlaying,
		playlist,
		currentPlayMode,
		handleChangePlayMode,
	} = usePlayerContext();

	const disabled = playlist.length === 0;

	return (
		<div className="relative mt-2">
			<ActionIcon
				size={"xl"}
				radius={"xl"}
				aria-label={currentPlayMode}
				title={currentPlayMode}
				onClick={handleChangePlayMode}
				classNames={{
					root: "absolute! left-0 top-1/2 -translate-y-1/2 mix-blend-luminosity z-2",
				}}
			>
				<DynamicIcon name={currentPlayMode} size={20} />
			</ActionIcon>
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
					<DynamicIcon
						name={isPlaying ? "pause" : "play"}
						size={24}
					/>
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
		</div>
	);
}
