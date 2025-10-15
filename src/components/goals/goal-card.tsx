"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell, MoreVertical, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const GoalCard = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Dumbbell className="size-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Get Fit & Healthy</h3>
              <p className="text-sm text-muted-foreground">Fitness</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Goal options"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => console.log("Edit")}>
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Share")}>
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => console.log("Delete")}
                className="text-destructive"
              >
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">65%</span>
          </div>
          <Progress value={65} className="h-2" />
          <p className="text-xs text-muted-foreground">
            13 of 20 tasks completed
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Next Task</p>
            <p className="text-xs text-muted-foreground">
              Complete 30-minute run
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          View Tasks
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
