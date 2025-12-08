"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogClose } from "@radix-ui/react-dialog";

interface Update {
  id: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  stories: {
    id: string;
    type: "image" | "text";
    content: string;
    backgroundColor?: string;
    timestamp: string;
  }[];
  seen: boolean;
  isLink?: boolean;
  href?: string;
}

// Hardcoded data for preview
const hardcodedUpdates: Update[] = [
  {
    id: "onboarding",
    user: {
      name: "Your App",
      avatar: "/logo.png",
      initials: "YA",
    },
    stories: [
      {
        id: "onboarding-1",
        type: "text",
        content:
          "🎯 Welcome to YourApp\nSet goals. Build habits. Stay consistent.",
        backgroundColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
        timestamp: "",
      },
      {
        id: "onboarding-2",
        type: "text",
        content:
          "📌 Break big goals into milestones and daily tasks.\nProgress becomes automatic.",
        backgroundColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
        timestamp: "",
      },
      {
        id: "onboarding-3",
        type: "text",
        content:
          "🔥 Your recurring tasks become your non-negotiables.\nBuild discipline effortlessly.",
        backgroundColor: "bg-gradient-to-br from-orange-500 to-red-500",
        timestamp: "",
      },
      {
        id: "onboarding-4",
        type: "image",
        content: "/onboarding-dashboard.png",
        timestamp: "",
        //   caption: "Your dashboard keeps everything organized.",
      },
      {
        id: "onboarding-5",
        type: "text",
        content: "🚀 Ready?\nCreate your first goal now.",
        backgroundColor: "bg-gradient-to-br from-green-500 to-emerald-600",
        timestamp: "",
      },
    ],
    seen: false,
  },
  {
    id: "link-about",
    user: {
      name: "About Us",
      avatar: "",
      initials: "AB",
    },
    stories: [
      {
        id: "link-about-1",
        type: "text",
        content: "ℹ️ About\nGoalCraft",
        backgroundColor: "bg-gradient-to-br from-blue-600 to-indigo-700",
        timestamp: "",
      },
    ],
    seen: true,
    isLink: true,
    href: "/about",
  },
  {
    id: "link-blog",
    user: {
      name: "Blog",
      avatar: "",
      initials: "BL",
    },
    stories: [
      {
        id: "link-blog-1",
        type: "text",
        content: "📝 Read Our\nBlog",
        backgroundColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
        timestamp: "",
      },
    ],
    seen: true,
    isLink: true,
    href: "/blog",
  },
];

const Updates = () => {
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [updates] = useState<Update[]>(hardcodedUpdates);

  const openStory = (update: Update) => {
    setSelectedUpdate(update);
    setCurrentStoryIndex(0);
  };

  const closeStory = () => {
    setSelectedUpdate(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (
      selectedUpdate &&
      currentStoryIndex < selectedUpdate.stories.length - 1
    ) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      // Move to next user's story
      const currentIndex = updates.findIndex(
        (u) => u.id === selectedUpdate?.id
      );
      if (currentIndex < updates.length - 1) {
        setSelectedUpdate(updates[currentIndex + 1]);
        setCurrentStoryIndex(0);
      } else {
        closeStory();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else {
      // Move to previous user's story
      const currentIndex = updates.findIndex(
        (u) => u.id === selectedUpdate?.id
      );
      if (currentIndex > 0) {
        const prevUpdate = updates[currentIndex - 1];
        setSelectedUpdate(prevUpdate);
        setCurrentStoryIndex(prevUpdate.stories.length - 1);
      }
    }
  };

  const currentStory = selectedUpdate?.stories[currentStoryIndex];

  const renderUpdateCard = (update: Update) => {
    const cardContent = (
      <div
        className={cn(
          "p-0.5 rounded-xl",
          update.seen
            ? "bg-muted"
            : "bg-linear-to-tr from-purple-400 via-purple-500 to-blue-500"
        )}
      >
        <div className="p-0.5 bg-background rounded-xl">
          <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-lg overflow-hidden bg-muted">
            {update.stories[0].type === "image" ? (
              <Image
                src={update.stories[0].content}
                alt={update.user.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div
                className={cn(
                  "h-full w-full flex items-center justify-center p-2",
                  update.stories[0].backgroundColor
                )}
              >
                <span className="text-white text-xs text-center line-clamp-3 whitespace-pre-line">
                  {update.stories[0].content}
                </span>
              </div>
            )}
            {/* Link indicator */}
            {update.isLink && (
              <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-1">
                <ExternalLink className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (update.isLink && update.href) {
      return (
        <Link
          key={update.id}
          href={update.href}
          className="flex flex-col items-center gap-1.5 shrink-0"
          target="_blank"
          rel="noopener noreferrer"
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <button
        key={update.id}
        onClick={() => openStory(update)}
        className="flex flex-col items-center gap-1.5 shrink-0"
      >
        {cardContent}
      </button>
    );
  };

  return (
    <>
      {/* Updates Row */}
      <div className="mb-6 mt-6 md:mt-0">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {updates.map((update) => renderUpdateCard(update))}
        </div>
      </div>

      {/* Story Viewer Dialog */}
      <Dialog open={!!selectedUpdate} onOpenChange={() => closeStory()}>
        <DialogContent className="max-w-md w-full h-full md:h-[80vh] max-h-[700px] p-0 bg-black border-0 overflow-hidden [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>Story from {selectedUpdate?.user.name}</DialogTitle>
            <DialogDescription>
              Viewing story {currentStoryIndex + 1} of{" "}
              {selectedUpdate?.stories.length}
            </DialogDescription>
          </VisuallyHidden>
          {selectedUpdate && currentStory && (
            <div className="relative h-full w-full">
              {/* Progress bars */}
              <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                {selectedUpdate.stories.map((_, index) => (
                  <div
                    key={index}
                    className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className={cn(
                        "h-full bg-white rounded-full transition-all duration-300",
                        index < currentStoryIndex
                          ? "w-full"
                          : index === currentStoryIndex
                          ? "w-full"
                          : "w-0"
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <DialogClose asChild>
                <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-end px-4 pt-2">
                  {/* <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-2 ring-white">
                    <AvatarImage
                      src={selectedUpdate.user.avatar}
                      alt={selectedUpdate.user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedUpdate.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">
                      {selectedUpdate.user.name}
                    </span>
                    <span className="text-white/70 text-xs">
                      {currentStory.timestamp}
                    </span>
                  </div>
                </div> */}
                  <button
                    onClick={closeStory}
                    className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </DialogClose>

              {/* Story Content */}
              {currentStory.type === "image" ? (
                <Image
                  src={currentStory.content}
                  alt="Story"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full flex items-center justify-center p-8",
                    currentStory.backgroundColor
                  )}
                >
                  <p className="text-white text-2xl md:text-3xl font-semibold text-center leading-relaxed">
                    {currentStory.content}
                  </p>
                </div>
              )}

              {/* Navigation Areas */}
              <button
                onClick={prevStory}
                className="absolute left-0 top-20 bottom-0 w-1/3 z-10"
                aria-label="Previous story"
              />
              <button
                onClick={nextStory}
                className="absolute right-0 top-20 bottom-0 w-2/3 z-10"
                aria-label="Next story"
              />

              {/* Navigation Arrows (visible on hover) */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={prevStory}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={nextStory}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Updates;
