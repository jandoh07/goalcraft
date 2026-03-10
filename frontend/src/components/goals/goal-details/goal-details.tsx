"use client";

import { Goal, Task } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useGetNonNegotiablesByGoalId } from "@/hooks/use-tasks";
import { useMemo } from "react";
import Milestones from "./milestones";
import GoalTasks from "./goal-tasks";
import Header from "./header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoalDetailsProps {
  goal: Goal;
}

const GoalDetails = ({ goal }: GoalDetailsProps) => {
  const { user } = useAuth();
  // const { data: allTasks, isLoading } = useGetTasks(user?.uid || "", {
  //   goalId: goal.id,
  // });

  const allTasks: Task[] = useMemo(() => [], []);
  const isLoading = false;
  

  // Get non-negotiables (recurring master tasks) for this goal
  const { data: nonNegotiables, isLoading: isLoadingNonNegotiables } =
    useGetNonNegotiablesByGoalId(goal.id || "", user?.uid || "");

  const stats = useMemo(() => {
    if (!allTasks) return { total: 0, completed: 0, pending: 0 };

    const total = allTasks.length;
    const completed = allTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [allTasks]);

  return (
    <div className="space-y-4">
      <Header goal={goal} />
      <Tabs defaultValue="milestones" className="">
        <TabsList className="bg-card w-full">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="milestones">
          <Milestones goal={goal} />
        </TabsContent>
        <TabsContent value="tasks">
          <GoalTasks
            allTasks={allTasks}
            stats={stats}
            isLoading={isLoading}
            nonNegotiables={nonNegotiables}
            isLoadingNonNegotiables={isLoadingNonNegotiables}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalDetails;
