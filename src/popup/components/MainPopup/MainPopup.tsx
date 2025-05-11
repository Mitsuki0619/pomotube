import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { useSettingsData } from "@/shared/hooks/useSettingsData";
import { Settings, StepBack } from "lucide-react";
import { useState } from "react";
import { SettingsForm } from "../SettingsForm/SettingsForm";
import { TimerDisplay } from "../TimerDisplay/TimerDisplay";

export function MainPopup() {
  const { settings, updateSettings } = useSettingsData();
  const [showSettings, setShowSettings] = useState(false);

  if (settings === undefined) {
    return (
      <div className={"w-[500px] bg-background text-foreground"}>
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        settings.darkMode ? "dark" : ""
      } w-[500px] bg-background text-foreground`}
    >
      <div className="p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">PomoTube</h1>
          <div className="flex gap-2">
            {!showSettings ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="h-8 w-8"
              >
                <StepBack className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showSettings ? (
          <Card className="p-4">
            <CardTitle className="text-lg font-semibold">Settings</CardTitle>
            <CardContent className="p-0">
              <SettingsForm
                settings={settings}
                updateSettings={updateSettings}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <TimerDisplay
              key={JSON.stringify(settings)}
              workDuration={settings.workDuration}
              breakDuration={settings.breakDuration}
              longBreakDuration={settings.longBreakDuration}
              sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
            />
            <div>{/* <YoutubePlayer /> */}</div>
          </div>
        )}
      </div>
    </div>
  );
}
