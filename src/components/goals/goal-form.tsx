"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps, useState, useEffect } from "react";
import { DatePicker } from "../ui/date-picker";
import AiCoachTip from "../ai/ai-coach-tip";
import {
  Dumbbell,
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  Palette,
  LucideIcon,
} from "lucide-react";

const categoryOptions: {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}[] = [
  {
    label: "Health & Fitness",
    icon: Dumbbell,
    iconColor: "text-green-600",
    bgColor: "bg-green-100 hover:bg-green-200",
  },
  {
    label: "Career",
    icon: Briefcase,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100 hover:bg-blue-200",
  },
  {
    label: "Relationships",
    icon: Heart,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-100 hover:bg-pink-200",
  },
  {
    label: "Finance",
    icon: DollarSign,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100 hover:bg-emerald-200",
  },
  {
    label: "Education",
    icon: GraduationCap,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100 hover:bg-purple-200",
  },
  {
    label: "Hobbies",
    icon: Palette,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100 hover:bg-orange-200",
  },
];

export interface GoalFormData {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: Date;
}

interface GoalFormProps extends ComponentProps<"form"> {
  initialData?: GoalFormData;
  mode?: "add" | "edit";
}

export default function GoalForm({
  className,
  initialData,
  mode = "add",
}: GoalFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setDueDate(initialData.dueDate);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      title,
      description,
      category,
      dueDate,
    });
  };
  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <AiCoachTip />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          type="text"
          id="title"
          placeholder="Enter your goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Add goal description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="category">Category</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categoryOptions.map((categoryOption) => {
            const IconComponent = categoryOption.icon;
            const isSelected = category === categoryOption.label;
            return (
              <Button
                key={categoryOption.label}
                type="button"
                variant="outline"
                onClick={() => setCategory(categoryOption.label)}
                className={cn(
                  "w-full h-12 justify-start text-left font-normal gap-2 border-0",
                  categoryOption.bgColor,
                  isSelected &&
                    "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
              >
                <IconComponent
                  className={cn(
                    "size-5 flex-shrink-0",
                    categoryOption.iconColor
                  )}
                />
                <span className="truncate font-medium">
                  {categoryOption.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="due-date">Due Date</Label>
        <DatePicker date={dueDate} onDateChange={setDueDate} />
      </div>
      <Button type="submit" className="hidden md:block">
        {mode === "edit" ? "Update Goal" : "Add Goal"}
      </Button>
    </form>
  );
}
