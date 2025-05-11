interface Settings {
	workDuration: number;
	breakDuration: number;
	longBreakDuration: number;
	sessionsBeforeLongBreak: number;
	workUrl: string;
	breakUrl: string;
	volume: number;
	isMuted: boolean;
	darkMode: boolean;
	showNotifications: boolean;
}

export type { Settings };
