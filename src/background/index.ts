import type { Settings } from "../shared/types/settings";

type TimerMode = "work" | "break" | "longBreak";
type TimerState = {
	mode: TimerMode;
	timeLeft: number;
	isActive: boolean;
	sessionCount: number;
	endTime: number;
};

// Initialize timer state
const timerState: TimerState = {
	mode: "work",
	timeLeft: 25 * 60, // Default to 25 minutes
	isActive: false,
	sessionCount: 0,
	endTime: 0,
};

// Load settings from storage
let settings: Settings = {
	workDuration: 25,
	breakDuration: 5,
	longBreakDuration: 15,
	sessionsBeforeLongBreak: 4,
	showNotifications: true,
	darkMode: false,
	workUrl: "",
	breakUrl: "",
	volume: 50,
	isMuted: false,
};

// Load settings from storage
const loadSettings = () => {
	chrome.storage.sync.get("settings", (data) => {
		if (data.settings) {
			settings = JSON.parse(data.settings);
			timerState.timeLeft = settings.workDuration * 60;
		}
	});
};

loadSettings();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
	if (changes.settings) {
		settings = changes.settings.newValue;

		// Only update timeLeft if timer is not active
		if (!timerState.isActive) {
			if (timerState.mode === "work") {
				timerState.timeLeft = settings.workDuration * 60;
			} else if (timerState.mode === "break") {
				timerState.timeLeft = settings.breakDuration * 60;
			} else if (timerState.mode === "longBreak") {
				timerState.timeLeft = settings.longBreakDuration * 60;
			}
		}
	}
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	switch (message.action) {
		case "getTimerState":
			sendResponse(timerState);
			break;
		case "startTimer":
			startTimer();
			sendResponse(timerState);
			break;
		case "stopTimer":
			stopTimer();
			sendResponse(timerState);
			break;
		case "resetTimer":
			resetTimer();
			sendResponse(timerState);
			break;
		case "changeMode":
			changeMode(message.mode);
			sendResponse(timerState);
			break;
		case "adjustTime":
			adjustTime(message.timeInSeconds);
			sendResponse(timerState);
			break;
		case "loadSettings":
			loadSettings();
			resetTimer();
			sendResponse({ success: true });
	}

	// Return true to indicate we will send a response asynchronously
	return true;
});

// Timer functions
function startTimer() {
	if (!timerState.isActive) {
		timerState.isActive = true;
		timerState.endTime = Date.now() + timerState.timeLeft * 1000;
		runTimer();
	}
}

function stopTimer() {
	timerState.isActive = false;
	// Update timeLeft based on current endTime
	const remaining = Math.max(0, (timerState.endTime - Date.now()) / 1000);
	timerState.timeLeft = Math.ceil(remaining);
}

function resetTimer() {
	timerState.isActive = false;
	timerState.mode = "work";
	timerState.sessionCount = 0;
	timerState.timeLeft = settings.workDuration * 60;
	timerState.endTime = 0;

	// Notify popup about state change
	notifyPopups();
}

function changeMode(newMode: TimerMode) {
	if (timerState.isActive) {
		stopTimer();
	}

	timerState.mode = newMode;

	// Set time based on mode
	if (newMode === "work") {
		timerState.timeLeft = settings.workDuration * 60;
	} else if (newMode === "break") {
		timerState.timeLeft = settings.breakDuration * 60;
	} else if (newMode === "longBreak") {
		timerState.timeLeft = settings.longBreakDuration * 60;
	}

	// Notify popup about state change
	notifyPopups();
}

function adjustTime(timeInSeconds: number) {
	if (timerState.isActive) {
		stopTimer();
	}

	timerState.timeLeft = timeInSeconds;

	// Notify popup about state change
	notifyPopups();
}

// Main timer loop
function runTimer() {
	if (!timerState.isActive) return;

	// Calculate current time left
	const now = Date.now();
	const remaining = Math.max(0, timerState.endTime - now);
	const remainingSeconds = Math.ceil(remaining / 1000);

	// Update state
	timerState.timeLeft = remainingSeconds;

	// Check if timer completed
	if (remaining <= 0) {
		handleTimerComplete();
	}

	// Notify any open popups about state change
	notifyPopups();

	// Schedule next tick
	if (timerState.isActive) {
		setTimeout(runTimer, 200);
	}
}

// Handle timer completion
function handleTimerComplete() {
	// Send notification
	if (settings.showNotifications) {
		const title =
			timerState.mode === "work"
				? "Work session completed!"
				: "Break time over!";
		const message =
			timerState.mode === "work" ? "Time for a break." : "Back to work!";

		try {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "/icons/icon-128.png",
				title,
				message,
			});
		} catch (error) {
			console.error("Failed to create notification:", error);
		}
	}

	// Handle mode change
	if (timerState.mode === "work") {
		timerState.sessionCount++;

		// Check if it's time for a long break
		if (timerState.sessionCount % settings.sessionsBeforeLongBreak === 0) {
			timerState.mode = "longBreak";
			timerState.timeLeft = settings.longBreakDuration * 60;
		} else {
			timerState.mode = "break";
			timerState.timeLeft = settings.breakDuration * 60;
		}
	} else {
		// After any break, go back to work mode
		timerState.mode = "work";
		timerState.timeLeft = settings.workDuration * 60;
	}

	// Set new end time
	timerState.endTime = Date.now() + timerState.timeLeft * 1000;
}

// Notify all open popups about state change
function notifyPopups() {
	chrome.runtime
		.sendMessage({
			action: "timerStateUpdate",
			state: timerState,
		})
		.catch((error) => {
			// Ignore error if no popup is listening
			if (
				error.message !==
				"Could not establish connection. Receiving end does not exist."
			) {
				console.error("Error notifying popups:", error);
			}
		});
}
