import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aiPrompts } from "@/constants";
import { flashLiteModel } from "@/lib/firebase/firebase";
import { cn } from "@/lib/utils";
import { Milestone } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface MilestonesProps {
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
  goalTitle?: string;
}

const Milestones = ({
  milestones,
  setMilestones,
  goalTitle,
}: MilestonesProps) => {
  const [toggleAddMilestone, setToggleAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(false);

  const addMilestone = () => {
    if (!newMilestone?.title.trim() || !newMilestone?.weight) {
      return; // Don't add empty milestones
    }

    setMilestones([...milestones, newMilestone]);
    setNewMilestone(null);
    setToggleAddMilestone(false);
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string | number
  ) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== id));
  };

  const getTotalWeight = () => {
    return milestones.reduce(
      (sum, milestone) => sum + (Number(milestone.weight) || 0),
      0
    );
  };

  const generateMilestonesWithAI = async () => {
    try {
      if (!goalTitle) return;
      setLoading(true);
      const prompt = aiPrompts.goalMilestoneGeneration(goalTitle);
      const result = await flashLiteModel.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Remove markdown code block markers if present
      const jsonText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Parse the JSON response
      const parsedResponse = JSON.parse(jsonText);

      // Map the milestones to include IDs and completed status
      const generatedMilestones: Milestone[] = parsedResponse.milestones.map(
        (m: { title: string; weight: number }) => ({
          id: crypto.randomUUID(),
          title: m.title,
          weight: m.weight,
          completed: false,
        })
      );

      setMilestones(generatedMilestones);
    } catch (error) {
      console.error("Error generating milestones with AI:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!toggleAddMilestone && (
        <div className="flex justify-between items-center gap-2">
          <Label>Milestones (Add milestones to show progress)</Label>
          <Button
            type="button"
            size="sm"
            onClick={() => setToggleAddMilestone(!toggleAddMilestone)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}

      {/* Display existing milestones */}
      {milestones.length > 0 && (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex gap-2 items-center justify-between"
            >
              <div className="flex items-center gap-2 w-full">
                <Input
                  type="text"
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(e) =>
                    updateMilestone(milestone.id!, "title", e.target.value)
                  }
                  className="h-9"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Weight %"
                    min="0"
                    max="100"
                    value={milestone.weight || ""}
                    onChange={(e) =>
                      updateMilestone(
                        milestone.id!,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    className="h-9 w-16"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMilestone(milestone.id!)}
                className="h-9 w-9 shrink-0"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div
            className={cn(
              "text-sm font-medium",
              getTotalWeight() === 100
                ? "text-green-600"
                : "text-muted-foreground"
            )}
          >
            Total Weight: {getTotalWeight()}%
            {getTotalWeight() !== 100 && getTotalWeight() > 0 && (
              <span className="text-destructive ml-2">(Should equal 100%)</span>
            )}
          </div>
        </div>
      )}

      {toggleAddMilestone && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="milestone-title">Milestone Title</Label>
            <Input
              id="milestone-title"
              placeholder="Enter milestone title"
              value={newMilestone?.title || ""}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  id: newMilestone?.id || crypto.randomUUID(),
                  title: e.target.value,
                  weight: newMilestone?.weight || 0,
                  completed: newMilestone?.completed || false,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="milestone-weight">Milestone Weight (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              id="milestone-weight"
              placeholder="Enter milestone weight"
              value={newMilestone?.weight || ""}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  id: newMilestone?.id || crypto.randomUUID(),
                  title: newMilestone?.title || "",
                  weight: Number(e.target.value),
                  completed: newMilestone?.completed || false,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setToggleAddMilestone(false);
                setNewMilestone(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addMilestone}
              disabled={!newMilestone?.title.trim() || !newMilestone?.weight}
            >
              Add Milestone
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn("flex justify-end mt-2", toggleAddMilestone && "hidden")}
      >
        <button
          type="button"
          className="px-2 py-1 text-xs text-accent underline rounded-2xl cursor-pointer bg-accent/10 hover:bg-accent/20 font-medium"
          onClick={() => generateMilestonesWithAI()}
          disabled={loading || !goalTitle}
        >
          {loading ? "Generating..." : "Generate milestones with AI"}
        </button>
      </div>
    </div>
  );
};

export default Milestones;
