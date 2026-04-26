import { type Dispatch, type SetStateAction, useState } from "react";
import { Check, CirclePlus, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NonNegotiableFrequencyPicker } from "@/components/non-negotiables/non-negotiable-frequency-picker";
import { CreateGoalPhaseHeader } from "./phase-header";
import { NonNegotiable } from "@/types/goal";

interface CreateGoalPhaseThreeProps {
  nonNegotiables: NonNegotiable[];
  setNonNegotiables: Dispatch<SetStateAction<NonNegotiable[]>>;
}

type PendingNonNegotiableDraft = Pick<
  NonNegotiable,
  "title" | "status" | "frequency" | "lastCompletedAt"
>;

const createNonNegotiable = (
  draft: PendingNonNegotiableDraft,
): NonNegotiable => {
  const now = new Date();

  return {
    id: `nn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    goalId: "",
    title: draft.title,
    status: draft.status,
    frequency: draft.frequency,
    lastCompletedAt: draft.lastCompletedAt,
    createdAt: now,
    updatedAt: now,
  };
};

const createEmptyDraft = (): PendingNonNegotiableDraft => ({
  title: "",
  status: "in-progress",
  frequency: [],
  lastCompletedAt: null,
});

export const CreateGoalPhaseThree = ({
  nonNegotiables,
  setNonNegotiables,
}: CreateGoalPhaseThreeProps) => {
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [pendingItem, setPendingItem] =
    useState<PendingNonNegotiableDraft | null>(null);

  const updateItem = (id: string, updates: Partial<NonNegotiable>) => {
    setNonNegotiables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const removeItem = (id: string) => {
    setNonNegotiables((prev) => prev.filter((item) => item.id !== id));
    setEditingIds((prev) => prev.filter((entry) => entry !== id));
  };

  const addItem = () => {
    if (pendingItem !== null) {
      return;
    }

    setPendingItem(createEmptyDraft());
  };

  const cancelPendingItem = () => {
    setPendingItem(null);
  };

  const confirmPendingItem = () => {
    if (!pendingItem || pendingItem.title.trim().length === 0) {
      return;
    }

    setNonNegotiables((prev) => [...prev, createNonNegotiable(pendingItem)]);

    setPendingItem(null);
  };

  const toggleEditing = (id: string) => {
    setEditingIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader
        title="Your non-negotiables"
        // subheading="The recurring actions you commit to no matter what. Keep it simple - 2 to 4 is enough."
        subheading=""
      />

      <blockquote className="border-l-2 border-primary bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-2 font-medium text-primary">
          What are non-negotiables and why do they matter?
        </p>
        <p>
          Non-negotiables are recurring, <strong>time-based commitments</strong>{" "}
          designed to make progress inevitable. By focusing on duration (e.g.,
          &quot;1 hour of reading&quot;) rather than outcomes (e.g., &quot;Read
          Chapter 1&quot;), you remove the guesswork and friction of varying
          task difficulties. In this system, achieving your goal is a{" "}
          <strong>side effect</strong> of your consistency, show up for the
          time, and the results will follow.
        </p>
      </blockquote>

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
                  {/* {formatFrequencyTags(item.frequency)} */}
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

                <NonNegotiableFrequencyPicker
                  value={item.frequency}
                  onChange={(frequency) => updateItem(item.id, { frequency })}
                />
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

            <NonNegotiableFrequencyPicker
              value={pendingItem.frequency}
              onChange={(frequency) =>
                setPendingItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        frequency,
                      }
                    : prev,
                )
              }
            />

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
