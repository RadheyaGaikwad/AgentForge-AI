import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentForge — Your AI Engineering Company",
  description:
    "Deploy autonomous AI engineers that collaborate in real-time to build complete software from a single prompt.",
  keywords: [
    "AI engineering",
    "autonomous agents",
    "software development",
    "multi-agent AI",
    "AI operating system",
  ],
  openGraph: {
    title: "AgentForge — Your AI Engineering Company",
    description: "One Prompt. Infinite Possibilities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
