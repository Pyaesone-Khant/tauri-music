import { Button, Text } from "@mantine/core";
import { ListMusic } from "lucide-react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { SongCard } from "./SongCard";

export function Playlist() {
	const { selectMusicFiles, statusMessage, playlist, currentSongIndex } =
		usePlayerContext();

	console.log(currentSongIndex);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<Button
					leftSection={<ListMusic />}
					onClick={selectMusicFiles}
					size="md"
					variant="white"
					aria-label="Add Music to Playlist"
					title="Add Music to Playlist"
					className=" mix-blend-hard-light "
				>
					Add Music to Playlist
				</Button>
				<Text fs={"italic"} fz={"sm"} c="gray.3">
					{statusMessage || "No songs in the playlist."}
				</Text>
			</div>
			<div className="bg-blend-luminosity p-4 rounded-md shadow-xl border border-white/20">
				<h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-4 mix-blend-overlay ">
					Playlist ({playlist.length} Tracks)
				</h3>
				<div className="max-h-80 overflow-y-auto space-y-2">
					{playlist.length > 0 ? (
						playlist.map((song, index) => (
							<SongCard key={song.path} index={index} {...song} />
						))
					) : (
						<p className="p-4 text-center mix-blend-overlay">
							Your playlist is empty. Click "Add Music to
							Playlist" to start adding your favorite songs.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
