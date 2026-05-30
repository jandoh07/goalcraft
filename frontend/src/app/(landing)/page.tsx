import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const steps = [
    {
      number: "01",
      title: "Set a goal",
      description:
        "A goal can be anything you want to consistently work toward, big or small. It could be reading more books, exercising regularly, learning programming, building a business, or improving your grades. The size of the goal matters less than your willingness to work on it consistently over time.",
    },
    {
      number: "02",
      title: "Define your why",
      description:
        "Some goals are difficult enough that motivation alone won’t carry you through them. That’s why the system allows you to define a personal reason behind the goal, something meaningful enough to remind you why the effort matters when progress feels slow or difficult.",

      callout:
        "The stronger and more demanding the goal, the more important the why becomes.",
    },
    {
      number: "03",
      title: "Create your non-negotiables",
      description:
        "Non-negotiables are the recurring actions that move you toward your goals. They are the daily or weekly commitments you consistently show up for, regardless of motivation.",

      callout:
        "If your goal is to read more books, a non-negotiable might be: “Read for 30 minutes every day.”",
    },
    {
      number: "04",
      title: "Focus on time, not variable effort",
      description:
        "The system prefers time-based non-negotiables because time is fixed and predictable. “30 minutes of reading” is always achievable, while “1 chapter” can vary wildly depending on the book, your energy level, or the difficulty of the material.",

      callout:
        "Time-based targets reduce friction and make consistency easier to sustain long term.",
    },
    {
      number: "05",
      title: "Review daily",
      description:
        "Daily reviews are focused on the present day. Did you complete your non-negotiables? If not, why? Was the workload unrealistic? Were there distractions, poor planning, or low energy? The goal is awareness and adjustment.",

      callout:
        "Small corrections made daily prevent weeks of drifting off track.",
    },
    {
      number: "06",
      title: "Review weekly",
      description:
        "Weekly reviews zoom out and look at the bigger picture. Are your current non-negotiables actually helping you move toward your goals? Are certain habits consistently being skipped? Do they need to be simplified, adjusted, replaced, or scheduled differently?",

      callout:
        "Doing a weekly review gives you 52 opportunities a year to start fresh and improve on the previous week",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="md:pt-24 pt-18 pb-15">
        <p className="text-lg font-semibold tracking-widest uppercase mb-3">
          A personal tool I built for myself
        </p>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          I created this app to help me work more consistently toward my goals
          and make meaningful progress over time. One problem I kept facing was
          setting goals without creating a clear plan to achieve them. That
          usually led to losing momentum, procrastinating, or eventually giving
          up altogether.
        </p>
        <p className="font-semibold text-muted-foreground leading-relaxed mb-10 md:mb-0">
          This app is my attempt to solve that problem.
        </p>
        <div className="md:hidden grid grid-cols-2 gap-4">
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground text-center px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try the app
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 text-center border border-border rounded-lg flex items-center justify-center gap-2"
          >
            Sign in
            <MoveRight size={14} />
          </Link>
        </div>
      </section>
      <section className="mx-auto px-6 py-20 border-t border-border">
        <h2 className="text-lg font-semibold tracking-widest uppercase mb-10">
          How it works
        </h2>

        <div className="flex flex-col gap-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="grid grid-cols-[40px_1fr] md:grid-cols-[80px_1fr] gap-8"
            >
              <span className="text-4xl font-semibold text-muted-foreground/30 tabular-nums pt-1">
                {step.number}
              </span>

              <div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {step.description}
                </p>

                {step.callout && (
                  <div className="border-l-2 border-foreground/20 pl-4 mt-4">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      {step.callout}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
