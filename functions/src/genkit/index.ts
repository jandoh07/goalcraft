import { defineSecret } from "firebase-functions/params";
import { phase1Flow, phase2Flow } from "./goals";
import { timeblockingFlow } from "./timeblocking";
import { onCallGenkit } from "firebase-functions/https";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  promptDir: "src/genkit/prompts",
});

export const goalPhase1 = onCallGenkit(
  {
    secrets: [geminiApiKey],
    enforceAppCheck: true,
  },
  phase1Flow(ai)
);

export const goalPhase2 = onCallGenkit(
  {
    secrets: [geminiApiKey],
    enforceAppCheck: true,
  },
  phase2Flow(ai)
);

export const scheduleTimeblocking = onCallGenkit(
  {
    secrets: [geminiApiKey],
    enforceAppCheck: true,
  },
  timeblockingFlow(ai)
);
