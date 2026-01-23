"use client";

import { Globe, Check, ChevronsUpDown } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateUserPreferences } from "@/hooks/use-user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Gets all IANA timezones supported by the browser
 */
const getAllTimezones = (): string[] => {
  try {
    return (
      Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] }
    ).supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers
    return [
      "Africa/Cairo",
      "Africa/Johannesburg",
      "Africa/Lagos",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/New_York",
      "America/Sao_Paulo",
      "America/Toronto",
      "Asia/Bangkok",
      "Asia/Dubai",
      "Asia/Hong_Kong",
      "Asia/Kolkata",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Australia/Melbourne",
      "Australia/Sydney",
      "Europe/Berlin",
      "Europe/London",
      "Europe/Moscow",
      "Europe/Paris",
      "Pacific/Auckland",
      "Pacific/Honolulu",
      "Etc/UTC",
    ];
  }
};

/**
 * Gets the current UTC offset for a timezone
 */
const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");
    return offsetPart?.value || "";
  } catch {
    return "";
  }
};

/**
 * Formats a timezone for display
 * e.g., "America/New_York" -> "America/New York (GMT-5)"
 */
const formatTimezoneDisplay = (timezone: string): string => {
  const displayName = timezone.replace(/_/g, " ");
  const offset = getTimezoneOffset(timezone);
  return offset ? `${displayName} (${offset})` : displayName;
};

/**
 * Groups timezones by region
 */
const groupTimezonesByRegion = (
  timezones: string[]
): Record<string, string[]> => {
  const groups: Record<string, string[]> = {};

  for (const tz of timezones) {
    const [region] = tz.split("/");
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(tz);
  }

  // Sort regions and timezones within each region
  const sortedGroups: Record<string, string[]> = {};
  const sortedRegions = Object.keys(groups).sort();

  for (const region of sortedRegions) {
    sortedGroups[region] = groups[region].sort();
  }

  return sortedGroups;
};

const TimezoneSettings = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const updateUserPreferences = useUpdateUserPreferences();

  const currentTimezone =
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const allTimezones = useMemo(() => getAllTimezones(), []);
  const groupedTimezones = useMemo(
    () => groupTimezonesByRegion(allTimezones),
    [allTimezones]
  );

  const handleTimezoneChange = async (timezone: string) => {
    if (!user?.uid) return;

    if (timezone !== currentTimezone) {
      try {
        await updateUserPreferences.mutateAsync({
          userId: user.uid,
          preferences: { timezone },
        });
        toast.success(`Timezone updated to ${formatTimezoneDisplay(timezone)}`);
      } catch {
        toast.error("Failed to update timezone");
      }
    }
    setOpen(false);
  };

  const handleDetectTimezone = async () => {
    if (!user?.uid) return;

    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (detectedTimezone !== currentTimezone) {
      try {
        await updateUserPreferences.mutateAsync({
          userId: user.uid,
          preferences: { timezone: detectedTimezone },
        });
        toast.success(
          `Timezone set to ${formatTimezoneDisplay(detectedTimezone)}`
        );
      } catch {
        toast.error("Failed to update timezone");
      }
    } else {
      toast.info("Timezone is already set to your detected timezone");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label htmlFor="timezone" className="text-base font-medium">
            Timezone
          </Label>
          <p className="text-sm text-muted-foreground">
            Used for notification scheduling
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDetectTimezone}
          disabled={updateUserPreferences.isPending}
          className="text-xs"
        >
          Detect
        </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-50 justify-between text-sm"
              disabled={updateUserPreferences.isPending}
            >
              <span className="truncate">
                {currentTimezone.replace(/_/g, " ")}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-75 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search timezone..." />
              <CommandList>
                <CommandEmpty>No timezone found.</CommandEmpty>
                {Object.entries(groupedTimezones).map(([region, timezones]) => (
                  <CommandGroup key={region} heading={region}>
                    {timezones.map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => handleTimezoneChange(tz)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentTimezone === tz
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="truncate">
                          {formatTimezoneDisplay(tz)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TimezoneSettings;
