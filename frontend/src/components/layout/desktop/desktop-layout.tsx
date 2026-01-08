"use client";
import React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import NotificationSidebar from "@/components/notifications/notifications-sidebar";
import { SidebarNavigation } from "./sidebar-navigation";
import { UserNav } from "./user-nav";
import { LayoutHeader } from "./layout-header";

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
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
              <SidebarMenu>
                <SidebarNavigation />
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <UserNav />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 flex flex-col bg-background">
            <LayoutHeader />
            <div className="flex-1 p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
      <NotificationSidebar />
    </>
  );
};

export default DesktopLayout;
