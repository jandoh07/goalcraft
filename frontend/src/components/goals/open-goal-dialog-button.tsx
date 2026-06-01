"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AddButton from "@/components/ui/add-button";

interface OpenGoalDialogButtonProps {
  setActiveGoalId: (id: string) => void;
}

const OpenGoalDialogButton = ({
  setActiveGoalId,
}: OpenGoalDialogButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenCreateGoal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "create");
    params.set("type", "goal");
    params.delete("goalId");
    params.delete("objectiveId");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setActiveGoalId("new-goal");
  };

  return <AddButton onClick={handleOpenCreateGoal} />;
};

export default OpenGoalDialogButton;
