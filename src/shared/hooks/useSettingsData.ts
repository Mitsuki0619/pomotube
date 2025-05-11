import type { Settings } from "../types/settings";
import { useChromeStorage } from "./useChromeStorage";

export const useSettingsData = () => {
	const [settings, setSettings] = useChromeStorage("settings");
	const parsedSettings = settings
		? (JSON.parse(settings) as Settings)
		: undefined;

	const updateSettings = (newSettings: Partial<Settings>) => {
		const updatedSettings = { ...parsedSettings, ...newSettings };
		setSettings(JSON.stringify(updatedSettings));
		chrome.runtime.sendMessage({
			action: "loadSettings",
		});
	};

	return { settings: parsedSettings, updateSettings };
};
