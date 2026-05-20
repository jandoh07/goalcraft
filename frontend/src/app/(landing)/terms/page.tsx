import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions for using GoalCraft's goal setting and task management service.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mb-8 text-muted-foreground">
          Last updated: January 31, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using GoalCraft, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Description of Service
            </h2>
            <p className="text-muted-foreground">
              GoalCraft is an AI-powered goal setting and task management
              application. We provide tools to help you set goals, break them
              into tasks, schedule your work, and track your progress.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">User Accounts</h2>
            <p className="mb-4 text-muted-foreground">
              To use GoalCraft, you must create an account. You agree to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Acceptable Use</h2>
            <p className="mb-4 text-muted-foreground">You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or content</li>
              <li>Violate the rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              The GoalCraft service, including its design, features, and
              content, is owned by us and protected by intellectual property
              laws. You retain ownership of the content you create within the
              app.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Termination</h2>
            <p className="text-muted-foreground">
              You may terminate your account at any time. We may suspend or
              terminate your access if you violate these terms. Upon
              termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground">
              GoalCraft is provided &ldquo;as is&rdquo; without warranties of
              any kind. We do not guarantee that the service will be
              uninterrupted, error-free, or meet your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, GoalCraft shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              notify users of material changes via email or in-app notification.
              Continued use after changes constitutes acceptance of the new
              terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at
              legal@goalcraft.app.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
