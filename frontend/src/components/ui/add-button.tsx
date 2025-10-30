import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./button";
import { Plus } from "lucide-react";

interface AddButtonProps {
  className?: string;
  onClick?: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ className, onClick }) => {
  return (
    <div
      className={cn("fixed right-5 bottom-23 md:bottom-5", className)}
      onClick={onClick}
    >
      <Button
        variant={"default"}
        size={"icon-lg"}
        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg h-15 w-15"
      >
        <Plus className="size-8" />
      </Button>
    </div>
  );
};

export default AddButton;
