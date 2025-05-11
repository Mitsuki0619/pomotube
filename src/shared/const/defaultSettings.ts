import type { Settings } from "@/shared/types/settings";

export const defaultSettings: Settings = {
	workDuration: 25,
	breakDuration: 5,
	longBreakDuration: 15,
	sessionsBeforeLongBreak: 4,
	workUrl: "",
	breakUrl: "",
	volume: 50,
	isMuted: false,
	darkMode: false,
	showNotifications: true,
};
