import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Text } from "@mantine/core";
import { ListMusic } from "lucide-react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { SongCard } from "./SongCard";

export function Playlist() {
	const {
		selectMusicFiles,
		statusMessage,
		playlist,
		setPlaylist,
		setCurrentSongIndex,
	} = usePlayerContext();

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setPlaylist((items: Song[]) => {
				const oldIndex = items.findIndex(
					(item) => item.path === active.id
				);
				const newIndex = items.findIndex(
					(item) => item.path === over?.id
				);
				setCurrentSongIndex(newIndex);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

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
						<>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={playlist.map((song) => song.path)}
									strategy={verticalListSortingStrategy}
								>
									{playlist.map((song, index) => (
										<SongCard
											key={song.path}
											index={index}
											{...song}
										/>
									))}
								</SortableContext>
							</DndContext>
						</>
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
