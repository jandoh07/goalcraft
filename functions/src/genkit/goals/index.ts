import { z, Genkit } from "genkit";

/**
 * Schema for chat history messages passed from the client
 */
const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.array(z.object({ text: z.string() })),
});

const Phase1InputSchema = z.object({
  userGist: z.string().describe("The user's raw goal idea or intention"),
  thinkingLevel: z
    .enum(["MINIMAL", "LOW", "MEDIUM", "HIGH"])
    .default("MEDIUM")
    .describe("The desired depth of thinking for the AI"),
  history: z.array(ChatMessageSchema).optional(),
});

export const phase1Flow = (ai: Genkit) =>
  ai.defineFlow(
    {
      name: "phase1Flow",
      inputSchema: Phase1InputSchema,
      streamSchema: z.string(),
    },
    async (input, sendChunk) => {
      const phase1Prompt = ai.prompt("goals/phase1");

      // Convert client history format to Genkit message format
      const messages =
        input.history?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      const { response, stream } = phase1Prompt.stream(
        { userGist: input.userGist },
        {
          messages,
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

      // Extract and return the updated history for the client to store
      const updatedHistory = result.messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "model",
          content: msg.content.map((c) => ({
            text: typeof c === "string" ? c : c.text || "",
          })),
        }));

      return {
        output: result.output,
        history: updatedHistory,
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
  history: z.array(ChatMessageSchema).optional(),
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

      // Convert client history format to Genkit message format
      const messages =
        input.history?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      const { response, stream } = phase2Prompt.stream(
        {
          title: input.title,
          category: input.category,
          duration: input.duration,
          userMessage: input.userMessage,
        },
        {
          messages,
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

      // Extract and return the updated history for the client to store
      const updatedHistory = result.messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "model",
          content: msg.content.map((c) => ({
            text: typeof c === "string" ? c : c.text || "",
          })),
        }));

      return {
        output: result.output,
        history: updatedHistory,
      };
    }
  );
