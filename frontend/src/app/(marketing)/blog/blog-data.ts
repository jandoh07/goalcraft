export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  emoji: string;
  author: {
    name: string;
    avatar: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "smart-goals-guide",
    title: "The Complete Guide to Setting SMART Goals",
    excerpt:
      "Learn how to set goals that are Specific, Measurable, Achievable, Relevant, and Time-bound for maximum success.",
    content: `
      Setting goals is easy. Achieving them is another story. That's where the SMART framework comes in.
      
      SMART is an acronym that stands for Specific, Measurable, Achievable, Relevant, and Time-bound. 
      Let's break down each component...
      
      ## Specific
      Your goal should be clear and well-defined. Instead of "I want to get fit," try "I want to run a 5K."
      
      ## Measurable
      How will you know when you've achieved your goal? Define clear metrics for success.
      
      ## Achievable
      Set goals that stretch you but are still attainable. Unrealistic goals lead to frustration.
      
      ## Relevant
      Your goals should align with your broader life objectives and values.
      
      ## Time-bound
      Set a deadline. Without one, there's no urgency to take action.
    `,
    category: "Goal Setting",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    emoji: "🎯",
    author: {
      name: "Alex Chen",
      avatar: "👨‍💼",
    },
  },
  {
    slug: "breaking-down-big-goals",
    title: "How to Break Down Big Goals Into Actionable Tasks",
    excerpt:
      "Big goals can feel overwhelming. Learn the art of breaking them down into manageable, daily tasks.",
    content: `
      Looking at a massive goal can be paralyzing. "Write a novel" or "Launch a startup" feels impossible when you don't know where to start.
      
      The secret? Break it down.
      
      ## The Chunk Method
      Divide your goal into major milestones, then divide those into weekly objectives, then daily tasks.
      
      ## Focus on the Next Step
      You don't need to see the whole staircase. Just take the next step.
      
      ## Use GoalCraft's AI
      Our AI can automatically suggest how to break down your goals based on thousands of successful patterns.
    `,
    category: "Productivity",
    date: "Jan 25, 2026",
    readTime: "4 min read",
    emoji: "🧩",
    author: {
      name: "Maria Santos",
      avatar: "👩‍💻",
    },
  },
  {
    slug: "building-daily-habits",
    title: "Building Daily Habits That Stick",
    excerpt:
      "Discover the science behind habit formation and practical strategies to make good habits automatic.",
    content: `
      Habits are the compound interest of self-improvement. Small daily actions lead to remarkable results over time.
      
      ## The Habit Loop
      Every habit consists of a cue, routine, and reward. Understanding this loop is key to building new habits.
      
      ## Start Small
      Begin with habits so small they're almost impossible to fail. Read one page. Do one pushup.
      
      ## Stack Your Habits
      Attach new habits to existing ones. "After I pour my morning coffee, I will journal for 5 minutes."
      
      ## Track Your Progress
      What gets measured gets managed. Use GoalCraft to track your habit streaks.
    `,
    category: "Habits",
    date: "Jan 22, 2026",
    readTime: "6 min read",
    emoji: "🔄",
    author: {
      name: "Jordan Taylor",
      avatar: "🧑‍🔬",
    },
  },
  {
    slug: "time-blocking-productivity",
    title: "Time Blocking: The Productivity Secret of High Achievers",
    excerpt:
      "Learn how scheduling specific time blocks for tasks can dramatically increase your productivity.",
    content: `
      Time blocking is the practice of planning your day in advance and dedicating specific hours to specific tasks.
      
      ## Why Time Blocking Works
      It eliminates decision fatigue and protects your time from being hijacked by others.
      
      ## How to Time Block
      Start by identifying your most important tasks. Block time for them first, preferably during your peak energy hours.
      
      ## Common Mistakes
      Don't over-schedule. Leave buffer time for unexpected tasks and breaks.
      
      ## Use AI Scheduling
      GoalCraft's AI can automatically schedule your tasks based on your preferences and deadlines.
    `,
    category: "Productivity",
    date: "Jan 18, 2026",
    readTime: "5 min read",
    emoji: "⏰",
    author: {
      name: "Sam Kim",
      avatar: "👩‍🎨",
    },
  },
  {
    slug: "overcoming-procrastination",
    title: "5 Proven Strategies to Overcome Procrastination",
    excerpt:
      "Stop putting things off. These science-backed techniques will help you take action today.",
    content: `
      Procrastination isn't about being lazy—it's about avoiding negative emotions associated with a task.
      
      ## 1. The Two-Minute Rule
      If something takes less than two minutes, do it now.
      
      ## 2. Break It Down
      Large tasks feel overwhelming. Break them into smaller, less intimidating pieces.
      
      ## 3. Remove Friction
      Make it easier to start. Prepare your workspace the night before.
      
      ## 4. Use Deadlines
      Parkinson's Law: work expands to fill the time available. Set tight deadlines.
      
      ## 5. Forgive Yourself
      Self-criticism after procrastinating makes it worse. Be kind to yourself and move forward.
    `,
    category: "Mindset",
    date: "Jan 15, 2026",
    readTime: "4 min read",
    emoji: "🚀",
    author: {
      name: "Alex Chen",
      avatar: "👨‍💼",
    },
  },
  {
    slug: "offline-productivity",
    title: "The Case for Offline Productivity",
    excerpt:
      "Why working offline can boost your focus and how GoalCraft's PWA makes it seamless.",
    content: `
      In a world of constant connectivity, going offline can feel scary. But it might be the best thing for your productivity.
      
      ## The Distraction Problem
      Every notification is an interruption. Even the possibility of notifications creates anxiety.
      
      ## Deep Work Requires Disconnection
      Cal Newport's research shows that meaningful work requires extended periods of focused attention.
      
      ## PWA: Best of Both Worlds
      GoalCraft works fully offline as a Progressive Web App. Make progress anywhere, sync when you reconnect.
      
      ## Try an Offline Day
      Challenge yourself to work offline for one day. You might be surprised by how much you accomplish.
    `,
    category: "Productivity",
    date: "Jan 12, 2026",
    readTime: "3 min read",
    emoji: "📴",
    author: {
      name: "Maria Santos",
      avatar: "👩‍💻",
    },
  },
];
