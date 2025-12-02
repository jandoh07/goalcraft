"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Image from "next/image";
import { ListTodo, Goal, ChartLine, Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import NotificationSidebar from "@/components/notifications/notifications-sidebar";
import { useNotification } from "@/contexts/notification-context";

const sidebarItems = [
  {
    id: 1,
    label: "Goals",
    icon: Goal,
    href: "/",
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
  const { user } = useAuth();
  const { openNotifications, notifications } = useNotification();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen w-full relative">
          <Sidebar>
            <SidebarHeader>
              <Image
                src="/logo.png"
                alt="Logo"
                width={130}
                height={60}
                className="dark:invert dark:brightness-0 dark:contrast-200"
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
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <Avatar className="h-8 w-8 rounded-lg grayscale">
                          <AvatarImage
                            src={user?.photoURL || ""}
                            alt={user?.name || "User Profile Picture"}
                          />
                          <AvatarFallback className="rounded-lg">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {user?.name || "User"}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user?.subscription === "premium"
                              ? "Premium Plan"
                              : "Free Plan"}
                          </span>
                        </div>
                        <IconDotsVertical className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                      side="right"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuItem disabled>
                        {user?.email}
                      </DropdownMenuItem>
                      {user?.subscription !== "premium" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Sparkles />
                            Upgrade to Pro
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <IconUserCircle />
                          Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconCreditCard />
                          Billing
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <IconLogout />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 flex flex-col bg-background">
            <div className="flex items-center justify-between p-4">
              <SidebarTrigger />
              <button
                onClick={openNotifications}
                className="p-2 hover:bg-accent rounded-lg transition-colors relative"
                aria-label="Open notifications"
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex-1 p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
      <NotificationSidebar />
    </>
  );
};

export default DesktopLayout;
