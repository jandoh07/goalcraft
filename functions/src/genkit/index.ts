import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { onCallGenkit } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  promptDir: "src/genkit/prompts",
});

const Phase1InputSchema = z.object({
  userGist: z.string().describe("The user's raw goal idea or intention"),
  thinkingLevel: z
    .enum(["MINIMAL", "LOW", "MEDIUM", "HIGH"])
    .default("MEDIUM")
    .describe("The desired depth of thinking for the AI"),
  history: z.array(z.any()).optional(),
});

let historyLog: any[] = [];

export const phase1Flow = ai.defineFlow(
  {
    name: "phase1Flow",
    inputSchema: Phase1InputSchema,
    streamSchema: z.string(),
  },
  async (input, sendChunk) => {
    const phase1Prompt = ai.prompt("goals/phase1");

    const { response, stream } = phase1Prompt.stream(
      { userGist: input.userGist },
      {
        messages:
          input.history || historyLog.filter((msg) => msg.role !== "system"),
        config: {
          thinkingConfig: {
            thinkingLevel: input.thinkingLevel,
            includeThoughts: true,
          },
        },
      }
    );

    for await (const chunk of stream) {
      if (chunk.text) {
        sendChunk(chunk.text);
      }
    }

    const result = await response;
    const cleanHistory = result.messages.filter((msg) => msg.role !== "system");
    historyLog = cleanHistory;

    return {
      output: result.output,
      history: cleanHistory,
    };
  }
);

const Phase2InputSchema = z.object({
  title: z.string().describe("The finalized goal title from Phase 1"),
  category: z.string().describe("The finalized goal category from Phase 1"),
  duration: z.string().describe("The finalized goal duration from Phase 1"),
  userMessage: z.string(),
  thinkingLevel: z
    .enum(["MINIMAL", "LOW", "MEDIUM", "HIGH"])
    .default("MEDIUM")
    .describe("The desired depth of thinking for the AI"),
  history: z.array(z.any()).optional(),
});

export const phase2Flow = ai.defineFlow(
  {
    name: "phase2Flow",
    inputSchema: Phase2InputSchema,
    streamSchema: z.string(),
  },
  async (input, sendChunk) => {
    const phase2Prompt = ai.prompt("goals/phase2");
    const { response, stream } = phase2Prompt.stream(
      {
        title: input.title,
        category: input.category,
        duration: input.duration,
        userMessage: input.userMessage,
      },
      {
        messages: historyLog.filter((msg) => msg.role !== "system"),
        config: {
          thinkingConfig: {
            thinkingLevel: input.thinkingLevel,
            includeThoughts: true,
          },
        },
      }
    );

    for await (const chunk of stream) {
      if (chunk.text) {
        sendChunk(chunk.text);
      }
    }

    const result = await response;
    const cleanHistory = result.messages.filter((msg) => msg.role !== "system");
    historyLog = cleanHistory;

    return {
      output: result.output,
      history: cleanHistory,
    };
  }
);

export const goalPhase1 = onCallGenkit(
  {
    secrets: [geminiApiKey],
  },
  phase1Flow
);

export const goalPhase2 = onCallGenkit(
  {
    secrets: [geminiApiKey],
  },
  phase2Flow
);
