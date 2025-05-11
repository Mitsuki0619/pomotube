import { useState, useEffect, useRef } from "react";

export const usePomodoroTimer = ({
	workDuration,
	breakDuration,
	longBreakDuration,
	sessionsBeforeLongBreak,
}: {
	workDuration: number;
	breakDuration: number;
	longBreakDuration: number;
	sessionsBeforeLongBreak: number;
}) => {
	const [isActive, setIsActive] = useState(false);
	const [mode, setMode] = useState<"work" | "break" | "longBreak">("work");
	const [timeLeft, setTimeLeft] = useState(workDuration * 60);
	const [sessionCount, setSessionCount] = useState(0);

	// Store end time and remaining time when paused
	const timerDataRef = useRef({
		endTime: 0,
		pausedTimeLeft: 0,
		lastMode: "work" as "work" | "break" | "longBreak",
	});

	// Update end time when mode changes
	useEffect(() => {
		// Only update if mode changed and timer is not active
		if (timerDataRef.current.lastMode !== mode && !isActive) {
			let duration = workDuration;

			if (mode === "break") {
				duration = breakDuration;
			} else if (mode === "longBreak") {
				duration = longBreakDuration;
			}

			timerDataRef.current.pausedTimeLeft = duration * 60;
			setTimeLeft(duration * 60);
		}

		timerDataRef.current.lastMode = mode;
	}, [mode, workDuration, breakDuration, longBreakDuration, isActive]);

	const startTimer = () => {
		// Resume from where we left off
		timerDataRef.current.endTime =
			Date.now() + timerDataRef.current.pausedTimeLeft * 1000;
		setIsActive(true);
	};

	const stopTimer = () => {
		// Store the remaining time when paused
		const now = Date.now();
		const remaining = Math.max(0, (timerDataRef.current.endTime - now) / 1000);
		timerDataRef.current.pausedTimeLeft = remaining;
		setIsActive(false);
	};

	const resetTimer = () => {
		setIsActive(false);
		setMode("work");
		setSessionCount(0);

		const duration = workDuration * 60;
		timerDataRef.current.pausedTimeLeft = duration;
		timerDataRef.current.endTime = 0;
		setTimeLeft(duration);
	};

	const changeMode = (newMode: "work" | "break" | "longBreak") => {
		setSessionCount(0);
		if (isActive) {
			stopTimer();
		}
		setMode(newMode);
		timerDataRef.current.lastMode = newMode;
		
		let duration = workDuration;
		if (newMode === "break") {
			duration = breakDuration;
		} else if (newMode === "longBreak") {
			duration = longBreakDuration;
		}
		
		timerDataRef.current.pausedTimeLeft = duration * 60;
		setTimeLeft(duration * 60);
	};

	useEffect(() => {
		let timerId: NodeJS.Timeout;

		if (isActive) {
			timerId = setInterval(() => {
				const now = Date.now();
				const remaining = Math.max(0, timerDataRef.current.endTime - now);
				const remainingSeconds = Math.ceil(remaining / 1000);

				setTimeLeft(remainingSeconds);

				// Timer completed
				if (remaining <= 0) {
					let nextDuration = 0;

					if (mode === "work") {
						// Determine if next break should be a long break
						if ((sessionCount + 1) % sessionsBeforeLongBreak === 0) {
							setMode("longBreak");
							nextDuration = longBreakDuration * 60;
						} else {
							setMode("break");
							nextDuration = breakDuration * 60;
						}
					} else {
						// End of a break period
						setMode("work");
						setSessionCount((prev) => prev + 1);
						nextDuration = workDuration * 60;
					}

					// Set up next timer period
					timerDataRef.current.pausedTimeLeft = nextDuration;
					timerDataRef.current.endTime = Date.now() + nextDuration * 1000;
				}
			}, 200); // Update more frequently for smoother display
		}

		return () => {
			if (timerId) clearInterval(timerId);
		};
	}, [
		isActive,
		mode,
		workDuration,
		breakDuration,
		longBreakDuration,
		sessionCount,
		sessionsBeforeLongBreak,
	]);

	// Function to adjust time manually
	const adjustTime = (newTimeInSeconds: number) => {
		// Don't allow time adjustment while timer is active
		if (isActive) {
			stopTimer();
		}
		
		// Update time with new value
		setTimeLeft(newTimeInSeconds);
		timerDataRef.current.pausedTimeLeft = newTimeInSeconds;
	};

	return {
		mode,
		timeLeft,
		sessionCount,
		isActive,
		startTimer,
		stopTimer,
		resetTimer,
		changeMode,
		adjustTime,
	};
};
