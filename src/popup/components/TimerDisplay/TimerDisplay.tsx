import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Slider } from "@/shared/components/ui/slider";
import { useBackgroundTimer } from "@/shared/hooks/useBackgroundTimer";
import { formatTime } from "@/shared/lib/utils";
import { useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export function TimerDisplay(props: {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}) {
  const {
    mode,
    isActive,
    sessionCount,
    timeLeft,
    stopTimer,
    startTimer,
    resetTimer,
    changeMode,
    adjustTime,
  } = useBackgroundTimer();

  // Get the maximum time based on current mode
  const getMaxTime = useCallback(() => {
    switch (mode) {
      case "work":
        return props.workDuration * 60;
      case "break":
        return props.breakDuration * 60;
      case "longBreak":
        return props.longBreakDuration * 60;
      default:
        return props.workDuration * 60;
    }
  }, [mode, props.workDuration, props.breakDuration, props.longBreakDuration]);
  
  // Convert time to inverted value for slider (to make it decrease from right to left)
  const getInvertedSliderValue = useCallback(() => {
    const maxTime = getMaxTime();
    // Invert the value: as timeLeft decreases, slider position moves from right to left
    return [maxTime - timeLeft];
  }, [timeLeft, getMaxTime]);
  
  // Handle slider change with inverted values
  const handleSliderChange = useCallback(
    (value: number[]) => {
      if (value && value.length > 0) {
        // Convert back from inverted slider value to actual time
        const maxTime = getMaxTime();
        const actualTime = maxTime - value[0];
        adjustTime(actualTime);
      }
    },
    [adjustTime, getMaxTime]
  );

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium">
            Mode: <span className="capitalize">{mode}</span>
          </span>
          <span className="text-sm font-medium">Sessions: {sessionCount}</span>
        </div>

        <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>

        {/* Seek bar - inverted for right-to-left progress */}
        <div className="w-full px-1">
          <Slider
            value={getInvertedSliderValue()}
            min={0}
            max={getMaxTime()}
            step={1}
            disabled={isActive}
            onValueChange={handleSliderChange}
            className="my-2"
          />
        </div>

        <div className="flex gap-2">
          {isActive ? (
            <Button onClick={stopTimer} variant="outline">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button onClick={startTimer}>
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          )}
          <Button onClick={resetTimer} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => changeMode("work")}
            variant={mode === "work" ? "default" : "ghost"}
            size="sm"
          >
            Work
          </Button>
          <Button
            onClick={() => changeMode("break")}
            variant={mode === "break" ? "default" : "ghost"}
            size="sm"
          >
            Break
          </Button>
          <Button
            onClick={() => changeMode("longBreak")}
            variant={mode === "longBreak" ? "default" : "ghost"}
            size="sm"
          >
            Long Break
          </Button>
        </div>
      </div>
    </Card>
  );
}
