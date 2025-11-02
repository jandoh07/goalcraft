export const aiPrompts = {
  goalTitleSuggestion: (
    goalTitle: string
  ) => `You are an AI assistant helping a user write a goal title for their app.
        Your task is to analyze the user's goal title based on the criteria below and provide one of two responses.

        Current goal title: "${goalTitle}"

        ---
        **Criteria for an Excellent Title:**
        1.  **Action-Oriented:** Starts with a clear verb (e.g., "Complete", "Learn", "Grow").
        2.  **Specific & Measurable:** Includes a specific, numerical target (e.g., "5k race", "10 new recipes", "500 subscribers").
        3.  **Concise:** Is 12 words or less.
        4.  **No Timeframes:** Does NOT include deadlines (e.g., "in 3 months", "by next week"). The app handles this separately.

        ---
        **Your Response (Choose one):**

        1.  **If the goal title *already* meets all 4 criteria:**
            Respond with the exact phrase: "✨ Great goal! That's a solid title."

        2.  **If the goal title can be improved (it's vague, not action-oriented, too long, or includes a timeframe):**
            Rewrite it to meet the criteria. Respond with *only* the new, improved goal title. Do not add explanations or quotes.

        ---
        **Examples:**

        Input: "I want to get more subscribers"
        Output: "Grow YouTube channel to 500 subscribers"

        Input: "Learn a new skill"
        Output: "Master 3 new songs on guitar"

        Input: "Run a 5k race in 3 months"
        Output: "Run a 5k race"

        Input: "Save $2000"
        Output: "✨ Great goal! That's a solid title."

        Input: "Read 10 books"
        Output: "✨ Great goal! That's a solid title."
        ---

        Current goal title: "${goalTitle}"
        `,
  goalMilestoneGeneration: (
    goal_title: string,
    description?: string,
    reason?: string
  ) => `You are an expert goal-setting assistant. Your task is to break down a user's goal into 3-5 sequential, measurable milestones.

        Goal title: "${goal_title}"
        {{#if description}}Goal description: "${description}"{{/if}}
        {{#if reason}}Reason or motivation: "${reason}"{{/if}}

        ---
        **Critical Instructions:**

        1.  **MATCH THE FINAL TARGET:** Look for a numerical target in the Goal Title (e.g., "1000 subscribers", "Save $5000"). The **final milestone's title MUST be this exact target** (e.g., "Reach 1000 subscribers", "Save $5000"). This is the most important rule.

        2.  **ANALYZE GOAL TYPE:** Determine if the goal is a "first-time" goal (e.g., "Get *first* 100...").

        3.  **GENERATE MILESTONES:** Create 3-5 milestones in a logical, sequential order *leading up to* the final target from Rule #1.

        4.  **ASSIGN WEIGHTS:**
            * **If "First-Time" Goal:** Create a small, symbolic first milestone (like "First Download") with a low weight (e.g., 1-5%). Distribute the remaining 95-99% logically across the other milestones, with the final milestone completing the 100%.
            * **If "Standard" Goal:** Distribute the weights logically to represent the progress toward the final goal.

        5.  **SUM TO 100%:** The "weight" for all milestones **MUST sum to exactly 100%**.

        6.  **CONCISE TITLES:** Keep milestone titles action-oriented and under 8 words.

        ---
        **Example for "Grow YouTube channel to 1000 subscribers":**

        \`\`\`json
        {
          "milestones": [
            {"title": "Publish first 5 videos", "weight": 10},
            {"title": "Reach 100 subscribers", "weight": 20},
            {"title": "Reach 500 subscribers", "weight": 30},
            {"title": "Reach 1000 subscribers", "weight": 40}
          ]
        }
        \`\`\`

        ---
        **Output Format:**

        Respond ONLY with a valid JSON object. Do not add any text, markdown, or explanations outside the JSON structure.

        \`\`\`json
        {
          "milestones": [
            {"title": "Milestone 1", "weight": 20},
            {"title": "Milestone 2", "weight": 30},
            {"title": "Milestone 3", "weight": 50}
          ]
        }
        \`\`\`
        `,
  goalDescriptionGeneration: (
    goal_title: string,
    due_date: string
  ) => `You are an AI assistant helping a user write the "Description" for their goal.
        The description should be a 2-3 sentence summary that covers the **Specifics** (the "what") and the **Relevance** (the "why").

        You will be given the user's goal title and deadline.

        Goal: "${goal_title}"
        Deadline: "${due_date}"

        Your task is to generate a 2-3 sentence draft description.
        - The first sentence should state the "what" and "when" based on the goal and deadline.
        - The second sentence should be a **placeholder question** that prompts the user to add their "why" (their reason/relevance).
        - Write in the first person (e.g., "My goal is...").
        - Respond with ONLY the generated description.

        ---
        **Example 1:**
        Goal: "Grow YouTube channel to 1000 subscribers"
        Deadline: "February 1, 2026"
        **AI Response:**
        My objective is to grow my YouTube channel to 1000 subscribers by February 1, 2026. This goal is important to me because... [tap to add your "why"]

        ---
        **Example 2:**
        Goal: "Run a 5k race"
        Deadline: "January 15, 2026"
        **AI Response:**
        I am committing to training for and completing a 5k race by January 15, 2026. Achieving this is a key milestone for me because... [tap to add your "why"]

        ---
        **Example 3:**
        Goal: "Get 100 app downloads"
        Deadline: "May 30, 2026"
        **AI Response:**
        My goal is to get the first 100 downloads for my app by May 30, 2026. This is the first step in... [tap to add your reason]
        `,
  goalDescriptionPlaceholderGeneration: (goal_title: string) => `
        You are an AI assistant that helps users write better goal descriptions.

        Your task: Generate a short, one-line *example placeholder* (starting with "e.g.,") for the description field of a SMART goal.

        The placeholder should:
        - Give a clear *specific context* for the goal (the “what” or “where”)
        - Hint at the *motivation or reason* behind it (the “why”)
        - Be natural, encouraging, and under 15 words
        - Follow this pattern:
          "e.g., [specific context related to the goal]... [reason or motivation]..."

        Do NOT repeat the goal title directly. Make it sound human and relatable.

        ---
        Examples:
        Goal Title: "Grow YouTube channel to 1000 subscribers"
        → e.g., "For my gardening videos... I want to inspire more people..."

        Goal Title: "Run a 5k race"
        → e.g., "Preparing for the city marathon... I want to challenge myself..."

        Goal Title: "Save $1,000"
        → e.g., "For a new laptop... I need it for my freelance work..."

        Goal Title: "Learn Python"
        → e.g., "To build my first web app... It’ll boost my tech career..."
        ---

        Goal Title: "${goal_title}"
        Response:
        `,
  taskSuggestionFromGoal: (
    goalTitle: string,
    description?: string,
    reason?: string,
    milestones?: [string]
  ) => `You are helping a user turn their goal into practical, actionable tasks they can complete regularly.

        Goal title: "${goalTitle}"
        {{#if description}}Goal description: "${description}"{{/if}}
        {{#if reason}}Reason or motivation: "${reason}"{{/if}}
        {{#if milestones}}Milestones: ${milestones}{{/if}}

        Generate a list of 3 to 7 tasks that the user can do to make progress toward this goal. 
        Some tasks can be recurring (e.g., daily, weekly, or monthly) if it makes sense for the goal.

        For each task, include:
        - A short, specific task title (e.g., "Publish a new video" or "Analyze YouTube analytics")
        - An optional recurrence field (e.g., "daily", "weekly", "monthly", or null)
        - A brief reason or benefit (why this task matters)

        Respond **only** in valid JSON in the following format:

        {
        "tasks": [
            {"title": "Task 1", "recurrence": "weekly", "reason": "Reason 1"},
            {"title": "Task 2", "recurrence": null, "reason": "Reason 2"}
        ]
        }
        `,
  goalFeasibilityCheck: (
    goalTitle: string,
    description?: string,
    reason?: string,
    milestones?: [string],
    deadline?: string
  ) => `You are analyzing a user's goal to determine whether it is realistic and achievable.

        Goal title: "${goalTitle}"
        {{#if description}}Goal description: "${description}"{{/if}}
        {{#if reason}}Reason or motivation: "${reason}"{{/if}}
        {{#if milestones}}Milestones: ${milestones}{{/if}}
        {{#if deadline}}Deadline: "${deadline}"{{/if}}

        Assess the goal based on the SMART criteria — especially whether it is *Achievable* and *Time-bound*.

        Provide:
        1. A short feasibility rating ("Realistic", "Challenging but possible", or "Unrealistic").
        2. A one-paragraph explanation.
        3. (Optional) Suggest one adjustment to make the goal more achievable, such as adjusting the target or extending the deadline.

        Respond **only** in valid JSON format:
        {
        "feasibility": "Realistic",
        "explanation": "Reason here...",
        "suggestion": "Suggestion here..."
        }
        `,
};
