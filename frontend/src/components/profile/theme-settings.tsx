import { Moon, Sun } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateUserPreferences } from "@/hooks/use-user";

const ThemeSettings = () => {
  const { user } = useAuth();
  const { setTheme, theme } = useTheme();
  const updateUserPreferences = useUpdateUserPreferences();

  const handleThemeChange = (selectedTheme: "light" | "dark" | "system") => {
    if (user?.uid && selectedTheme !== theme) {
      updateUserPreferences.mutate({ theme: selectedTheme });
    } else if (!user?.uid) {
      setTheme(selectedTheme);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Moon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label htmlFor="theme" className="text-base font-medium">
            Theme
          </Label>
          <p className="text-sm text-muted-foreground">
            Select light, dark, or system theme
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSettings;
