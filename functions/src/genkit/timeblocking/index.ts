import { Genkit, z } from "genkit";

const ExistingBlockSchema = z.object({
  id: z.string().describe("Unique identifier of the existing block"),
  title: z.string(),
  start: z.string(),
  end: z.string(),
});

const ChatMessageSchema = z.object({
  role: z.string().describe("Either 'user' or 'assistant'"),
  content: z.string().describe("The message content"),
});

const TimeblockingInputSchema = z.object({
  userMessage: z.string().describe("The user's request about scheduling"),
  currentDate: z.string().describe("Today's date in ISO format"),
  existingBlocks: z
    .array(ExistingBlockSchema)
    .optional()
    .describe("Existing time blocks for conflict detection and modification"),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe("Previous messages in this conversation for context"),
});

export const timeblockingFlow = (ai: Genkit) =>
  ai.defineFlow(
    {
      name: "timeblockingFlow",
      inputSchema: TimeblockingInputSchema,
      streamSchema: z.string(),
    },
    async (input, sendChunk) => {
      const timeblockingPrompt = ai.prompt("timeblocking/timeblocking");

      const { response, stream } = timeblockingPrompt.stream({
        userMessage: input.userMessage,
        currentDate: input.currentDate,
        existingBlocks: input.existingBlocks,
        chatHistory: input.chatHistory,
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          sendChunk(chunk.text);
        }
      }

      const result = await response;

      return {
        output: result.output,
      };
    }
  );
