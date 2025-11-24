import { Button, Text } from "@mantine/core";
import { ListMusic } from "lucide-react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { SongCard } from "./SongCard";

export function Playlist() {
	const { selectMusicFiles, statusMessage, playlist } = usePlayerContext();

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
				>
					Add Music to Playlist
				</Button>
				<Text fs={"italic"} fz={"sm"} c="gray.3">
					{statusMessage || "No songs in the playlist."}
				</Text>
			</div>
			<div className="bg-primary/10 p-4 rounded-xl shadow-xl">
				<h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
					Playlist ({playlist.length} Tracks)
				</h3>
				<div className="max-h-80 overflow-y-auto space-y-2">
					{playlist.length > 0 ? (
						playlist.map((song, index) => (
							<SongCard key={song.path} index={index} {...song} />
						))
					) : (
						<p className="text-primary-300 p-4 text-center">
							Your playlist is empty. Click "Add Music to
							Playlist" to start adding your favorite songs.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
