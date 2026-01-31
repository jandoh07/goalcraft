const team = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    avatar: "👨‍💼",
    bio: "Former product lead at a major tech company. Passionate about productivity and helping people achieve their potential.",
  },
  {
    name: "Maria Santos",
    role: "CTO",
    avatar: "👩‍💻",
    bio: "Full-stack engineer with 10+ years of experience. Loves building tools that make a difference.",
  },
  {
    name: "Jordan Taylor",
    role: "Head of AI",
    avatar: "🧑‍🔬",
    bio: "Machine learning expert focused on making AI helpful and accessible for everyday tasks.",
  },
  {
    name: "Sam Kim",
    role: "Head of Design",
    avatar: "👩‍🎨",
    bio: "UX designer who believes that great design is invisible. Creates experiences that feel natural.",
  },
];

export function AboutTeam() {
  return (
    <section className="bg-muted/30 py-20 sm:py-32">
      <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Meet the Team
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
        We&apos;re a small but mighty team dedicated to helping you achieve your
        goals.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-xl border bg-card p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
              {member.avatar}
            </div>
            <h3 className="mb-1 font-semibold">{member.name}</h3>
            <p className="mb-3 text-sm text-primary">{member.role}</p>
            <p className="text-sm text-muted-foreground">{member.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
