"use client";
import { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const targetSectionRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToTop = () => {
    if (targetSectionRef.current) {
      targetSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");

    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Successfully joined the waitlist!");
        form.reset();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <main className="max-w-4xl mx-auto px-4" ref={targetSectionRef}>
        <div
          className="h-screen md:flex flex-col items-center justify-center"
          id="hero"
        >
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Set Better Goals.
              <br /> <span className="text-accent">Achieve More.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              GoalCraft uses the{" "}
              <span className="font-medium text-foreground">SMART method</span>{" "}
              to turn your ambitions into a simple, trackable plan. Stay focused
              and make progress without the overwhelm.
            </p>

            {/* Signup CTA Box */}
            <div className="border border-border rounded-2xl max-w-xl w-full mx-auto mt-10 py-8 px-6 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
              <div className="text-center mb-6">
                <p className="text-xl font-bold mb-1">
                  Join the Public Beta Waitlist
                </p>
                <p className="text-muted-foreground text-sm">
                  Get early access in{" "}
                  <span className="text-foreground font-medium">December</span>{" "}
                  +{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Founder Pricing
                  </span>{" "}
                  at launch.
                </p>
              </div>

              <form
                className="flex flex-col sm:flex-row justify-center gap-3 mb-4"
                onSubmit={handleSubmit}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="border border-border rounded-full px-5 py-3 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground rounded-full px-8 py-3 hover:bg-primary/90 font-medium transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Joining...
                    </>
                  ) : (
                    "Join the Waitlist"
                  )}
                </button>
              </form>
              <p className="text-xs text-center text-muted-foreground">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </section>
        </div>

        {/* Problem Section */}
        <section className="space-y-8 mt-24">
          <h2 className="text-2xl md:text-4xl font-bold text-center px-4">
            You're not failing your goals — your system is.
          </h2>

          {/* Added a subtle background to contain the 'problem' */}
          <div className="max-w-3xl mx-auto border border-red-100 bg-red-50/30 dark:bg-red-900/10 dark:border-red-900/30 rounded-2xl p-8">
            <p className="text-center text-muted-foreground mb-8 text-lg">
              Most people abandon their New Year's resolutions by February
              because they are:
            </p>

            {/* Grid layout: 1 column on mobile, 2 on desktop */}
            <ul className="grid gap-6 md:grid-cols-2">
              <li className="flex gap-3 items-start">
                <span className="text-red-500 text-xl mt-1">❌</span>
                <div>
                  <span className="font-bold text-foreground block">
                    Too Vague
                  </span>
                  <span className="text-muted-foreground text-sm">
                    "Get healthier" is a wish, not a plan. You need specifics.
                  </span>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <span className="text-red-500 text-xl mt-1">❌</span>
                <div>
                  <span className="font-bold text-foreground block">
                    Hard to Measure
                  </span>
                  <span className="text-muted-foreground text-sm">
                    If you can't track progress, you can't celebrate wins.
                  </span>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <span className="text-red-500 text-xl mt-1">❌</span>
                <div>
                  <span className="font-bold text-foreground block">
                    Overwhelming
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Big ambitions without small steps lead to burnout fast.
                  </span>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <span className="text-red-500 text-xl mt-1">❌</span>
                <div>
                  <span className="font-bold text-foreground block">
                    Disconnected
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Buried in a notebook or lost in a notes app, waiting to be
                    forgotten.
                  </span>
                </div>
              </li>
            </ul>

            {/* The 'Bridge' to the solution */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="font-medium text-lg">
                GoalCraft fixes this. <br className="md:hidden" />
                <span className="text-muted-foreground font-normal">
                  We turn chaos into clarity with structured, actionable plans.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* How GoalCraft Works Section */}
        <section className="mt-24 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold">
              A Smarter Way to Achieve
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              GoalCraft guides you from a vague idea to a completed goal in
              three simple steps.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 mt-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 size-10 md:size-16 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-3xl">
                🎯
              </div>
              <div className="space-y-2">
                <h3 className="text-lg md:text-2xl font-semibold">
                  Step 1: Define Your Target
                </h3>
                <p className="text-muted-foreground md:text-lg">
                  Input your goal and set a deadline. Whether it's "Grow YouTube
                  channel to 500 subs" or "Run a 5K," GoalCraft ensures you
                  start with a specific, time-bound target—the foundation of
                  every SMART goal.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 size-10 md:size-16 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-3xl">
                🧠
              </div>
              <div className="space-y-2">
                <h3 className="text-lg md:text-2xl font-semibold">
                  Step 2: Let AI Break It Down
                </h3>
                <p className="text-muted-foreground md:text-lg">
                  Stuck on the "how"? Let our AI analyze your goal and deadline
                  to suggest the perfect milestones and tasks. Turn a daunting
                  3-month goal into a clear daily plan in seconds.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 size-10 md:size-16 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-3xl">
                📈
              </div>
              <div className="space-y-2">
                <h3 className="text-lg md:text-2xl font-semibold">
                  Step 3: Track Your Progress Visually
                </h3>
                <p className="text-muted-foreground md:text-lg">
                  Watch your progress unfold with visual tracking. Check off
                  tasks, celebrate milestones, and see exactly how close you are
                  to achieving your goal. Stay motivated with real progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Early Access Benefits */}
        <section className="mt-24 space-y-8">
          <h2 className="text-2xl md:text-4xl font-bold text-center">
            Why Join the Waitlist?
          </h2>
          {/* Added bg-secondary/20 to give the box a subtle tint distinct from the white background */}
          <div className="max-w-2xl mx-auto border border-border rounded-xl p-8 bg-secondary/10">
            <ul className="space-y-5 md:text-lg">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span>
                  <span className="font-semibold">Be the first to know</span>{" "}
                  when the Public Beta goes live
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span>
                  Lock in{" "}
                  <span className="font-semibold">
                    Exclusive Founder Pricing
                  </span>{" "}
                  (50% Off for your first year)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span>
                  Get a{" "}
                  <span className="font-semibold">"Founding Member" badge</span>{" "}
                  on your profile
                </span>
              </li>
            </ul>

            <div className="mt-8 text-center">
              <button
                className="bg-primary text-primary-foreground rounded-3xl px-8 py-3 hover:bg-primary/90 font-medium text-lg w-full md:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                onClick={scrollToTop}
              >
                Secure My Spot
              </button>
              {/* Added a tiny urgency text below button */}
              <p className="text-xs text-muted-foreground mt-3">
                Limited to the first 500 users
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-24 space-y-8 mb-24">
          <h2 className="text-2xl md:text-4xl font-bold text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Q1: Timeline & Access */}
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2">
                When can I start using GoalCraft?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The Public Beta opens in{" "}
                <span className="font-medium text-foreground">
                  December 2025
                </span>
                . By joining the waitlist, you'll be notified the moment we go
                live so you can grab your username and start planning.
              </p>
            </div>

            {/* Q2: Differentiation (Updated: Positioning as Goal-First) */}
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2">
                Is this just another to-do list app?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Not at all. To-do lists are for chores; GoalCraft is for{" "}
                <span className="font-medium text-foreground">ambitions</span>.
                We are a goal-setting platform first. We help you define SMART
                goals, track your milestones, and visualize your progress with
                analytics. The task list exists only to help you execute your
                larger vision—ensuring every daily action actually moves the
                needle.
              </p>
            </div>

            {/* Q3: Pricing (Updated: Honest about First Year Discount) */}
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2">Is the beta free?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! The beta is{" "}
                <span className="font-medium text-foreground">100% free</span>{" "}
                to use during the testing period. When we launch officially,
                waitlist members will secure an{" "}
                <span className="font-medium text-foreground">
                  exclusive discount on their first year
                </span>
                .
              </p>
            </div>

            {/* Q4: Platform (Updated: Web First + Roadmap) */}
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-semibold mb-2">
                Does it work on mobile?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Absolutely. GoalCraft is built as a responsive web app, so you
                can use it easily on your phone browser right now.
                <span className="font-medium text-foreground">
                  {" "}
                  Native iOS and Android apps are planned
                </span>{" "}
                for a future update.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-24 mb-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Don't start 2026 without a plan.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop hoping for a better year and start engineering one. Secure your
            early access today and hit the ground running in January.
          </p>
          <div className="pt-4">
            <button
              className="bg-primary text-primary-foreground rounded-4xl px-10 py-4 hover:bg-primary/90 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              onClick={scrollToTop}
            >
              Secure My Spot
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
