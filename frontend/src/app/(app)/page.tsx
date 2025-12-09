"use client";

import { useState } from "react";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import GoalForm from "@/components/goals/goal-form/goal-form";
import { Spinner } from "@/components/ui/spinner";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Goal } from "@/types";
import useGoalsForm from "@/hooks/use-goals-form";
import Updates from "@/components/goals/updates";
import { Indie_Flower } from "next/font/google";
import ArrowTop from "../../../public/arrow-top.svg";
import ArrowDown from "../../../public/arrow-down.svg";
import ArrowDownMobile from "../../../public/arrow-down-mobile.svg";
const indieFlower = Indie_Flower({ subsets: ["latin"], weight: "400" });

const Goals = () => {
  const [open, setOpen] = useState(false);
  const { user, isAnonymous } = useAuth();
  const [goalFilter, setGoalFilter] = useState<
    "all" | "in-progress" | "completed" | "overdue"
  >("in-progress");
  const { data: goals, isLoading } = useGoals(user?.uid || "", goalFilter);
  const [initialData, setInitialData] = useState<Goal | undefined>(undefined);
  const goalsForm = useGoalsForm({
    initialData,
    setInitialData,
    mode: initialData ? "edit" : "add",
    setOpen,
  });

  const showOnboarding = isAnonymous || (!isLoading && goals?.length === 0);

  const getEmptyStateMessage = () => {
    switch (goalFilter) {
      case "all":
        return "You have no goals yet. Click the + button to add your first goal!";
      case "in-progress":
        return "No goals in progress. Start a new goal to get going!";
      case "completed":
        return "No completed goals yet. Keep working towards your active goals!";
      case "overdue":
        return "No overdue goals. Great job staying on track!";
      default:
        return "You have no goals yet. Click the + button to add your first goal!";
    }
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      <MobileHeader title="Your Goals" />
      <Updates />

      {/* Onboarding prompt for new/anonymous users */}
      {showOnboarding && !isLoading && (
        <div
          className={`${indieFlower.className} relative mt-2 md:mt-8 flex-1 min-h-0`}
        >
          <div className="absolute -top-6 left-0 md:left-8 flex items-end text-primary">
            <ArrowTop className="size-30 text-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2 -ml-2">
              New here? Check this out!
            </h2>
          </div>
          <div className="absolute -bottom-2 right-8 md:right-16 flex items-start gap-1 text-primary">
            <p className="text-xl font-semibold text-foreground mt-4">
              Or set your first goal to get started
            </p>
            <ArrowDown className="size-30 text-foreground hidden md:block" />
            <ArrowDownMobile className="size-30 text-foreground md:hidden" />
          </div>
        </div>
      )}

      {!showOnboarding && (
        <GoalsHeader setGoalFilter={setGoalFilter} goalFilter={goalFilter} />
      )}
      <div className={`${!showOnboarding ? "pb-50" : "pb-32"} md:pb-5`}>
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-32">
            <Spinner />
          </div>
        ) : goals && goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              setOpen={setOpen}
              setInitialData={setInitialData}
            />
          ))
        ) : !showOnboarding ? (
          <p className="text-center text-muted-foreground mt-20">
            {getEmptyStateMessage()}
          </p>
        ) : null}
      </div>
      <AddButton onClick={goalsForm.handleAddNew} />
      <ResponsiveDialog
        open={open}
        setOpen={setOpen}
        title={initialData ? "Edit Goal" : "Add New Goal"}
        description={
          initialData
            ? "Update the details of your goal."
            : "Fill out the form to create a new goal."
        }
        submitLabel={initialData ? "Update Goal" : "Add Goal"}
        onSubmit={goalsForm.handleExternalFormSubmit}
        isSubmitting={goalsForm.mutation.isPending}
      >
        <GoalForm setOpen={setOpen} goalForm={goalsForm} />
      </ResponsiveDialog>
    </div>
  );
};

export default Goals;
