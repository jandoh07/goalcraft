import { SunMoon, ChevronRight, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateUserPreferences } from "@/hooks/use-user";
import { useState } from "react";
import ResponsiveDialog from "@/components/ui/responsive-dialog";

const ThemeSettings = () => {
  const { user } = useAuth();
  const { setTheme, theme } = useTheme();
  const updateUserPreferences = useUpdateUserPreferences();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (selectedTheme: "light" | "dark" | "system") => {
    if (user?.uid && selectedTheme !== theme) {
      updateUserPreferences.mutate({ theme: selectedTheme });
    } else if (!user?.uid) {
      setTheme(selectedTheme);
    }
  };

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const;

  return (
    <>
      <div
        className="w-full flex justify-between items-center bg-card p-2 rounded-lg cursor-pointer hover:bg-card/50"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center">
          <div className="size-10 flex items-center justify-center shrink-0">
            <SunMoon className="size-4 text-foreground" />
          </div>
          <div className="font-medium text-sm">Theme</div>
        </div>
        <div className="flex items-center">
          <p className="text-sm pr-1 text-muted-foreground">
            {theme && theme?.charAt(0).toUpperCase() + theme?.slice(1)}
          </p>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
        </div>
      </div>

      <ResponsiveDialog
        open={open}
        setOpen={setOpen}
        title="Theme Preferences"
        description="Choose how GoalCraft looks to you."
        hideSubmitButton
      >
        <div className="flex flex-col gap-2 pb-4">
          {themes.map((t) => (
            <div
              key={t.value}
              className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted border ${theme === t.value ? "border-primary" : "border-border"} cursor-pointer`}
              onClick={() => handleThemeChange(t.value)}
            >
              <span className="text-sm font-medium">{t.label}</span>
              {theme === t.value && <Check className="h-4 w-4 text-primary" />}
            </div>
          ))}
        </div>
      </ResponsiveDialog>
    </>
  );
};

export default ThemeSettings;
