import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { Settings } from "@/shared/types/settings";
import { z } from "@zod/mini";

const numberStringSchema = z.pipe(
  z.string(),
  z.transform((val, ctx) => {
    const parsed = Number.parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      ctx.issues.push({
        code: "custom",
        message: "数値を入力してください",
        input: val,
      });
    }
    return parsed;
  })
);

const settingsSchema = z.object({
  showNotifications: z.pipe(
    z.optional(z.string()),
    z.transform((val) => val === "on")
  ),
  darkMode: z.pipe(
    z.optional(z.string()),
    z.transform((val) => val === "on")
  ),
  isMuted: z.pipe(
    z.optional(z.string()),
    z.transform((val) => val === "on")
  ),
  volume: numberStringSchema,
  workDuration: numberStringSchema,
  breakDuration: numberStringSchema,
  longBreakDuration: numberStringSchema,
  sessionsBeforeLongBreak: numberStringSchema,
  workUrl: z.string(),
  breakUrl: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm({
  settings,
  updateSettings,
}: {
  settings: Settings;
  updateSettings: (settings: Settings) => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(
          formData
        ) as unknown as SettingsFormValues;
        const parsedValues = await settingsSchema.parseAsync(values);
        updateSettings(parsedValues);
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Label className="space-y-1">
            Work Duration (min)
            <Input
              type="number"
              name="workDuration"
              defaultValue={settings.workDuration}
              min="1"
            />
          </Label>
          <Label className="space-y-1">
            Break Duration (min)
            <Input
              type="number"
              name="breakDuration"
              defaultValue={settings.breakDuration}
              min="1"
            />
          </Label>
          <Label className="space-y-1">
            Long Break Duration (min)
            <Input
              type="number"
              name="longBreakDuration"
              defaultValue={settings.longBreakDuration}
              min="1"
            />
          </Label>
          <Label className="space-y-1">
            Sessions Before Long Break
            <Input
              type="number"
              name="sessionsBeforeLongBreak"
              defaultValue={settings.sessionsBeforeLongBreak}
              min="1"
            />
          </Label>
        </div>

        <h2 className="text-lg font-medium mt-4">YouTube Settings</h2>
        <Label className="space-y-1">
          Work Video URL
          <Input
            type="url"
            name="workUrl"
            defaultValue={settings.workUrl}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Label>
        <Label className="space-y-1">
          Break Video URL
          <Input
            type="url"
            name="breakUrl"
            defaultValue={settings.breakUrl}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Label>

        <div className="flex items-center gap-4">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox name="isMuted" defaultChecked={settings.isMuted} />
            <span>Mute Audio</span>
          </Label>
          <Label className="flex-1 space-y-1">
            <span>Volume ({settings.volume}%)</span>
            <Input
              type="range"
              name="volume"
              defaultValue={settings.volume}
              min="0"
              max="100"
            />
          </Label>
        </div>

        <h2 className="text-lg font-medium mt-4">Display Settings</h2>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox name="darkMode" defaultChecked={settings.darkMode} />
            <span>Dark Mode</span>
          </Label>
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="showNotifications"
              defaultChecked={settings.showNotifications}
            />
            <span>Show Notifications</span>
          </Label>
        </div>
      </div>
      <Button type="submit" className="mt-6 w-full">
        Save Settings
      </Button>
    </form>
  );
}
