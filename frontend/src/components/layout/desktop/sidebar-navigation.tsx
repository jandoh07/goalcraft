"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Goal, ListTodo, ChartLine, Calendar } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const sidebarItems = [
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
    label: "Schedule",
    icon: Calendar,
    href: "/schedule",
  },
  {
    id: 4,
    label: "Analytics",
    icon: ChartLine,
    href: "/analytics",
  },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <>
      {sidebarItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              size="lg"
              isActive={isActive}
              className="w-[95%] rounded-lg mx-auto p-0"
            >
              <Link
                href={item.href}
                className="flex flex-row items-center gap-2 w-full h-full pl-2"
              >
                <IconComponent className="size-6" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
