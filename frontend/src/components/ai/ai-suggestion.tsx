import { aiPrompts } from "@/constants";
import useAISuggestion from "@/hooks/use-ai-suggestion";
import { X } from "lucide-react";
import { useEffect } from "react";
import AIThinking from "./ai-thinking";

interface AISuggestionProps {
  value: string;
  setValue: (value: string) => void;
  promptType: keyof typeof aiPrompts;
  lastAcceptedSuggestion?: string;
  manualTriggerButtonLabel?: string;
}

const AISuggestion = ({
  value,
  setValue,
  promptType,
  lastAcceptedSuggestion,
  manualTriggerButtonLabel,
}: AISuggestionProps) => {
  const {
    isLoading,
    suggestion,
    setSuggestion,
    setLastAcceptedSuggestion,
    isManualTrigger,
    generateSuggestion,
  } = useAISuggestion({ value, promptType });

  const noAcceptanceNeededResponses = ["✨ Great goal! That's a solid title."];

  useEffect(() => {
    if (lastAcceptedSuggestion) {
      setLastAcceptedSuggestion(lastAcceptedSuggestion);
    }
  }, [lastAcceptedSuggestion, setLastAcceptedSuggestion]);

  if (isManualTrigger && !suggestion && !isLoading) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          className="px-2 py-1 text-xs text-accent underline rounded-2xl cursor-pointer bg-accent/10 hover:bg-accent/20 font-medium"
          onClick={generateSuggestion}
        >
          {manualTriggerButtonLabel || "Generate description with AI"}
        </button>
      </div>
    );
  }

  // Don't show component if not loading and no suggestion
  if (!isLoading && !suggestion) return null;

  return (
    <div className="flex items-center gap-2">
      <AIThinking isLoading={isLoading} />
      <div className="flex-1">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Getting personalized suggestions...
          </p>
        ) : (
          suggestion && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-foreground">{suggestion}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue(suggestion);
                    setLastAcceptedSuggestion(suggestion);
                    setSuggestion("");
                  }}
                  className={`text-xs text-accent-foreground hover:underline font-medium bg-accent px-2 py-1 rounded-2xl cursor-pointer ${
                    noAcceptanceNeededResponses.includes(suggestion)
                      ? "hidden"
                      : ""
                  }`}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSuggestion("");
                  }}
                  className="cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AISuggestion;
