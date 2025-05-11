import { useCallback, useEffect, useState } from "react";

type TimerMode = "work" | "break" | "longBreak";
type TimerState = {
	mode: TimerMode;
	timeLeft: number;
	isActive: boolean;
	sessionCount: number;
};

export function useBackgroundTimer() {
	const [timerState, setTimerState] = useState<TimerState>({
		mode: "work",
		timeLeft: 0,
		isActive: false,
		sessionCount: 0,
	});

	// Initialize timer state from background
	useEffect(() => {
		const fetchInitialState = async () => {
			try {
				const response = await chrome.runtime.sendMessage({
					action: "getTimerState",
				});
				// Validate response to avoid null/undefined values
				if (response && typeof response === "object") {
					setTimerState((prev) => ({
						mode: response.mode || prev.mode,
						// Ensure timeLeft is a number, default to prev value if not
						timeLeft:
							typeof response.timeLeft === "number"
								? response.timeLeft
								: prev.timeLeft,
						isActive:
							typeof response.isActive === "boolean"
								? response.isActive
								: prev.isActive,
						sessionCount:
							typeof response.sessionCount === "number"
								? response.sessionCount
								: prev.sessionCount,
					}));
				} else {
					console.error("Invalid timer state received:", response);
				}
			} catch (error) {
				console.error("Error fetching timer state:", error);
			}
		};

		fetchInitialState();

		// Listen for state updates from background
		const handleMessage = (message: any) => {
			if (message.action === "timerStateUpdate" && message.state) {
				console.log("Received timer update:", message.state);

				// Validate timeLeft to avoid setting it to null/undefined
				const timeLeft =
					typeof message.state.timeLeft === "number"
						? message.state.timeLeft
						: timerState.timeLeft;

				// Update state with validation for each field
				setTimerState((prev) => ({
					mode: message.state.mode || prev.mode,
					timeLeft: timeLeft,
					isActive:
						typeof message.state.isActive === "boolean"
							? message.state.isActive
							: prev.isActive,
					sessionCount:
						typeof message.state.sessionCount === "number"
							? message.state.sessionCount
							: prev.sessionCount,
				}));
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);

		return () => {
			chrome.runtime.onMessage.removeListener(handleMessage);
		};
	}, [timerState.timeLeft]);

	// Timer control functions
	const startTimer = useCallback(async () => {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "startTimer",
			});
			setTimerState((prev) => ({
				...prev,
				isActive: response.isActive,
			}));
		} catch (error) {
			console.error("Error starting timer:", error);
		}
	}, []);

	const stopTimer = useCallback(async () => {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "stopTimer",
			});
			setTimerState((prev) => ({
				...prev,
				isActive: response.isActive,
				timeLeft: response.timeLeft,
			}));
		} catch (error) {
			console.error("Error stopping timer:", error);
		}
	}, []);

	const resetTimer = useCallback(async () => {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "resetTimer",
			});
			setTimerState({
				mode: response.mode,
				timeLeft: response.timeLeft,
				isActive: response.isActive,
				sessionCount: response.sessionCount,
			});
		} catch (error) {
			console.error("Error resetting timer:", error);
		}
	}, []);

	const changeMode = useCallback(async (mode: TimerMode) => {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "changeMode",
				mode,
			});
			setTimerState({
				mode: response.mode,
				timeLeft: response.timeLeft,
				isActive: response.isActive,
				sessionCount: response.sessionCount,
			});
		} catch (error) {
			console.error("Error changing mode:", error);
		}
	}, []);

	const adjustTime = useCallback(async (timeInSeconds: number) => {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "adjustTime",
				timeInSeconds,
			});
			setTimerState((prev) => ({
				...prev,
				timeLeft: response.timeLeft,
			}));
		} catch (error) {
			console.error("Error adjusting time:", error);
		}
	}, []);

	return {
		...timerState,
		startTimer,
		stopTimer,
		resetTimer,
		changeMode,
		adjustTime,
	};
}
