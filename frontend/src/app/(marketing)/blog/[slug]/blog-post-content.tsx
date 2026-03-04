import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "../blog-data";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <article className="py-20 sm:py-32">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-12">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {post.category}
          </span>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-lg">
                {post.author.avatar}
              </div>
              <span>{post.author.name}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        {/* Featured image placeholder */}
        <div className="mb-12 aspect-video overflow-hidden rounded-xl bg-muted">
          <div className="flex h-full items-center justify-center text-8xl">
            {post.emoji}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="lead text-xl text-muted-foreground">{post.excerpt}</p>
          <div className="mt-8 whitespace-pre-line text-muted-foreground">
            {post.content}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold">
            Ready to achieve your goals?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Start using GoalCraft today and turn your goals into reality.
          </p>
          <Button asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
