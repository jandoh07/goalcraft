"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useGetTasks } from "@/hooks/use-tasks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, ChevronLeft, ChevronRight } from "lucide-react";
import MobileHeader from "@/components/layout/mobile/header";
import { Spinner } from "@/components/ui/spinner";
import { ContributionHeatmap } from "@/components/analytics/contribution-heatmap";

const Analytics: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { user } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks(
    user?.uid || "",
  );

  // With edge auth, if user reaches this page they are authenticated
  // Only wait for data loading, not auth loading
  const isLoading = tasksLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <MobileHeader title="Analytics" />

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your productivity and goal progress
            </p>
          </div>

          {/* Contribution Heatmap */}
          <Card className="py-4 md:py-6">
            <CardHeader className="px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ListTodo className="h-5 w-5" />
                      Activity
                    </CardTitle>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedYear((prev) => prev - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold min-w-16 text-center">
                        {selectedYear}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedYear((prev) => prev + 1)}
                        disabled={selectedYear >= currentYear}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Your task completion history - days are colored based on
                    completed tasks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <ContributionHeatmap
                tasks={tasks}
                useDummyData={true}
                year={selectedYear}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Analytics;
