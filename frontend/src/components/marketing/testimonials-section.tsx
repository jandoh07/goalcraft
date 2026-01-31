const testimonials = [
  {
    quote:
      "GoalCraft completely changed how I approach my goals. The AI suggestions are incredibly helpful!",
    author: "Sarah M.",
    role: "Product Manager",
    avatar: "👩‍💼",
  },
  {
    quote:
      "The offline support is a game-changer. I can update my tasks anywhere, even on flights.",
    author: "James L.",
    role: "Freelance Developer",
    avatar: "👨‍💻",
  },
  {
    quote:
      "I've tried many task apps, but GoalCraft's goal-to-task breakdown is exactly what I needed.",
    author: "Emily R.",
    role: "Startup Founder",
    avatar: "👩‍🚀",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-20 sm:py-32">
      <div>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Achievers Everywhere
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users have to say about their experience with
            GoalCraft.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-xl border bg-card p-6"
            >
              <p className="mb-6 text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
