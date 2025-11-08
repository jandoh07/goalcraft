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
  taskSuggestionBasic: (
    goalTitle: string,
    description?: string,
    milestones?: [string]
  ) => `You are a productivity coach helping a user turn their goal into practical, actionable tasks.

        **Goal Information:**
        * **Title:** "${goalTitle}"
        {{#if description}}* **Description:** "${description}"{{/if}}
        {{#if milestones}}* **Milestones:** ${milestones}{{/if}}

        ---
        **Instructions:**

        1.  **Generate Tasks:** Create a list of 3-7 actionable tasks based *only* on the Goal Information provided.
        2.  **Actionable:** Tasks must start with a verb (e.g., "Research", "Schedule", "Write").
        3.  **Recurring Tasks:** If it makes sense for the goal, make some tasks recurring (e.g., "Practice piano", "Review analytics").
        4.  **Format:** Respond ONLY with a valid JSON object. Do not add any text, markdown, or explanations.

        ---
        **Output Format:**

        \`\`\`json
        {
          "tasks": [
            {"title": "Task 1", "isRecurring": true, "frequency": "weekly", "reason": "This helps build a consistent habit."},
            {"title": "Task 2", "isRecurring": false, "frequency": null, "reason": "This is a one-time setup step."},
            {"title": "Task 3", "isRecurring": false, "frequency": null, "reason": "This moves the first milestone forward."},
            {"title": "Task 4", "isRecurring": true, "frequency": "daily", "reason": "Daily practice improves skills steadily."}
          ]
        }
        \`\`\`
        `,
  taskSuggestionCustom: (
    goalTitle: string,
    userPrompt: string,
    description?: string,
    milestones?: [string]
  ) => `You are a productivity assistant. Your job is to help a user generate tasks for their goal, **paying special attention to their custom request.**

      **User's Custom Request:**
      "${userPrompt}"

      ---
      **Goal Information (for context):**
      * **Title:** "${goalTitle}"
      {{#if description}}* **Description:** "${description}"{{/if}}
      {{#if milestones}}* **Milestones:** ${milestones}{{/if}}

      ---
      **Instructions:**

      1.  **CRITICAL: Prioritize Request:** Generate 3-7 tasks that **directly fulfill the user's custom request.**
      2.  **Use Context:** Use the **Goal Information** as context to make the tasks more relevant. (e.g., if the goal is "Learn Python" and the request is "add reading tasks", suggest "Read Chapter 1 of 'Python Crash Course'").
      3.  **Recurring Tasks:** If the user asks for recurring tasks (e.g., "every day", "weekly"), you *must* set "isRecurring" to true and "frequency" appropriately. The frequency can be "daily", "weekly", "monthly", etc.
      4.  **Format:** Respond ONLY with a valid JSON object. Do not add any text, markdown, or explanations.

      ---
      **Output Format:**

      \`\`\`json
      {
        "tasks": [
          {"title": "Task 1", "isRecurring": true, "frequency": "daily", "reason": "Fulfills the user's daily request."},
          {"title": "Task 2", "isRecurring": false, "frequency": null, "reason": "Based on the user's specific instruction."},
          {"title": "Task 3", "isRecurring": false, "frequency": null, "reason": "Aligns with the user's goal and request."}
        ]
      }
      \`\`\`
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
