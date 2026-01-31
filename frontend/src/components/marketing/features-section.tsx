import {
  Target,
  Brain,
  Calendar,
  Wifi,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Goal Setting",
    description:
      "Define your goals and let AI break them down into manageable milestones and actionable tasks.",
  },
  {
    icon: Brain,
    title: "AI-Powered Suggestions",
    description:
      "Get intelligent task suggestions, time estimates, and priority recommendations based on your goals.",
  },
  {
    icon: Calendar,
    title: "Intelligent Scheduling",
    description:
      "Auto-schedule tasks based on your preferences, deadlines, and available time slots.",
  },
  {
    icon: Wifi,
    title: "Offline-First PWA",
    description:
      "Work seamlessly offline. Your data syncs automatically when you're back online.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track your progress with beautiful charts and insights to stay motivated.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Tasks",
    description:
      "Set up recurring tasks for habits and routines. They auto-generate so you never miss them.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32">
      <div>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Achieve Your Goals
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you stay focused, organized, and
            productive.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
