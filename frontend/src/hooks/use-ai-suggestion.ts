import { aiPrompts } from "@/constants";
import { flashLiteModel } from "@/lib/firebase/firebase";
import { useEffect, useState, useCallback } from "react";

// Prompt types that should auto-trigger after user stops typing
const AUTO_TRIGGER_PROMPTS = ["goalTitleSuggestion"];

// Prompt types that should only trigger manually (via button click)
const MANUAL_TRIGGER_PROMPTS: (keyof typeof aiPrompts)[] = [
  "goalRelevanceGeneration",
];

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

  const isAutoTrigger = AUTO_TRIGGER_PROMPTS.includes(promptType);
  const isManualTrigger = MANUAL_TRIGGER_PROMPTS.includes(promptType);

  const generateSuggestion = useCallback(async () => {
    if (!value) {
      setSuggestion("");
      return;
    }

    // Don't trigger if user just accepted a suggestion (only for certain prompt types)
    if (
      (promptType === "goalTitleSuggestion" ||
        promptType === "goalRelevanceGeneration") &&
      lastAcceptedSuggestion &&
      value.includes(lastAcceptedSuggestion.slice(0, 10))
    ) {
      return;
    }

    try {
      setIsLoading(true);

      // Get the appropriate prompt based on promptType
      let suggestionPrompt: string;

      switch (promptType) {
        case "goalTitleSuggestion":
          suggestionPrompt = aiPrompts.goalTitleSuggestion(value);
          break;
        case "goalRelevanceGeneration":
          suggestionPrompt = aiPrompts.goalRelevanceGeneration(value);
          break;
        default:
          console.warn(`Unsupported prompt type: ${promptType}`);
          setIsLoading(false);
          return;
      }

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
  }, [value, promptType, lastAcceptedSuggestion]);

  // Auto-trigger effect (only for specific prompt types)
  useEffect(() => {
    if (!isAutoTrigger) return;

    if (!value) {
      setSuggestion("");
      return;
    }

    const suggestionTimeoutId = setTimeout(() => {
      generateSuggestion();
    }, 1500);

    return () => clearTimeout(suggestionTimeoutId);
  }, [value, isAutoTrigger, generateSuggestion]);

  return {
    isLoading,
    suggestion,
    setSuggestion,
    setLastAcceptedSuggestion,
    generateSuggestion: isManualTrigger ? generateSuggestion : undefined,
    isManualTrigger,
  };
};

export default useAISuggestion;
