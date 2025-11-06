import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { goalCategoryOptions } from "@/constants/goals";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface GoalCategoriesProps {
  category: string;
  setCategory: (category: string) => void;
  onNewCategory?: (categoryName: string) => void;
}

const GoalCategories = ({
  category,
  setCategory,
  onNewCategory,
}: GoalCategoriesProps) => {
  const [addCategory, setAddCategory] = useState(false);
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<string[]>(
    user?.customCategories || []
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryOptions, setCategoryOptions] = useState(goalCategoryOptions);

  const handleSelectCustomCategory = (value: string) => {
    const hasCustomCategory =
      categoryOptions.length > goalCategoryOptions.length;

    if (hasCustomCategory) {
      setCategoryOptions((prevOptions) => [
        ...prevOptions.slice(0, -1),
        {
          label: value,
          icon: PlusCircle,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
        },
      ]);
    } else {
      setCategoryOptions((prevOptions) => [
        ...prevOptions,
        {
          label: value,
          icon: PlusCircle,
          bgColor: "bg-gray-100",
          iconColor: "text-gray-600",
        },
      ]);
    }

    setCategory(value);
  };

  const handleAddCustomCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = newCategoryName.trim();

      setCustomCategories([...customCategories, newCategory]);

      const hasCustomCategory =
        categoryOptions.length > goalCategoryOptions.length;

      if (hasCustomCategory) {
        setCategoryOptions((prevOptions) => [
          ...prevOptions.slice(0, -1),
          {
            label: newCategory,
            icon: PlusCircle,
            bgColor: "bg-gray-100",
            iconColor: "text-gray-600",
          },
        ]);
      } else {
        setCategoryOptions((prevOptions) => [
          ...prevOptions,
          {
            label: newCategory,
            icon: PlusCircle,
            bgColor: "bg-gray-100",
            iconColor: "text-gray-600",
          },
        ]);
      }

      setCategory(newCategory);

      if (onNewCategory && !customCategories.includes(newCategory)) {
        onNewCategory(newCategory);
      }

      setNewCategoryName("");
      setAddCategory(false);
    }
  };

  const handleCancelAddCategory = () => {
    setNewCategoryName("");
    setAddCategory(false);
  };

  return (
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
                "w-full h-12 justify-start text-left font-normal gap-2 border-0 hover:text-foreground",
                categoryOption.bgColor,
                isSelected &&
                  "ring-2 ring-offset-2 ring-offset-background ring-primary"
              )}
            >
              <IconComponent
                className={cn("size-5 shrink-0", categoryOption.iconColor)}
              />
              <span className="truncate font-medium">
                {categoryOption.label}
              </span>
            </Button>
          );
        })}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-12 w-full rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200">
              <div className="flex items-center gap-2">
                <PlusCircle className="size-5 shrink-0 text-gray-600" />
                <span className="truncate font-semibold text-sm">
                  Other / Custom
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {customCategories.map((customCategory) => (
                <DropdownMenuItem
                  key={customCategory}
                  onSelect={() => handleSelectCustomCategory(customCategory)}
                >
                  {customCategory}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => setAddCategory(true)}>
                Add Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {addCategory && (
        <div className="mt-2">
          <Input
            id="custom-category"
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCustomCategory();
              } else if (e.key === "Escape") {
                handleCancelAddCategory();
              }
            }}
          />
          <div className="flex justify-end mt-2 gap-3 items-center">
            <button
              type="button"
              className="text-xs"
              onClick={handleCancelAddCategory}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-1 text-xs text-accent rounded-2xl cursor-pointer bg-accent/20 hover:bg-accent/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddCustomCategory}
              disabled={!newCategoryName.trim()}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCategories;
