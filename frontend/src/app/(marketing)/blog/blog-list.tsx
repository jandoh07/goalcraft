import Link from "next/link";
import { Calendar } from "lucide-react";
import { blogPosts } from "./blog-data";

export function BlogList() {
  return (
    <section className="pb-20 sm:pb-32">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
          >
            {/* Image placeholder */}
            <div className="aspect-video bg-muted">
              <div className="flex h-full items-center justify-center text-4xl">
                {post.emoji}
              </div>
            </div>

            <div className="p-6">
              {/* Category */}
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {post.category}
              </span>

              {/* Title */}
              <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-primary">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              {/* Excerpt */}
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
