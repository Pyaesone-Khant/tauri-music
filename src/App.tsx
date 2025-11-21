import { useEffect } from "react";
import "./App.css";
import { Player } from "./music-player";

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
		<main>
			<Player />
		</main>
	);
}

export default App;
