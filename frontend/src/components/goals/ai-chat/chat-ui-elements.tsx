"use client";

interface WelcomeMessageProps {
  onQuickStart?: (message: string) => void;
}

const QUICK_START_EXAMPLES = [
  "I want to get healthier",
  "Learn a new programming language",
  "Save money for a vacation",
  "Read more books this year",
];

/**
 * Welcome message shown when chat is empty
 */
export function WelcomeMessage({ onQuickStart }: WelcomeMessageProps) {
  return (
    <div className="flex-1 flex flex-col py-2 md:py-8 px-2 text-left space-y-6">
      <div className="space-y-2 w-full">
        <h3 className="font-semibold text-lg md:text-2xl">
          Ready to build something great?
        </h3>
        <p className="text-muted-foreground max-w-sm text-left md:text-lg">
          Let&apos;s turn that idea into a plan. What&apos;s a goal you&apos;ve
          been thinking about? Don&apos;t worry about being perfect—just give me
          the gist, and we&apos;ll refine it together.
        </p>
      </div>

      {onQuickStart && (
        <div className="space-y-2 w-full max-w-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_START_EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => onQuickStart(example)}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
