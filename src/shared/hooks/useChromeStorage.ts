import { useEffect, useState } from "react";

export const useChromeStorage = (key: string) => {
	const [storageState, setStorageState] = useState<string>();
	useEffect(() => {
		chrome.storage.sync.get(key).then((result) => {
			setStorageState(result[key]);
		});
	}, [key]);

	const updateStorageState = (newValue: string) => {
		chrome.storage.sync.set({ [key]: newValue });
		setStorageState(newValue);
	};

	return [storageState, updateStorageState] as const;
};
