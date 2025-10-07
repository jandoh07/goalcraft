import { Bot } from "lucide-react";
import React from "react";

const AiCoachTip = () => {
  return (
    <div className="bg-linear-to-r from-[#6077de] to-[#7951aa] min-h-20 w-full p-4 mb-4 flex flex-row items-start gap-5 rounded-lg text-white">
      <div className="size-10 md:size-12 p-3 bg-white/25 rounded-full flex items-center justify-center">
        <Bot className="size-7 md:size-8" />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">AI Coach Tip</h2>
        <p className="text-sm">
          Set clear, achievable goals to stay motivated and track your progress
          effectively. Break larger goals into smaller, manageable tasks for
          better focus.
        </p>
      </div>
    </div>
  );
};

export default AiCoachTip;
