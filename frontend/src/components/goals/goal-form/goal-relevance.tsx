import AISuggestion from "@/components/ai/ai-suggestion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GoalRelevanceProps {
  relevance: string;
  setRelevance: (relevance: string) => void;
  title: string;
  initialRelevance?: string;
}

const GoalRelevance = ({
  relevance,
  setRelevance,
  initialRelevance,
  title,
}: GoalRelevanceProps) => {
  const handleSetRelevance = (value: string) => {
    const cleanRelevance = value
      .replace(/^e\.g\.,?\s*/i, "") // remove "e.g.," at the start (case insensitive)
      .replace(/^["']|["']$/g, "") // remove leading/trailing quotes
      .trim();
    setRelevance(cleanRelevance);
  };
  return (
    <div className="grid gap-3">
      <Label htmlFor="relevance">Relevance</Label>
      <Textarea
        id="relevance"
        placeholder="What's this for... This is important because..."
        value={relevance}
        onChange={(e) => setRelevance(e.target.value)}
      />
      <AISuggestion
        value={title}
        setValue={handleSetRelevance}
        promptType="goalRelevanceGeneration"
        lastAcceptedSuggestion={initialRelevance}
      />
    </div>
  );
};

export default GoalRelevance;
