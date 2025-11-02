import { Bot } from "lucide-react";

interface AIThinkingProps {
  isLoading?: boolean;
}

const AIThinking = ({ isLoading }: AIThinkingProps) => {
  return (
    <div className="rounded-full relative size-7 overflow-hidden">
      <div className="p-1 absolute top-[0.15rem] left-[0.15rem] bg-background rounded-full size-6 flex justify-self-center items-center z-10">
        <Bot className="size-5 text-muted-foreground" />
      </div>
      {isLoading && (
        <div className="h-8 w-3 bg-muted-foreground mx-auto animate-spin animation-duration-[1.3s]"></div>
      )}
    </div>
  );
};

export default AIThinking;
