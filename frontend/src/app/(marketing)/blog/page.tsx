import type { Metadata } from "next";
import { BlogHero } from "./blog-hero";
import { BlogList } from "./blog-list";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, insights, and strategies for achieving your goals and boosting productivity.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <BlogList />
    </>
  );
}
