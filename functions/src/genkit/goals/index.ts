import { z, MessageData, Genkit } from "genkit";

const Phase1InputSchema = z.object({
  userGist: z.string().describe("The user's raw goal idea or intention"),
  thinkingLevel: z
    .enum(["MINIMAL", "LOW", "MEDIUM", "HIGH"])
    .default("MEDIUM")
    .describe("The desired depth of thinking for the AI"),
  history: z.array(z.any()).optional(),
});

let historyLog: MessageData[] = [];

export const phase1Flow = (ai: Genkit) =>
  ai.defineFlow(
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
      const cleanHistory = result.messages.filter(
        (msg) => msg.role !== "system"
      );
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

export const phase2Flow = (ai: Genkit) =>
  ai.defineFlow(
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
      const cleanHistory = result.messages.filter(
        (msg) => msg.role !== "system"
      );
      historyLog = cleanHistory;

      return {
        output: result.output,
        history: cleanHistory,
      };
    }
  );
