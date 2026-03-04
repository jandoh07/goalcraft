"use client";

import { cn } from "@/lib/utils";
import { HighlightRange } from "@/hooks/use-add-task-options";
import { InputHTMLAttributes, forwardRef, useMemo } from "react";

interface HighlightedInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  highlights: HighlightRange[];
}

const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
  ({ value, onChange, highlights, className, ...props }, ref) => {
    const parts = useMemo(() => {
      if (!value || highlights.length === 0) return null;

      const result: { text: string; highlighted: boolean; type?: string }[] =
        [];
      let lastIndex = 0;

      for (const range of highlights) {
        if (range.start > lastIndex) {
          result.push({
            text: value.slice(lastIndex, range.start),
            highlighted: false,
          });
        }
        result.push({
          text: value.slice(range.start, range.end),
          highlighted: true,
          type: range.type,
        });
        lastIndex = range.end;
      }

      if (lastIndex < value.length) {
        result.push({
          text: value.slice(lastIndex),
          highlighted: false,
        });
      }

      return result;
    }, [value, highlights]);

    return (
      <div className="relative w-full">
        {/* Background highlight layer - renders same text with colored backgrounds */}
        {parts && (
          <div
            className="absolute inset-0 flex items-center pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <span className={cn("whitespace-pre text-transparent", className)}>
              {parts.map((part, i) =>
                part.highlighted ? (
                  <mark
                    key={i}
                    className={cn(
                      "text-transparent rounded-sm",
                      part.type === "keyword"
                        ? "bg-green-200/70 dark:bg-green-500/30"
                        : part.type === "date"
                          ? "bg-blue-200/70 dark:bg-blue-500/30"
                          : "bg-amber-200/70 dark:bg-amber-500/30",
                    )}
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </span>
          </div>
        )}

        {/* Actual input on top */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "relative bg-transparent w-full outline-none",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

HighlightedInput.displayName = "HighlightedInput";

export default HighlightedInput;
