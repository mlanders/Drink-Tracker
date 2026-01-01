import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Drink Tracker",
    template: "%s | Drink Tracker",
  },
  description:
    "Track your alcohol consumption. Monitor your drinking habits and celebrate sober days.",
  keywords: [
    "drink tracker",
    "alcohol tracker",
    "sobriety",
    "health",
    "wellness",
    "moderation",
  ],
  authors: [{ name: "Drink Tracker" }],
  creator: "Drink Tracker",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Drink Tracker",
    description: "Track your alcohol consumption and celebrate sober days",
    siteName: "Drink Tracker",
  },
  twitter: {
    card: "summary",
    title: "Drink Tracker",
    description: "Track your alcohol consumption and celebrate sober days",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
