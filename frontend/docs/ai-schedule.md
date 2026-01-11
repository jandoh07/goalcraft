# AI Schedule Feature Documentation

## Overview

The AI Schedule feature allows users to manage their time blocks using natural language. Users can create, update, and delete time blocks by simply describing what they want in a chat interface.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐                    │
│  │   AIScheduleSheet   │───▶│   useAISchedule     │                    │
│  │   (Chat UI)         │    │   (Hook)            │                    │
│  └─────────────────────┘    └──────────┬──────────┘                    │
│                                        │                               │
│                                        │ httpsCallable                 │
│                                        ▼                               │
└────────────────────────────────────────┼───────────────────────────────┘
                                         │
                                         │ Firebase Functions
                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Firebase Cloud Functions                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐                    │
│  │ scheduleTimeblocking│───▶│  timeblockingFlow   │                    │
│  │ (Callable Function) │    │  (Genkit Flow)      │                    │
│  └─────────────────────┘    └──────────┬──────────┘                    │
│                                        │                               │
│                                        │ Dotprompt                     │
│                                        ▼                               │
│                            ┌─────────────────────┐                     │
│                            │ timeblocking.prompt │                     │
│                            │ (Gemini AI)         │                     │
│                            └─────────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Input

The user types a natural language request in the `AIScheduleSheet` component:
- "Add a gym session tomorrow morning"
- "Move my meeting to 3pm"
- "Delete the lunch break"

### 2. Frontend Processing (`use-ai-schedule.ts`)

The hook prepares the request:

```typescript
const existingBlocksData = existingBlocks.map((block) => ({
  id: block.id,
  title: block.title,
  start: block.start.toISOString(),
  end: block.end.toISOString(),
}));

const result = await scheduleTimeblocking({
  userMessage,
  currentDate: new Date().toISOString(),
  existingBlocks: existingBlocksData,
});
```

### 3. Cloud Function (`scheduleTimeblocking`)

The callable function invokes the Genkit flow:

```typescript
export const scheduleTimeblocking = onCall(async (request) => {
  const result = await runFlow(timeblockingFlow(ai), {
    userMessage: request.data.userMessage,
    currentDate: request.data.currentDate,
    existingBlocks: request.data.existingBlocks,
  });
  return result;
});
```

### 4. Genkit Flow (`timeblockingFlow`)

The flow streams the AI response:

```typescript
const { response, stream } = timeblockingPrompt.stream({
  userMessage: input.userMessage,
  currentDate: input.currentDate,
  existingBlocks: input.existingBlocks,
});
```

### 5. AI Prompt (`timeblocking.prompt`)

The Dotprompt template instructs the AI:

**Input Schema:**
- `userMessage`: The user's request
- `currentDate`: Today's date (ISO format)
- `existingBlocks`: Array of current time blocks with id, title, start, end

**Output Schema:**
```yaml
operations(array):
  action: string       # "create", "update", or "delete"
  blockId?: string     # Required for update/delete
  title?: string       # For create or update
  start?: string       # ISO datetime
  end?: string         # ISO datetime
  color?: string       # Tailwind CSS classes
  description?: string # Optional details
message: string        # Friendly response
conflicts?(array):
  blockTitle: string
  reason: string
```

### 6. Operation Processing

The hook processes the AI response and executes callbacks:

```typescript
for (const operation of response.operations) {
  switch (operation.action) {
    case "create":
      callbacks.onCreate({
        title: operation.title,
        start: new Date(operation.start),
        end: new Date(operation.end),
        color: operation.color,
        userId,
      });
      break;

    case "update":
      callbacks.onUpdate(operation.blockId, {
        title: operation.title,
        start: new Date(operation.start),
        // ... other fields
      });
      break;

    case "delete":
      callbacks.onDelete(operation.blockId);
      break;
  }
}
```

### 7. Firestore Updates

The callbacks trigger React Query mutations:
- `onCreate` → `addTimeBlock.mutate()`
- `onUpdate` → `updateTimeBlock.mutate()`
- `onDelete` → `deleteTimeBlock.mutate()`

## Key Files

| File | Purpose |
|------|---------|
| `components/schedule/ai-schedule-sheet.tsx` | Chat UI component |
| `hooks/use-ai-schedule.ts` | Frontend hook for AI integration |
| `functions/src/genkit/timeblocking/index.ts` | Genkit flow definition |
| `functions/src/genkit/prompts/timeblocking/timeblocking.prompt` | AI prompt template |
| `functions/src/genkit/index.ts` | Firebase callable function |
| `hooks/use-schedule.ts` | Firestore CRUD mutations |
| `lib/firebase/schedule.ts` | Firestore operations |

## Operation Types

### Create
Adds a new time block to the schedule.

**User says:** "Add a gym session tomorrow at 7am"

**AI returns:**
```json
{
  "operations": [{
    "action": "create",
    "title": "Gym Session",
    "start": "2025-01-11T07:00:00",
    "end": "2025-01-11T08:00:00",
    "color": "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300"
  }],
  "message": "I've added a Gym Session for tomorrow from 7:00 AM to 8:00 AM."
}
```

### Update
Modifies an existing time block.

**User says:** "Move my gym session to 3pm"

**AI returns:**
```json
{
  "operations": [{
    "action": "update",
    "blockId": "abc123",
    "start": "2025-01-11T15:00:00",
    "end": "2025-01-11T16:00:00"
  }],
  "message": "I've moved your Gym Session to 3:00 PM."
}
```

### Delete
Removes an existing time block.

**User says:** "Delete the meeting with John"

**AI returns:**
```json
{
  "operations": [{
    "action": "delete",
    "blockId": "xyz789"
  }],
  "message": "I've removed the meeting with John from your schedule."
}
```

## Block Matching

The AI matches existing blocks using:

1. **Title matching**: "move my gym session" → finds block with "gym" in title
2. **Time matching**: "delete my 2pm meeting" → finds block at 2pm
3. **Description matching**: "the meeting with John" → matches description content

## Color Categories

The AI automatically assigns colors based on activity type:

| Category | Color Class |
|----------|-------------|
| Work/Career | `bg-blue-500/20 border-blue-500 text-blue-700` |
| Exercise/Health | `bg-green-500/20 border-green-500 text-green-700` |
| Meals/Breaks | `bg-amber-500/20 border-amber-500 text-amber-700` |
| Learning/Study | `bg-purple-500/20 border-purple-500 text-purple-700` |
| Personal/Self-care | `bg-pink-500/20 border-pink-500 text-pink-700` |
| Social/Meetings | `bg-cyan-500/20 border-cyan-500 text-cyan-700` |
| Creative/Hobbies | `bg-violet-500/20 border-violet-500 text-violet-700` |
| Errands/Tasks | `bg-rose-500/20 border-rose-500 text-rose-700` |
| Rest/Sleep | `bg-indigo-500/20 border-indigo-500 text-indigo-700` |
| Default | `bg-teal-500/20 border-teal-500 text-teal-700` |

## Constraints

- All datetime strings are in ISO 8601 format
- Time blocks cannot span multiple days
- Minimum block duration: 15 minutes
- Maximum block duration: 8 hours
- Cannot schedule blocks in the past
- Update/delete operations require exact block ID match

## Error Handling

The hook handles errors at multiple levels:
1. Empty message validation
2. User authentication check
3. Firebase function errors
4. AI response parsing

Errors are displayed in the chat UI and can be cleared by the user.

## UI Feedback

The chat shows statistics after each operation:
- ✓ Added X block(s)
- ✓ Updated X block(s)
- ✓ Removed X block(s)

## Example Interactions

```
User: "Schedule my week with exercise, work, and meals"
AI: Creates multiple blocks for the week

User: "I need to move my 9am meeting to tomorrow"
AI: Updates the meeting block with new date/time

User: "Clear all my Friday afternoon meetings"
AI: Deletes multiple blocks matching the criteria

User: "What's on my schedule tomorrow?"
AI: Returns a message describing the schedule (no operations)
```
