"use client";

import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AuthLayout = ({
  children,
  title,
  description,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-linear-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        <Image
          src="/img-auth-2.png"
          alt="GoalCraft Illustration"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
};
