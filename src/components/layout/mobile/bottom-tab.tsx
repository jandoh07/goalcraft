import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { avatarFallbackInitial } from "@/lib/utils";
import { ChartLine, CircleUserRound, Goal, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabItems = [
  {
    id: 1,
    label: "Goals",
    icon: Goal,
    href: "/goals",
  },
  {
    id: 2,
    label: "Tasks",
    icon: ListTodo,
    href: "/tasks",
  },
  {
    id: 3,
    label: "Analytics",
    icon: ChartLine,
    href: "/analytics",
  },
  {
    id: 4,
    label: "Profile",
    icon: CircleUserRound,
    href: "/profile",
  },
];

const BottomTab = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="flex justify-around items-center fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border">
      {tabItems.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className={`flex flex-col items-center ${
            pathname === item.href ? "text-accent" : "text-foreground"
          }`}
        >
          {item.label === "Profile" ? (
            <Avatar>
              <AvatarImage
                src={user?.photoURL || ""}
                alt="User Profile Picture"
              />
              <AvatarFallback>
                {avatarFallbackInitial(user?.name, user?.displayName || "")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <item.icon className="size-6 my-1" />
          )}
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomTab;
