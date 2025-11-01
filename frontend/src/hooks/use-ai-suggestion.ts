import { aiPrompts } from "@/constants";
import { flashLiteModel } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";

const useAISuggestion = ({
  value,
  promptType,
}: {
  value: string;
  promptType: keyof typeof aiPrompts;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [lastAcceptedSuggestion, setLastAcceptedSuggestion] =
    useState<string>("");

  useEffect(() => {
    if (!value || promptType !== "goalTitleSuggestion") {
      setSuggestion("");
      return;
    }

    // Don't trigger if user just accepted a suggestion
    if (
      lastAcceptedSuggestion &&
      value.includes(lastAcceptedSuggestion.slice(0, 10))
    ) {
      return;
    }

    const suggestionTimeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);

        const suggestionPrompt = aiPrompts.goalTitleSuggestion(value);
        const suggestionResult = await flashLiteModel.generateContent(
          suggestionPrompt
        );
        const suggestionText = suggestionResult.response.text().trim();

        setSuggestion(suggestionText);
      } catch (error) {
        console.error("Error getting AI suggestion:", error);
        setSuggestion("");
      } finally {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(suggestionTimeoutId);
  }, [value, promptType, lastAcceptedSuggestion]);

  return { isLoading, suggestion, setSuggestion, setLastAcceptedSuggestion };
};

export default useAISuggestion;
