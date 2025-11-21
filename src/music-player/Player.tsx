import { convertFileSrc } from "@tauri-apps/api/core";
import { open, OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import {
	ListMusic,
	Music,
	Pause,
	Play,
	SkipBack,
	SkipForward,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../libs/cn";
import { formatTime } from "../libs/utils";
import "./style.css";

type Song = {
	path: string;
	url: string;
	name: string;
};

export function Player() {
	const [playlist, setPlaylist] = useState<Song[]>([]);
	const [currentSongIndex, setCurrentSongIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	// New state for progress bar
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const audioRef = useRef<HTMLAudioElement | null>(null);

	const currentSong = playlist[currentSongIndex] || null;

	/**
	 * Loads and plays a song by index.
	 * @param {number} index
	 */
	const loadSong = useCallback(
		(index: number) => {
			if (index >= 0 && index < playlist.length) {
				setCurrentSongIndex(index);
				setIsPlaying(false); // Reset playback state temporarily

				// Ensure the audio element exists and is linked to the new source
				if (audioRef.current) {
					console.log(audioRef.current);

					audioRef.current.src = playlist[index].url;
					audioRef.current.load();

					// Use a timeout to ensure the media is ready to play
					setTimeout(() => {
						// @ts-ignore
						audioRef.current
							.play()
							.then(() => setIsPlaying(true))
							.catch((error) => {
								// This will likely fail in the web preview, but is correct for Tauri
								console.error("Autoplay failed:", error);
								setStatusMessage(
									"Playback blocked. Click Play to start (or check Tauri config)."
								);
								setIsPlaying(false);
							});
					}, 100);
				}
			}
		},
		[playlist]
	);

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				setIsPlaying(false);
			} else {
				audioRef.current
					.play()
					.then(() => setIsPlaying(true))
					.catch((error) => {
						console.error("Error playing audio:", error);
						setStatusMessage(
							"Cannot play this file. Check file type and Tauri permissions."
						);
						setIsPlaying(false);
					});
			}
		}
	};

	const playNext = () => {
		if (playlist.length > 0) {
			const nextIndex = (currentSongIndex + 1) % playlist.length;
			loadSong(nextIndex);
		}
	};

	const playPrevious = () => {
		if (playlist.length > 0) {
			const prevIndex =
				(currentSongIndex - 1 + playlist.length) % playlist.length;
			loadSong(prevIndex);
		}
	};

	// Effect to handle automatic playback of the next song
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleSongEnd = () => {
			console.log("Song ended, playing next.");
			playNext();
		};

		audio.addEventListener("ended", handleSongEnd);

		return () => {
			audio.removeEventListener("ended", handleSongEnd);
		};
	}, [playNext]);

	// --- File Dialog and Loading ---
	const selectMusicFiles = async () => {
		setStatusMessage("Opening file dialog...");
		try {
			/** @type {string | string[] | null} */
			const selected = (await open({
				multiple: true,
				title: "Select Music Files",
				filters: [
					{
						name: "Audio",
						extensions: ["mp3", "wav", "ogg", "flac"],
					},
				],
			})) as OpenDialogOptions;

			if (!selected) {
				setStatusMessage(
					"File selection cancelled or Tauri API not available."
				);
				return;
			}

			console.log(selected);

			// Ensure selected is always an array of paths
			const paths = Array.isArray(selected) ? selected : [selected];

			const newSongs = paths.map((path) => ({
				path,
				url: convertFileSrc(path), // Convert the native path to a Tauri-compatible asset URL
				name: path.split(/[/\\]/).pop(), // Extract the file name
			}));

			// Add new songs to the playlist
			setPlaylist((prev) => [...prev, ...newSongs]);
			setStatusMessage(`${newSongs.length} songs added to the playlist.`);

			// If no song is currently playing, load the first one added
			if (currentSongIndex === -1 && newSongs.length > 0) {
				loadSong(0);
			}
		} catch (error) {
			console.error("Tauri dialog error:", error);
			setStatusMessage(
				"Error selecting files. Check Tauri configuration and permissions."
			);
		}
	};

	// playback progress handlers
	// New handler: Update currentTime state as audio plays
	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	// New handler: Get duration once metadata is loaded
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	};

	// New handler: Allows user to seek (drag) the playback position
	const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
		// The value from the range input is always a string, so we parse it to float
		const seekTime = parseFloat(event.target.value);
		if (audioRef.current && !isNaN(seekTime)) {
			audioRef.current.currentTime = seekTime;
			setCurrentTime(seekTime); // Optimistically update UI immediately
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans antialiased">
			{/* Tailwind CSS Script Tag is assumed to be in the index.html for React projects */}
			<h1 className="text-3xl font-extrabold mb-8 text-center text-indigo-400">
				Gucxx Music
			</h1>

			<div className="max-w-4xl mx-auto space-y-8">
				{/* Playback Status and Controls */}
				<div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-indigo-700/50">
					<p className="text-xs text-indigo-400 font-semibold mb-2">
						NOW PLAYING
					</p>
					<div className="flex items-center space-x-4">
						<Music className="w-8 h-8 text-indigo-500" />
						<div className="flex-1 overflow-hidden">
							<h2 className="text-xl font-bold truncate">
								{currentSong
									? currentSong.name
									: "No song selected"}
							</h2>
						</div>
					</div>

					{/* Progress Bar (Slider) */}
					<div className="flex items-center space-x-4 my-6">
						<span className="text-sm font-mono text-gray-400 w-12 text-right">
							{formatTime(currentTime)}
						</span>

						{/* Range Input for Seeking */}
						{/* <input
							type="range"
							min="0"
							max={duration || 0}
							value={currentTime}
							onChange={handleSeek}
							disabled={!currentSong}
							className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-700 disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg
							[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
						/> */}

						<input
							type="range"
							min={0}
							max={duration || 0}
							value={currentTime}
							onChange={handleSeek}
							disabled={!currentSong}
							className="flex-1"
						/>

						<span className="text-sm font-mono text-gray-400 w-12 text-left">
							{formatTime(duration)}
						</span>
					</div>

					<div className="flex justify-center items-center space-x-6 mt-6">
						<button
							onClick={playPrevious}
							disabled={playlist.length === 0}
							className="p-3 rounded-full bg-gray-700 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
							title="Previous Song"
						>
							<SkipBack className="w-6 h-6" />
						</button>
						<button
							onClick={togglePlayPause}
							disabled={playlist.length === 0}
							className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/30"
							title={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? (
								<Pause className="w-8 h-8" />
							) : (
								<Play className="w-8 h-8 fill-white" />
							)}
						</button>
						<button
							onClick={playNext}
							disabled={playlist.length === 0}
							className="p-3 rounded-full bg-gray-700 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
							title="Next Song"
						>
							<SkipForward className="w-6 h-6" />
						</button>
					</div>
				</div>

				{/* Action Button and Status */}
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
					<button
						onClick={selectMusicFiles}
						className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
					>
						<ListMusic className="w-5 h-5" />
						<span>Add Files to Library</span>
					</button>
					<p className="text-sm text-gray-400 italic mt-2">
						{statusMessage}
					</p>
				</div>

				{/* Playlist / Song List */}
				<div className="bg-gray-800 p-4 rounded-xl shadow-xl">
					<h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
						Playlist ({playlist.length} Tracks)
					</h3>
					<div className="max-h-80 overflow-y-auto space-y-2">
						{playlist.length === 0 ? (
							<p className="text-gray-500 text-center py-4">
								Your playlist is empty. Click "Add Files" to
								start.
							</p>
						) : (
							playlist.map((song, index) => (
								<div
									key={song.path}
									onClick={() => loadSong(index)}
									className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
										index === currentSongIndex
											? "bg-indigo-700/50 border-l-4 border-indigo-400 font-semibold"
											: "hover:bg-gray-700"
									}`}
								>
									<span className="w-8 text-center text-sm font-mono text-gray-400 mr-4">
										{index + 1}.
									</span>
									<span className="truncate flex-1">
										{song.name}
									</span>
									{index === currentSongIndex && (
										<div className="playing">
											{Array(5)
												.fill(0)
												.map((_, i) => (
													<div
														key={i}
														className={cn(
															`audio-bar ${
																isPlaying
																	? `bar-${
																			i +
																			1
																	  }`
																	: `bar-paused`
															}`
														)}
													/>
												))}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Hidden HTML Audio Element - the playback engine */}
			<audio
				ref={audioRef}
				className="hidden"
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
			/>
		</div>
	);
}
