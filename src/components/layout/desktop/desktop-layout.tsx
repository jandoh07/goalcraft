"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar";
import Image from "next/image";
import { ListTodo, Goal, ChartLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    label: "Analytics",
    icon: ChartLine,
    href: "/analytics",
  },
];

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <Image
              src="/logo.png"
              alt="Logo"
              width={130}
              height={60}
              // className="backdrop-hue-rotate-90"
            />
          </SidebarHeader>
          <SidebarContent className="mt-4">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    size="lg"
                    isActive={isActive}
                    className="w-[95%] rounded-lg mx-auto"
                  >
                    <Link
                      href={item.href}
                      className="flex flex-row items-center gap-2 pl-2 w-full"
                    >
                      <IconComponent className="size-6" />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarContent>
          <SidebarFooter>
            <Link
              href="/profile"
              className="flex flex-row items-center gap-2 bg-background p-2 rounded-lg"
            >
              <Avatar className="size-10">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Sarah Carter</p>
                <p className="text-xs text-sidebar-ring">Premium Plan</p>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col bg-background">
          <div className="flex items-center p-4">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DesktopLayout;
