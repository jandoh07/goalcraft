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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconLogout } from "@tabler/icons-react";
import Image from "next/image";
import {
  ListTodo,
  Goal,
  ChartLine,
  Bell,
  Sparkles,
  Settings,
  Info,
  ExternalLink,
  Palette,
  Sun,
  Moon,
  Monitor,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import NotificationSidebar from "@/components/notifications/notifications-sidebar";
import { useNotification } from "@/contexts/notification-context";
import { useTheme } from "next-themes";

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
  const { user, logout, isAnonymous } = useAuth();
  const { openNotifications, notifications } = useNotification();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

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
                        {isAnonymous ? (
                          <>
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                              <LogIn className="size-4 text-primary" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium">
                                Login / Sign Up
                              </span>
                              <span className="text-muted-foreground truncate text-xs">
                                Create an account
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                        <IconDotsVertical className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                      side="right"
                      align="end"
                      sideOffset={4}
                    >
                      {isAnonymous ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/login" className="cursor-pointer">
                              <LogIn className="size-4" />
                              Login
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/signup" className="cursor-pointer">
                              <Sparkles className="size-4" />
                              Sign Up
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="cursor-pointer">
                            <Settings />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Palette />
                            Theme
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() => setTheme("light")}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Sun className="size-4" />
                                Light
                              </span>
                              {theme === "light" && (
                                <span className="text-primary">✓</span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTheme("dark")}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Moon className="size-4" />
                                Dark
                              </span>
                              {theme === "dark" && (
                                <span className="text-primary">✓</span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTheme("system")}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <Monitor className="size-4" />
                                System
                              </span>
                              {theme === "system" && (
                                <span className="text-primary">✓</span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Info />
                            Learn More
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/about"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center w-45 cursor-pointer"
                              >
                                About GoalCraft
                                <ExternalLink />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/blog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center w-45 cursor-pointer"
                              >
                                Blog
                                <ExternalLink />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center w-45 cursor-pointer"
                              >
                                Privacy Policy
                                <ExternalLink />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center w-45 cursor-pointer"
                              >
                                Terms & Conditions
                                <ExternalLink />
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>
                      {!isAnonymous && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogOut}>
                            <IconLogout />
                            Log out
                          </DropdownMenuItem>
                        </>
                      )}
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
