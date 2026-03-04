import type { Metadata } from "next";
import { AboutHero } from "./about-hero";
import { AboutMission } from "./about-mission";
import { AboutTeam } from "./about-team";
import { AboutValues } from "./about-values";

export const metadata: Metadata = {
  title: "About GoalCraft",
  description:
    "Learn about GoalCraft's mission to help people achieve their goals through AI-powered productivity tools.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
    </>
  );
}
