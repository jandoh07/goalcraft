import { Heart, Lightbulb, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "User-First",
    description:
      "Every feature we build starts with understanding our users' needs and challenges.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We leverage cutting-edge AI to make goal achievement smarter and more intuitive.",
  },
  {
    icon: Shield,
    title: "Privacy",
    description:
      "Your goals are personal. We take privacy seriously and never sell your data.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description:
      "GoalCraft works offline because productivity shouldn't depend on connectivity.",
  },
];

export function AboutValues() {
  return (
    <section className="py-20 sm:py-32">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Our Values
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <div key={value.title} className="text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <value.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
