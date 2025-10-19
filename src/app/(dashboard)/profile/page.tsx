"use client";

import MobileHeader from "@/components/layout/mobile/header";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Bell,
  Crown,
  User,
  Lock,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

const Profile = () => {
  const { setTheme, theme } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
    subscription: "premium", // "free" | "premium"
    joinDate: "January 2025",
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 pb-4">
      <MobileHeader title="Profile" />

      <div className="space-y-6 mt-6">
        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Dark Theme
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for better viewing at night
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label
                    htmlFor="push-notifications"
                    className="text-base font-medium"
                  >
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about task reminders and updates
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subscription === "free" ? (
              <>
                <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Free Plan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You&apos;re currently on the free plan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Upgrade to Premium</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Unlock advanced features and AI-powered insights
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Unlimited goals and tasks
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Advanced AI coach recommendations
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Priority support
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Detailed analytics and insights
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-gradient-to-br from-yellow-400/10 via-orange-500/5 to-transparent border border-yellow-400/20 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Premium Plan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You have access to all premium features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next billing date: February 19, 2025
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                >
                  Cancel Subscription
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-sm text-muted-foreground max-w-49 md:max-w-full text-ellipsis overflow-hidden">
                    Update your name, email, and avatar
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Change Password</div>
                  <div className="text-sm text-muted-foreground max-w-49 md:max-w-full text-ellipsis overflow-hidden">
                    Update your account password
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Separator className="my-2" />

            <Button
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 hover:bg-destructive/10 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Sign Out</div>
                  <div className="text-sm opacity-80">
                    Sign out of your account
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        {/* <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>GoalCraft v1.0.0</p>
            <p className="mt-1">© 2025 GoalCraft. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Button variant="link" className="h-auto p-0 text-xs">
                Privacy Policy
              </Button>
              <Button variant="link" className="h-auto p-0 text-xs">
                Terms of Service
              </Button>
              <Button variant="link" className="h-auto p-0 text-xs">
                Help Center
              </Button>
            </div>
          </CardContent>
        </Card> */}

        <div className="w-full h-20 md:hidden"></div>
      </div>
    </div>
  );
};

export default Profile;
