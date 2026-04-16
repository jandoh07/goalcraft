import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";
import { AppProgressProvider } from "@/components/providers/progress-provider";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === "staging";
const APP_NAME = "GoalCraft";
const APP_DEFAULT_TITLE = "GoalCraft — Set and Achieve Your Goals";
const APP_TITLE_TEMPLATE = "%s | GoalCraft";
const APP_DESCRIPTION =
  "An AI-powered PWA for goal setting, task tracking, and productivity.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  robots: isStaging ? "noindex, nofollow" : "index, follow",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/web-app-manifest-192x192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(0.985 0 0)" },
    {
      media: "(prefers-color-scheme: dark)",
      color: "oklch(0.2781 0.0296 256.85)",
    },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppProgressProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <ServiceWorkerProvider />
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        </AppProgressProvider>
      </body>
    </html>
  );
}
