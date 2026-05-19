import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how GoalCraft collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mb-8 text-muted-foreground">
          Last updated: January 31, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground">
              GoalCraft (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Information We Collect
            </h2>
            <p className="mb-4 text-muted-foreground">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Account information (email address, name)</li>
              <li>Goals, tasks, and related content you create</li>
              <li>Usage data and preferences</li>
              <li>Device information for offline sync</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              How We Use Your Information
            </h2>
            <p className="mb-4 text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate AI-powered suggestions and recommendations</li>
              <li>Sync your data across devices</li>
              <li>Send you updates and notifications (with your consent)</li>
              <li>Respond to your requests and support needs</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Data Storage</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using Firebase services. We use
              industry-standard encryption to protect your information both in
              transit and at rest. Your data remains accessible offline through
              local device storage.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties. We may share anonymized, aggregated
              data for analytics purposes that cannot be used to identify you.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Your Rights</h2>
            <p className="mb-4 text-muted-foreground">You have the right to:</p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your session and preferences.
              We do not use third-party tracking cookies. You can control cookie
              settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              at privacy@goalcraft.app.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
