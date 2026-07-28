import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "NEXORA — Understand the system before you enter the market",
  description:
    "An interactive crypto education experience: how blockchains work, a beginner roadmap, honest strategy breakdowns, a paper-trading simulator, and a risk laboratory. Education only — never financial advice.",
};

export const viewport: Viewport = {
  themeColor: "#05060e",
};

const themeScript = `
try {
  if (localStorage.getItem('nexora-theme') === 'midnight') {
    document.documentElement.dataset.theme = 'midnight';
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
