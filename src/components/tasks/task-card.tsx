"use client";
import { useState } from "react";

const TaskCard = () => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="rounded-lg border-l-3 border-destructive px-2 py-4 my-2 flex justify-start items-start gap-2 shadow-sm bg-secondary">
      <div>
        <input
          type="checkbox"
          className="size-4 bg-background"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
      </div>
      <div className="space-y-1">
        <p className={`font-semibold ${isChecked ? "line-through" : ""}`}>
          Complete project proposal
        </p>
        <p className="text-sm">Final review and submission needed</p>
        <div className="flex items-center justify-start gap-2">
          <div className="px-2 py-1 bg-red-500/25 text-red-500 rounded-2xl text-xs">
            High Priority
          </div>
          <div className="px-2 py-1 bg-blue-500/25 text-blue-500 rounded-2xl text-xs">
            Work Goals
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
