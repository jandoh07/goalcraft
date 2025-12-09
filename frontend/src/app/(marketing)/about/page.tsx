import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GoalCraft",
  description: "Learn how GoalCraft helps you achieve more offline.",
  alternates: {
    canonical: "/about",
  },
};

const About = () => {
  return <div>About</div>;
};

export default About;
