const faqs = [
  {
    question: "Can I use GoalCraft for free?",
    answer:
      "Yes! Our free tier includes up to 3 active goals, unlimited tasks, and basic AI features. It's free forever with no credit card required.",
  },
  {
    question: "What happens when I hit the free tier limits?",
    answer:
      "You'll need to upgrade to Pro to add more goals. Your existing data is never deleted - you can still view and edit your current goals and tasks.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel at any time from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use industry-standard encryption for all data. Your goals and tasks are private and we never sell your data to third parties.",
  },
  {
    question: "Does GoalCraft work offline?",
    answer:
      "Yes! GoalCraft is a Progressive Web App (PWA) that works fully offline. Changes sync automatically when you're back online.",
  },
];

export function PricingFAQ() {
  return (
    <section className="bg-muted/30 py-20 sm:py-32">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto max-w-3xl space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border bg-card p-6">
            <h3 className="mb-2 font-semibold">{faq.question}</h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
