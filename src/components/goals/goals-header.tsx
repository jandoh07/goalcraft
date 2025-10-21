"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Grid2x2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const filterItems = [
  { label: "All Goals", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
];

const GoalsHeader = ({ className }: { className?: string }) => {
  const isActive = "in-progress";
  return (
    <div className={cn("my-4", className)}>
      <div className="md:hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 pb-2 min-w-max">
            {filterItems.map((item) => (
              <div
                key={item.value}
                className={`rounded-3xl flex-shrink-0 px-3 py-1 text-sm border border-border ${
                  isActive === item.value
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="md:text-lg font-semibold mr-8">Your Goals</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <span>All Progress</span>
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Progress</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => console.log("All Progress")}>
                All Progress
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("In Progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Not Started")}>
                Not Started
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <span>Sort by due date</span>
                <ChevronDown className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => console.log("Due Date")}>
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Priority")}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Alphabetical")}>
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Progress")}>
                Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => console.log("Grid view")}
            aria-label="Switch to grid view"
          >
            <Grid2x2 /> <span>Grid</span>
          </Button>
          <Button
            variant={"default"}
            className="bg-accent text-accent-foreground"
            onClick={() => console.log("List view")}
            aria-label="Switch to list view"
          >
            <List /> <span>List</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalsHeader;
