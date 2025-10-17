"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { ComponentProps } from "react";
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

interface AddGoalModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddGoalModal({ open, setOpen }: AddGoalModalProps) {
  const isDesktop = !useIsMobile();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <AddGoalForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Goal</DrawerTitle>
        </DrawerHeader>
        <AddGoalForm className="px-4 max-h-[80vh] overflow-y-auto" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function AddGoalForm({ className }: ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-6", className)}>
      <div className="grid gap-3">
        <AiCoachTip />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="title">Goal Title</Label>
        <Input type="text" id="title" defaultValue="My New Goal" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Input id="description" defaultValue="Description of your goal" />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="category">Category</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categoryOptions.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.label}
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal gap-2 border-0",
                  category.bgColor
                )}
              >
                <IconComponent
                  className={cn("size-5 flex-shrink-0", category.iconColor)}
                />
                <span className="truncate font-medium">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="due-date">Due Date</Label>
        <DatePicker />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
