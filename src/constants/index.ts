import {
  Dumbbell,
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  Palette,
  LucideIcon,
} from "lucide-react";

export const goalCategoryOptions: {
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
