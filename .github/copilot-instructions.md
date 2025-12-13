# GoalCraft Copilot Instructions

## Project Overview

GoalCraft is an AI-powered PWA for goal setting, task management, and productivity. It's a monorepo with three main parts:

- **`frontend/`** - Next.js 16 app with React 19, TypeScript, TanStack Query, Firebase client SDK
- **`functions/`** - Firebase Cloud Functions (Node 22) for backend tasks (recurring task scheduling)
- **`waitlist/`** - Separate Next.js landing page for waitlist signups

## Architecture Patterns

### Data Flow

1. **Firebase Firestore** is the primary database with real-time subscriptions
2. **TanStack Query** handles client-side caching with `staleTime: Infinity` for real-time data
3. Real-time updates use Firestore `onSnapshot` subscriptions initialized in hooks (see [use-tasks.ts](frontend/src/hooks/use-tasks.ts))
4. Optimistic updates are implemented via `onMutate` with rollback on error

### Hook Pattern (Critical)

All data operations follow this pattern in `frontend/src/hooks/`:

- `useGet*` - Query hook with real-time subscription setup in `useEffect`
- `useAdd*`, `useUpdate*`, `useDelete*` - Mutation hooks with optimistic updates
- Example: [use-goals.ts](frontend/src/hooks/use-goals.ts), [use-tasks.ts](frontend/src/hooks/use-tasks.ts)

### Firebase Service Layer

Firebase operations are in `frontend/src/lib/firebase/`:

- Each domain has its own file: `tasks.ts`, `goals.ts`, `auth.ts`, `user.ts`
- Export both one-time fetch functions and `subscribeTo*` functions for real-time

### Form Handling

Forms use **react-hook-form** + **zod** schemas. Pattern in [use-tasks-form.tsx](frontend/src/hooks/use-tasks-form.tsx):

- Schema defined with `z.object()` at top of hook
- Form initialized with `useForm({ resolver: zodResolver(schema) })`
- Subtasks managed as separate state alongside form

## Key Conventions

### File Organization

- **Route Groups**: `(app)/` for authenticated routes, `(auth)/` for login/signup, `(marketing)/` for public pages
- **Components**: Domain-organized in `components/{domain}/` (goals, tasks, auth, layout, ui)
- **Types**: Centralized in `frontend/src/types/` with barrel export in `index.ts`

### UI Components

- Uses **shadcn/ui** components (Radix primitives) in `components/ui/`
- Styling: Tailwind CSS v4 with `cn()` utility from [utils.ts](frontend/src/lib/utils.ts)
- Responsive dialogs: Use `ResponsiveDialog` component for mobile drawer / desktop dialog

### AI Integration

- Firebase AI SDK with Gemini models (`gemini-2.5-flash`, `gemini-2.5-flash-lite`)
- AI prompts defined in [constants/ai.ts](frontend/src/constants/ai.ts)
- Hook: [use-ai-suggestion.ts](frontend/src/hooks/use-ai-suggestion.ts) handles auto/manual trigger modes

### Task System

- Tasks can be standalone or linked to goals via `goalId`
- Recurring tasks use master tasks in `masterTasks` collection (Cloud Function handles spawning)
- Task grouping by date in [task-grouping.ts](frontend/src/lib/utils/task-grouping.ts): overdue, today, tomorrow, this-week, later, no-date

## Development Commands

```bash
# Frontend (from /frontend)
npm run dev          # Start Next.js dev server
npm run test         # Run Vitest tests
npm run test:ui      # Vitest with UI
npm run test:coverage

# Functions (from /functions)
npm run build        # Compile TypeScript
npm run serve        # Build + start emulators
npm run test         # Run Jest tests
npm run seed         # Seed Firestore with test data

# Firebase Emulators (from root)
firebase emulators:start  # Firestore on 8080, Functions on 5001
```

## Testing

- **Frontend**: Vitest + jsdom, tests co-located as `*.test.ts` files
- **Functions**: Jest, tests in `src/utils/*.test.ts`
- Both use descriptive `describe/it` blocks with edge case coverage

## Environment Variables

Frontend requires `NEXT_PUBLIC_FIREBASE_*` variables for Firebase config. App Check uses `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and debug token for local dev.

## Important Gotchas

1. **Anonymous auth by default**: App auto-signs in anonymously if no user (see [auth-context.tsx](frontend/src/contexts/auth-context.tsx))
2. **Firestore timestamps**: Always convert `.toDate()` when reading, use `Timestamp.now()` when writing
3. **Query invalidation**: Real-time subscriptions update cache directly; avoid manual invalidation
4. **PWA**: Service worker generated via `postbuild` script using Workbox
