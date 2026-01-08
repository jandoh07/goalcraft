import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  GenerateContentResponse,
  GoogleGenAI,
  ThinkingLevel,
} from "@google/genai";
import { aiPrompts } from "./prompts";

type PromptType = keyof typeof aiPrompts;

interface GenerateAIContentRequest {
  promptType: PromptType;
  plan: "free" | "premium";
  thinkingLevel?: "low" | "medium" | "high";
  goalTitle?: string;
  value?: string;
  description?: string;
  relevance?: string;
  reason?: string;
  milestones?: string[];
  deadline?: string;
  userPrompt?: string;
}

interface GenerateAIContentResponse {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Generates a prompt based on the prompt type and provided data
 */
function generatePrompt(data: GenerateAIContentRequest): string {
  const {
    promptType,
    goalTitle,
    value,
    description,
    relevance,
    reason,
    milestones,
    deadline,
    userPrompt,
  } = data;

  switch (promptType) {
    case "goalTitleSuggestion":
      if (!value && !goalTitle) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle or value is required for goalTitleSuggestion"
        );
      }
      return aiPrompts.goalTitleSuggestion(value || goalTitle!);

    case "goalRelevanceGeneration":
      if (!goalTitle && !value) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle is required for goalRelevanceGeneration"
        );
      }
      return aiPrompts.goalRelevanceGeneration(goalTitle || value!);

    case "goalMilestoneGeneration":
      if (!goalTitle) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle is required for goalMilestoneGeneration"
        );
      }
      return aiPrompts.goalMilestoneGeneration(goalTitle, description, reason);

    case "taskSuggestionBasic":
      if (!goalTitle) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle is required for taskSuggestionBasic"
        );
      }
      return aiPrompts.taskSuggestionBasic(goalTitle, relevance, milestones);

    case "taskSuggestionCustom":
      if (!goalTitle || !userPrompt) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle and userPrompt are required for taskSuggestionCustom"
        );
      }
      return aiPrompts.taskSuggestionCustom(
        goalTitle,
        userPrompt,
        description,
        milestones
      );

    case "goalFeasibilityCheck":
      if (!goalTitle) {
        throw new HttpsError(
          "invalid-argument",
          "goalTitle is required for goalFeasibilityCheck"
        );
      }
      return aiPrompts.goalFeasibilityCheck(
        goalTitle,
        description,
        reason,
        milestones,
        deadline
      );

    default:
      throw new HttpsError(
        "invalid-argument",
        `Unknown prompt type: ${promptType}`
      );
  }
}

/**
 * Calls the Gemini API to generate content using GoogleGenAI SDK
 */
async function callGeminiAPI(
  prompt: string,
  plan: "free" | "premium",
  thinkingLevel: "low" | "medium" | "high" = "medium"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "GEMINI_API_KEY environment variable is not set"
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  let response: GenerateContentResponse;

  if (plan === "premium") {
    response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel:
            thinkingLevel === "high"
              ? ThinkingLevel.HIGH
              : thinkingLevel === "medium"
              ? ThinkingLevel.MEDIUM
              : ThinkingLevel.LOW,
        },
      },
    });
  } else {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
      },
    });
  }

  const text = response.text;

  if (!text) {
    throw new HttpsError("internal", "No content generated from Gemini API");
  }

  return text.trim();
}

export const generateAIContent = onCall<
  GenerateAIContentRequest,
  Promise<GenerateAIContentResponse>
>(
  {
    // Function configuration
    memory: "256MiB",
    timeoutSeconds: 60,
    secrets: ["GEMINI_API_KEY"],
  },
  async (request): Promise<GenerateAIContentResponse> => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to use AI features"
      );
    }

    const { data } = request;

    // Validate prompt type
    if (!data.promptType) {
      throw new HttpsError("invalid-argument", "promptType is required");
    }

    try {
      const prompt = generatePrompt(data);
      const result = await callGeminiAPI(prompt, data.plan, data.thinkingLevel);

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error("Error generating AI content:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        `Failed to generate AI content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);
