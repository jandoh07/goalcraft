import { Crown, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";

const Subscription = () => {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.subscription === "free" ? (
          <>
            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
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

            <div className="rounded-lg bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
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

              <Button className="w-full bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-linear-to-br from-yellow-400/10 via-orange-500/5 to-transparent border border-yellow-400/20 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
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
  );
};

export default Subscription;
