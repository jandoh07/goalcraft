import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://goalcraft.dev"
  ),
  title: {
    default: "GoalCraft - Set Better Goals. Achieve More.",
    template: "%s | GoalCraft",
  },
  description:
    "Stop failing your goals. GoalCraft uses AI and the SMART framework to turn your ambitions into actionable plans. Join the waitlist for early access.",
  keywords: [
    "SMART goals app",
    "AI goal setting",
    "productivity tool",
    "goal tracker",
    "task management",
    "GoalCraft",
  ],

  // Open Graph = How your link looks when shared on Facebook/LinkedIn/Discord
  openGraph: {
    title: "GoalCraft - Set Better Goals. Achieve More.",
    description:
      "Don't start 2026 without a plan. Join the GoalCraft waitlist for early access to the AI-powered goal setter.",
    url: "https://goalcraft.dev",
    siteName: "GoalCraft",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoalCraft Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalCraft - Set Better Goals. Achieve More.",
    description:
      "Turn your ambitions into a simple, trackable plan with AI. Join the beta waitlist today.",
    images: ["/og-image.png"],
  },

  // Icons configuration (Optional if you use file-based convention, but good to have)
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </CSPostHogProvider>
    </html>
  );
}
