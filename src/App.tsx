// mantine styles
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import "./App.css";
import { PlayerProvider } from "./contexts/PlayerContext";
import { Player } from "./music-player";
import { LyricsProvider } from "./music-player/contexts/LyricsContext";
import { theme } from "./services/theme";

function App() {
	useEffect(() => {
		if ("Notification" in window) {
			console.log("Notifications are supported!");
			Notification.requestPermission().then((permission) => {
				console.log(`Notification permission: ${permission}`);
				if (permission === "granted") {
					console.log("Noti permission granted!");
				} else {
					console.log("Notification permission denied.");
				}
			});
		} else {
			console.log("Notifications are not supported in this browser.");
		}
	}, []);

	return (
		<MantineProvider theme={theme}>
			<main>
				<PlayerProvider>
					<LyricsProvider>
						<Player />
					</LyricsProvider>
				</PlayerProvider>
			</main>
		</MantineProvider>
	);
}

export default App;
