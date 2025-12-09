"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AppPreferences from "@/components/profile/app-preferences";
import Subscription from "@/components/profile/subscription";
import AccountSettings from "@/components/profile/account-settings";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const Profile = () => {
  const { isAnonymous } = useAuth();

  return (
    <div className="max-w-7xl h-full mx-auto p-3 pb-4">
      <MobileHeader title="Profile" />
      <div className="space-y-6 mt-6">
        <AppPreferences />

        {isAnonymous ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up or log in to save your progress and access all
                  features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Guest Account</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You&apos;re currently browsing as a guest. Your data may
                        be lost if you don&apos;t create an account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/signup">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Create an account to unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Premium Plan</h3>
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
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/pricing">
                      <Sparkles className="mr-2 h-4 w-4" />
                      View Pricing
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Subscription />
            <AccountSettings />
          </>
        )}

        <div className="w-full h-20 md:hidden"></div>
      </div>
    </div>
  );
};

export default Profile;
