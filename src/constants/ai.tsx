export const aiPrompts = {
  goalTitleSuggestion: (
    goalTitle: string
  ) => `You are helping users improve goal titles based on the SMART framework.
        Current goal title: "${goalTitle}"
        Make the goal more specific and action-oriented, but do not include deadlines, schedules — those will be handled separately.
        If possible include a target for the goal preferably numerical
        Keep it concise and natural, ideally under 12 words.
        Respond with only the improved goal title — no explanations.
        `,
  goalMilestoneGeneration: (
    goal_title: string,
    description?: string,
    reason?: string
  ) => `You are helping a user break down their goal into measurable milestones.

        Goal title: "${goal_title}"
        {{#if description}}Goal description: "${description}"{{/if}}
        {{#if reason}}Reason or motivation: "${reason}"{{/if}}

        Generate a list of 3 to 5 clear, specific milestones that represent meaningful progress toward completing this goal. 
        Each milestone should include:
        - A short description (1 line)
        - A completion weight (percentage), ensuring the total adds up to 100%

        Keep milestone titles concise (under 8 words) and avoid extra descriptive text.
        If the goal is time-bound (e.g., has a deadline implied by the goal or context), ensure milestones are ordered logically toward completion.

        Respond **only in valid JSON** in the following format:

        {
        "milestones": [
            {"title": "Milestone 1", "weight": 25},
            {"title": "Milestone 2", "weight": 25},
            {"title": "Milestone 3", "weight": 25},
            {"title": "Milestone 4", "weight": 25}
        ]
        }
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
  checkGoalTitle: (goalTitle: string) => `
        You are a typing completion detector. 
        Determine if the following text is likely a complete thought or sentence.

        Text: "${goalTitle}"

        Return only "true" if it looks complete enough for goal suggestions, 
        otherwise return "false".`,
};
