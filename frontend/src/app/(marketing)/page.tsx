import type { Metadata } from "next";
import {
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "GoalCraft — AI-Powered Goal Setting & Task Management",
  description:
    "Transform your goals into achievements with AI-powered task management. Break down goals, schedule intelligently, and track progress. Works offline.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
