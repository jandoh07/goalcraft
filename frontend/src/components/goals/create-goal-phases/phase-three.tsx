import { type Dispatch, type SetStateAction, useState } from "react";
import { Check, CirclePlus, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateGoalPhaseHeader } from "./phase-header";
import { NonNegotiable, RecurrenceFrequency, Weekday } from "@/types/goal";

interface CreateGoalPhaseThreeProps {
  nonNegotiables: NonNegotiable[];
  setNonNegotiables: Dispatch<SetStateAction<NonNegotiable[]>>;
}

const weekdays: Array<{ key: Weekday; label: string }> = [
  { key: "sun", label: "Su" },
  { key: "mon", label: "Mo" },
  { key: "tue", label: "Tu" },
  { key: "wed", label: "We" },
  { key: "thu", label: "Th" },
  { key: "fri", label: "Fr" },
  { key: "sat", label: "Sa" },
];

const createNonNegotiable = () => ({
  id: `nn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  goalId: "",
  title: "",
  frequency: "daily" as const,
  customDays: [] as Weekday[],
});

export const CreateGoalPhaseThree = ({
  nonNegotiables,
  setNonNegotiables,
}: CreateGoalPhaseThreeProps) => {
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [pendingItem, setPendingItem] = useState<Omit<
    NonNegotiable,
    "id" | "goalId"
  > | null>(null);

  const updateItem = (id: string, updates: Partial<NonNegotiable>) => {
    setNonNegotiables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const removeItem = (id: string) => {
    setNonNegotiables((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (pendingItem !== null) {
      return;
    }

    setPendingItem({
      title: "",
      frequency: "weekly",
      customDays: [],
    });
  };

  const cancelPendingItem = () => {
    setPendingItem(null);
  };

  const confirmPendingItem = () => {
    if (!pendingItem || pendingItem.title.trim().length === 0) {
      return;
    }

    setNonNegotiables((prev) => [
      ...prev,
      {
        ...createNonNegotiable(),
        ...pendingItem,
      },
    ]);

    setPendingItem(null);
  };

  const toggleEditing = (id: string) => {
    setEditingIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const getFrequencyLabel = (item: NonNegotiable) => {
    if (item.frequency !== "custom") {
      return item.frequency[0].toUpperCase() + item.frequency.slice(1);
    }

    if (item.customDays.length === 0) {
      return "Custom";
    }

    const selectedLabels = weekdays
      .filter((day) => item.customDays.includes(day.key))
      .map((day) => day.label)
      .join(", ");

    return `Custom (${selectedLabels})`;
  };

  const toggleCustomDay = (id: string, day: Weekday) => {
    setNonNegotiables((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const exists = item.customDays.includes(day);
        return {
          ...item,
          customDays: exists
            ? item.customDays.filter((entry) => entry !== day)
            : [...item.customDays, day],
        };
      }),
    );
  };

  const togglePendingCustomDay = (day: Weekday) => {
    setPendingItem((prev) => {
      if (!prev) {
        return prev;
      }

      const exists = prev.customDays.includes(day);
      return {
        ...prev,
        customDays: exists
          ? prev.customDays.filter((entry) => entry !== day)
          : [...prev.customDays, day],
      };
    });
  };

  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader
        title="Your non-negotiables"
        subheading="The recurring actions you commit to no matter what. Keep it simple - 2 to 4 is enough."
      />

      <div className="space-y-3">
        {nonNegotiables.map((item, index) => (
          <div
            key={item.id}
            className="space-y-3 rounded-lg border border-border/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.title.trim() || `Non-negotiable ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getFrequencyLabel(item)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleEditing(item.id)}
                  aria-label="Edit non-negotiable"
                >
                  {editingIds.includes(item.id) ? (
                    <Check className="size-4" />
                  ) : (
                    <PenLine className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={nonNegotiables.length === 1}
                  aria-label="Delete non-negotiable"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {editingIds.includes(item.id) && (
              <div className="space-y-3 border-t pt-3">
                <Input
                  value={item.title}
                  onChange={(event) =>
                    updateItem(item.id, { title: event.target.value })
                  }
                  placeholder="Title (e.g. 30 minutes focused work)"
                />

                <Select
                  value={item.frequency}
                  onValueChange={(value) =>
                    updateItem(item.id, {
                      frequency: value as RecurrenceFrequency,
                      customDays: value === "custom" ? item.customDays : [],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {item.frequency === "custom" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Pick weekdays
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      {weekdays.map((day) => {
                        const selected = item.customDays.includes(day.key);
                        return (
                          <Button
                            key={day.key}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleCustomDay(item.id, day.key)}
                            className="px-0"
                          >
                            {day.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {pendingItem ? (
          <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
            <Input
              value={pendingItem.title}
              onChange={(event) =>
                setPendingItem((prev) =>
                  prev ? { ...prev, title: event.target.value } : prev,
                )
              }
              placeholder="Title (e.g. 30 minutes focused work)"
            />

            <Select
              value={pendingItem.frequency}
              onValueChange={(value) =>
                setPendingItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        frequency: value as RecurrenceFrequency,
                        customDays: value === "custom" ? prev.customDays : [],
                      }
                    : prev,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {pendingItem.frequency === "custom" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pick weekdays</p>
                <div className="grid grid-cols-7 gap-2">
                  {weekdays.map((day) => {
                    const selected = pendingItem.customDays.includes(day.key);
                    return (
                      <Button
                        key={day.key}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePendingCustomDay(day.key)}
                        className="px-0"
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={cancelPendingItem}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmPendingItem}
                disabled={pendingItem.title.trim().length === 0}
              >
                Add
              </Button>
            </div>
          </div>
        ) : editingIds.length === 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full border border-dashed border-border h-10"
          >
            <CirclePlus />
            Add non-negotiable
          </Button>
        ) : null}
      </div>
    </div>
  );
};
