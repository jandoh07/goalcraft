import { aiPrompts } from "@/constants";
import useAISuggestion from "@/hooks/use-ai-suggestion";
import { Bot, X } from "lucide-react";

interface AISuggestionProps {
  value: string;
  setValue: (value: string) => void;
  promptType: keyof typeof aiPrompts;
}

const AISuggestion = ({ value, setValue, promptType }: AISuggestionProps) => {
  const { isLoading, suggestion, setSuggestion, setLastAcceptedSuggestion } =
    useAISuggestion({ value, promptType });

  // Don't show component if not loading and no suggestion
  if (!isLoading && !suggestion) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full relative size-7 overflow-hidden">
        <div className="p-1 absolute top-[0.15rem] left-[0.15rem] bg-background rounded-full size-6 flex justify-self-center items-center z-10">
          <Bot className="size-5 text-muted-foreground" />
        </div>
        {isLoading && (
          <div className="h-8 w-3 bg-muted-foreground mx-auto animate-spin animation-duration-[1.3s]"></div>
        )}
      </div>
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
                  className="text-xs text-accent-foreground hover:underline font-medium bg-accent px-2 py-1 rounded-2xl cursor-pointer"
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
