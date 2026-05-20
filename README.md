# Goalcraft

Goalcraft is a personal system and web application designed to help you work consistently towards your goals and make meaningful progress over time. Built on the philosophy that robust systems are required for consistent success, Goalcraft relies on a simple, 3-step process.

## The System

1. **Set your Goal**: Define what you want to achieve (e.g., "Become a better software developer").
2. **Non-Negotiables**: Create recurring, time-based tasks required to achieve that goal. The system highly encourages time-based habits (e.g., "Code for 1 hour") over variable effort tasks (e.g., "Read 1 chapter") because time is a fixed, measurable metric reducing daily friction.
3. **Daily & Weekly Reviews**:
   - **Daily (Micro)**: Quick reviews to log if you achieved the day's targets. If not, analyze why and formulate a plan for tomorrow to ensure success.
   - **Weekly (Macro)**: Zoom out over the entire week to identify repeating patterns. Compare progress, analyze if your non-negotiables are effectively moving you closer to your goal, and adjust them if needed.

## Features

- Goals and non-negotiable setting and management
- Daily and weekly review system
- Authentication using firebase (password and email, and google sign in)
- Recurring non-negotiables
- Progressive web app
- Brain dump

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **PWA & Offline Support**: Workbox

## Interesting Technical Decisions

### Custom Recurrence Engine

Instead of relying on libraries like `rrule`, GoalCraft uses a custom recurrence engine optimized around modulo-based interval tagging.

Each non-negotiable generates recurrence tags such as:

- `2D_1` → every 2 days
- `mon_2W_0` → every 2 weeks on Monday
- `3M_2_15` → every 3 months on the 15th

For a given date, the app generates only the tags relevant for "today" and performs direct tag matching to determine active non-negotiables.

This approach avoids expensive recurrence expansion while supporting:

- recurring day intervals
- weekly schedules
- custom weekday combinations
- monthly schedules
- "last day of month" handling
- timezone-aware recurrence calculations

Because recurrence is determined through deterministic tag matching rather than expanding recurrence ranges, the app can directly fetch only the non-negotiables active for the current day instead of retrieving a broader set of recurring tasks and filtering client-side.

The system is also designed around local-day calculations rather than absolute UTC timestamps. This keeps schedules stable relative to the user's local day boundaries and avoids recurrence inconsistencies that can occur when timezone offsets change.

## Local Setup

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm
- A Firebase Project with Authentication (Google provider enabled) and Firestore Database configured.

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jandoh07/goalcraft.git
   cd goalcraft/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the `frontend` directory and add your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
   NEXT_PUBLIC_ENVIRONMENT=development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   FIREBASE_SERVICE_ACCOUNT_KEY=your_service_account_key_here
   NODE_ENV=development
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```
