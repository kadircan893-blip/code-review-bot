import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Code Review Bot",
    default: "Code Review Bot — AI-Powered PR Reviews",
  },
  description:
    "Automatically review every Pull Request with Claude AI. Get instant code analysis, security checks, and actionable feedback posted directly to your GitHub PRs.",
  keywords: [
    "code review",
    "GitHub",
    "pull request",
    "AI",
    "Claude",
    "automated review",
    "developer tools",
  ],
  authors: [{ name: "Code Review Bot" }],
  openGraph: {
    title: "Code Review Bot — AI-Powered PR Reviews",
    description:
      "Automatically review every Pull Request with Claude AI.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Review Bot — AI-Powered PR Reviews",
    description:
      "Automatically review every Pull Request with Claude AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#18181b",
                    border: "1px solid #27272a",
                    color: "#fafafa",
                  },
                }}
              />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
