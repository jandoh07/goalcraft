"use client";

import MobileHeader from "@/components/layout/mobile/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  NotebookPen,
  RefreshCcw,
  Target,
} from "lucide-react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewDialog from "@/components/review/review-dialog";

const reviewModes = {
  daily: {
    title: "Daily review",
    description:
      "Capture what mattered today, clear the loose ends, and set up tomorrow with less friction.",
    time: "8-10 min",
    badge: "Best done before shutdown",
    headline: "Close the day with a clear head.",
    prompts: [
      "What moved the needle today?",
      "What got in the way of focus?",
      "What is the first task for tomorrow?",
    ],
    wins: [
      "2 meaningful tasks completed",
      "1 blocker captured for later",
      "Tomorrow's first task already chosen",
    ],
    nextSteps: [
      "Confirm the most important win",
      "Park any unfinished work",
      "Choose a clean first step for tomorrow",
    ],
    score: "4.7 / 5",
    momentum: "+12% focus stability this week",
  },
  weekly: {
    title: "Weekly review",
    description:
      "Step back, look for patterns, and decide what deserves your attention next week.",
    time: "18-25 min",
    badge: "Best done on Friday or Sunday",
    headline: "Make the week teach you something.",
    prompts: [
      "Which goal made real progress?",
      "What repeated problem should be fixed?",
      "What deserves more or less time next week?",
    ],
    wins: [
      "One goal regained momentum",
      "Recurring distraction identified",
      "Next week priorities narrowed to three",
    ],
    nextSteps: [
      "Choose the biggest weekly win",
      "Spot one habit to adjust",
      "Set the top 3 priorities for the next week",
    ],
    score: "4.5 / 5",
    momentum: "Review consistency up by 1 session",
  },
} as const;

const reviewHistory = [
  {
    type: "Daily",
    title: "Monday daily review",
    date: "Today • 7:40 PM",
    score: "4.8",
    status: "Completed",
    note: "You finished the hardest task early and left tomorrow with a clean first step.",
    highlights: ["Cleared inbox to zero", "Wrote tomorrow's first task"],
  },
  {
    type: "Weekly",
    title: "Last week summary",
    date: "Yesterday • 6:10 PM",
    score: "4.3",
    status: "Completed",
    note: "The week moved forward, but one goal needs a tighter plan to avoid drift.",
    highlights: ["Goal progress: 68%", "One blocker carried forward"],
  },
  {
    type: "Daily",
    title: "Friday daily review",
    date: "May 1 • 5:55 PM",
    score: "4.6",
    status: "Completed",
    note: "A steady day with good focus. Most of the friction came from context switching.",
    highlights: ["3 focus blocks completed", "Captured a follow-up for later"],
  },
  {
    type: "Weekly",
    title: "Two weeks ago summary",
    date: "Apr 18 • 8:15 PM",
    score: "4.1",
    status: "Needs follow-up",
    note: "Strong planning, but execution dropped after midweek. The next review should fix the schedule.",
    highlights: ["Priority mismatch spotted", "Week needs a clearer scope"],
  },
] as const;

const Review = () => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const handlePreviousReview = () => {
    setCurrentReviewIndex((prev) =>
      prev > 0 ? prev - 1 : reviewHistory.length - 1,
    );
  };

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) =>
      prev < reviewHistory.length - 1 ? prev + 1 : 0,
    );
  };

  const currentReview = reviewHistory[currentReviewIndex];

  return (
    <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col gap-4">
      <div>
        <p className="hidden md:block text-lg font-semibold mb-5">Review</p>
        <MobileHeader title="Review" />
      </div>

      <p>Generated with AI will manually edit this later to suit needs</p>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden border-border/60 bg-card/90 shadow-lg shadow-primary/5 backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-cyan-500 to-emerald-500" />
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Close the loop on your day and week.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Use a short review to keep momentum visible, catch problems before
              they grow, and make the next session easier to start.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="w-full bg-background">
                <TabsTrigger value="daily">Daily review</TabsTrigger>
                <TabsTrigger value="weekly">Weekly review</TabsTrigger>
              </TabsList>

              {Object.entries(reviewModes).map(([key, mode]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="grid gap-4 rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-primary/20 bg-primary/5 text-primary"
                        >
                          <CalendarDays className="mr-1.5 size-3.5" />
                          {mode.badge}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-secondary/80 text-secondary-foreground"
                        >
                          <Clock3 className="mr-1.5 size-3.5" />
                          {mode.time}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {mode.headline}
                        </h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {mode.description}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <NotebookPen className="size-4 text-primary" />
                            Reflection prompts
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {mode.prompts.map((prompt) => (
                              <li key={prompt} className="flex gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                                <span>{prompt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Target className="size-4 text-emerald-500" />
                            What this session should produce
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {mode.nextSteps.map((step) => (
                              <li key={step} className="flex gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button className="sm:w-fit">
                          Start {mode.title.toLowerCase()}
                          <ArrowRight className="size-4" />
                        </Button>
                        <Button variant="outline" className="sm:w-fit">
                          Continue where you left off
                          <RefreshCcw className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-lg shadow-primary/5 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Past reviews</CardTitle>
                {/* <CardDescription className="mt-1">
                  Keep a quick record of what you reviewed and what changed.
                </CardDescription> */}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousReview}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextReview}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {currentReview && (
              <div
                key={currentReview.title}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          currentReview.type === "Weekly"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          currentReview.type === "Weekly"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-primary/20 bg-primary/5 text-primary"
                        }
                      >
                        {currentReview.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {currentReview.date}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {currentReview.title}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Score
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {currentReview.score}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {currentReview.note}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {currentReview.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
                    >
                      <ArrowUpRight className="size-3.5 text-primary" />
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    {currentReview.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    Open review
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <RefreshCcw className="size-4 text-primary" />
                What happens next
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Later this page can read from saved review data, show progress
                charts, and resume unfinished sessions. For now, this layout is
                ready for design and flow testing.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <ReviewDialog />
    </div>
  );
};

export default Review;
