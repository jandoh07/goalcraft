import { aiPrompts } from "@/constants";
import { flashLiteModel } from "@/lib/firebase/firebase";
import React, { useEffect, useState } from "react";

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
    if (!value || promptType !== "goalTitleSuggestion") return;

    // Don't trigger if user just accepted a suggestion or made minor edits to it
    if (
      lastAcceptedSuggestion &&
      value.includes(lastAcceptedSuggestion.slice(0, 10))
    ) {
      return;
    }

    // Debounce: wait 1.5 seconds after user stops typing
    const checkTimeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);

        // Step 1: Check if the goal title is complete using flashLiteModel
        const checkPrompt = aiPrompts.checkGoalTitle(value);
        const checkResult = await flashLiteModel.generateContent(checkPrompt);
        const checkResponse = checkResult.response.text().trim().toLowerCase();

        console.log("Check response:", checkResponse);

        // Step 2: If response is "true", get suggestion immediately
        if (checkResponse === "true") {
          const suggestionPrompt = aiPrompts.goalTitleSuggestion(value);
          const suggestionResult = await flashLiteModel.generateContent(
            suggestionPrompt
          );
          const suggestionText = suggestionResult.response.text().trim();

          setSuggestion(suggestionText);
          setIsLoading(false);
        } else {
          // If "false", wait additional 3.5 seconds (total 5s) then generate anyway
          setTimeout(async () => {
            try {
              const suggestionPrompt = aiPrompts.goalTitleSuggestion(value);
              const suggestionResult = await flashLiteModel.generateContent(
                suggestionPrompt
              );
              const suggestionText = suggestionResult.response.text().trim();

              setSuggestion(suggestionText);
            } catch (error) {
              console.error("Error getting delayed AI suggestion:", error);
              setSuggestion("");
            } finally {
              setIsLoading(false);
            }
          }, 3500);
        }
      } catch (error) {
        console.error("Error getting AI suggestion:", error);
        setSuggestion("");
        setIsLoading(false);
      }
    }, 1500);

    // Cleanup: cancel timeout if user types again
    return () => clearTimeout(checkTimeoutId);
  }, [value, promptType, lastAcceptedSuggestion]);

  return { isLoading, suggestion, setSuggestion, setLastAcceptedSuggestion };
};

export default useAISuggestion;
