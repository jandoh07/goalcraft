import AISuggestion from "@/components/ai/ai-suggestion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GoalDescriptionProps {
  description: string;
  setDescription: (description: string) => void;
  title: string;
  initialDescription?: string;
}

const GoalDescription = ({
  description,
  setDescription,
  initialDescription,
  title,
}: GoalDescriptionProps) => {
  const handleSetDescription = (value: string) => {
    const cleanDescription = value
      .replace(/^e\.g\.,?\s*/i, "") // remove "e.g.," at the start (case insensitive)
      .replace(/^["']|["']$/g, "") // remove leading/trailing quotes
      .trim();
    setDescription(cleanDescription);
  };
  return (
    <div className="grid gap-3">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="What's this for... This is important because..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <AISuggestion
        value={title}
        setValue={handleSetDescription}
        promptType="goalDescriptionPlaceholderGeneration"
        lastAcceptedSuggestion={initialDescription}
      />
    </div>
  );
};

export default GoalDescription;
