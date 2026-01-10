import { Genkit, z } from "genkit";

const ExistingBlockSchema = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
});

const TimeblockingInputSchema = z.object({
  userMessage: z.string().describe("The user's request about scheduling"),
  currentDate: z.string().describe("Today's date in ISO format"),
  existingBlocks: z
    .array(ExistingBlockSchema)
    .optional()
    .describe("Existing time blocks for conflict detection"),
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
