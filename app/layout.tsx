import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#58cc02", // Duo Green
          colorBackground: "#0a0e0a", // --bg-base
          colorInput: "#1c261b", // --bg-elevated
          colorInputForeground: "#f0f4f0", // --text-primary
          colorForeground: "#f0f4f0", // --text-primary
          colorMutedForeground: "#afbfae", // --text-secondary
          colorBorder: "#2b3b29", // --border-default
          borderRadius: "12px", // --radius
          fontFamily: "var(--font-din-round)",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
