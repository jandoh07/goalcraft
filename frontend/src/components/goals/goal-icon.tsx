import React from "react";
import { Badge } from "../ui/badge";
import { goalCategoryConfig } from "@/constants";
import { CircleQuestionMark } from "lucide-react";

interface GoalIconProps {
  category: string;
  onlyIcon?: boolean;
}

const GoalIcon: React.FC<GoalIconProps> = ({ category, onlyIcon }) => {
  const getCategoryIcon = () => {
    const categoryIconConfig =
      goalCategoryConfig[category as keyof typeof goalCategoryConfig];

    if (categoryIconConfig) {
      const IconComponent = categoryIconConfig.icon;
      return (
        <IconComponent
          className={`inline-block mr-1 ${categoryIconConfig.iconColor}`}
        />
      );
    }

    return <CircleQuestionMark className="inline-block mr-1 text-gray-500" />;
  };

  return onlyIcon ? (
    getCategoryIcon()
  ) : (
    <Badge variant={"outline"} className="px-2">
      {getCategoryIcon()}
      {category}
    </Badge>
  );
};

export default GoalIcon;
