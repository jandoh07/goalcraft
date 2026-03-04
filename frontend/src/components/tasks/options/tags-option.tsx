"use client";

import { Tags, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";

interface TagsOptionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagsOption({
  tags,
  onAddTag,
  onRemoveTag,
}: TagsOptionProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const hasTags = tags.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (input.trim()) {
        onAddTag(input);
        setInput("");
      }
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 hover:bg-muted p-1 rounded cursor-pointer transition-all text-muted-foreground",
            hasTags &&
              "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 pr-1.5",
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tags className="size-5 md:size-4" />
          {hasTags && (
            <>
              <span className="text-[10px] font-medium">
                {tags.length} {tags.length === 1 ? "tag" : "tags"}
              </span>
              <X
                className="size-3 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  tags.forEach(onRemoveTag);
                }}
              />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">Tags</p>
          <input
            type="text"
            placeholder="Type a tag and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm outline-none border rounded-md px-2 py-1.5 bg-transparent"
            autoFocus
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs gap-1 pr-1"
                >
                  {tag}
                  <X
                    className="size-3 cursor-pointer hover:text-destructive"
                    onClick={() => onRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
