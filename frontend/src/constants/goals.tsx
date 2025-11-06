import { GoalCategory } from "@/types";
import {
  Dumbbell,
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  LucideIcon,
  Sparkles,
  Clock,
} from "lucide-react";

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export const goalCategoryConfig: Record<GoalCategory, CategoryConfig> = {
  "Health & Fitness": {
    label: "Health & Fitness",
    icon: Dumbbell,
    iconColor: "text-green-600",
    bgColor: "bg-green-100 hover:bg-green-200",
  },
  Career: {
    label: "Career",
    icon: Briefcase,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100 hover:bg-blue-200",
  },
  Relationships: {
    label: "Relationships",
    icon: Heart,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-100 hover:bg-pink-200",
  },
  Finance: {
    label: "Finance",
    icon: DollarSign,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100 hover:bg-emerald-200",
  },
  Education: {
    label: "Education",
    icon: GraduationCap,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100 hover:bg-purple-200",
  },
  PersonalGrowth: {
    label: "Personal Growth",
    icon: Sparkles,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100 hover:bg-indigo-200",
  },
  Productivity: {
    label: "Productivity",
    icon: Clock,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-100 hover:bg-yellow-200",
  },
};

export const goalCategoryOptions = Object.values(goalCategoryConfig);

export const goalCategories = Object.keys(goalCategoryConfig) as GoalCategory[];
