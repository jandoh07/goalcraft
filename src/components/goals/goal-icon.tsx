import React from "react";
import { Badge } from "../ui/badge";
import { goalCategoryConfig } from "@/constants";

interface GoalIconProps {
  category: string;
}

const GoalIcon: React.FC<GoalIconProps> = ({ category }) => {
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
  };

  return (
    <Badge variant={"outline"} className="px-2">
      {getCategoryIcon()}
      {category}
    </Badge>
  );
};

export default GoalIcon;
