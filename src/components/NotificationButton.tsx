import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";

export function NotificationButton() {
	const showNotification = async () => {
		// 1. Check current permission status
		let permissionGranted = await isPermissionGranted();

		// 2. Request permission if not already granted
		if (!permissionGranted) {
			const permission = await requestPermission();
			permissionGranted = permission === "granted";
		}

		// 3. Send the notification if permission is available
		if (permissionGranted) {
			sendNotification({
				title: "ကျေးဇူးပါကွယ်",
				body: "ရင်မှာ ၀မ်းနည်းကြေကွဲ အသဲကွဲဖို့ ကံပါလာကြတယ်။",
				icon: "../assets/react.svg",
			});
			console.log("Notification sent successfully!");
		} else {
			console.warn("Notification permission was denied by the user.");
		}
	};

	return (
		<button onClick={showNotification}>Send Desktop Notification</button>
	);
}
