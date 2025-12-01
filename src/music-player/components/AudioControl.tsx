import { Slider } from "@mantine/core";
import { useState } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";

export function AudioControl() {
	const { audioRef } = usePlayerContext();

	const [currentVolume, setCurrentVolume] = useState(50);

	const handleVolumeChange = (value: number) => {
		if (!audioRef || !audioRef.current) return;

		setCurrentVolume(value);
		audioRef.current.volume = value / 100;
	};

	return (
		<div>
			<Slider
				value={currentVolume}
				onChange={handleVolumeChange}
				min={0}
				max={100}
			/>
		</div>
	);
}
