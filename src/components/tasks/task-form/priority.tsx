import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";
import React from "react";

const priorityOptions: {
  label: string;
  value: "high" | "medium" | "low";
  color: string;
  bgColor: string;
}[] = [
  {
    label: "High",
    value: "high",
    color: "text-red-600",
    bgColor: "bg-red-100 hover:bg-red-200",
  },
  {
    label: "Medium",
    value: "medium",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 hover:bg-yellow-200",
  },
  {
    label: "Low",
    value: "low",
    color: "text-green-600",
    bgColor: "bg-green-100 hover:bg-green-200",
  },
];

const Priority = ({
  priority,
  setPriority,
}: {
  priority: "high" | "medium" | "low" | "";
  setPriority: React.Dispatch<
    React.SetStateAction<"high" | "medium" | "low" | "">
  >;
}) => {
  const handlePrioritySelect = (value: "high" | "medium" | "low") => {
    if (priority === value) {
      setPriority("");
    } else {
      setPriority(value);
    }
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor="priority">
        <Flag className="size-4 inline mr-2" />
        Priority
      </Label>
      <div className="grid grid-cols-3 gap-2">
        {priorityOptions.map((priorityOption) => (
          <Button
            key={priorityOption.value}
            variant="outline"
            type="button"
            onClick={() => handlePrioritySelect(priorityOption.value)}
            className={cn(
              "w-full h-10 justify-center text-center font-medium gap-2 border-0",
              priorityOption.bgColor,
              priority === priorityOption.value &&
                "ring-2 ring-offset-2 ring-primary"
            )}
          >
            <Flag className={cn("size-4", priorityOption.color)} />
            <span className={priorityOption.color}>{priorityOption.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Priority;
