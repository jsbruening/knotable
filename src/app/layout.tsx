import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/components/auth/auth-provider";
import { Toaster } from "~/components/ui/sonner";
import { GlobalNav } from "~/components/global-nav";

export const metadata: Metadata = {
  title: "Knotable - Gamified Learning Platform",
  description:
    "Level up your learning with AI-generated campaigns, teams, and gamification",
  icons: [
    { rel: "icon", url: "/images/logo.png" },
    { rel: "shortcut icon", url: "/images/logo.png" },
    { rel: "apple-touch-icon", url: "/images/logo.png" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-app-gradient">
        <TRPCReactProvider>
          <AuthProvider>
            <GlobalNav />
            {children}
            <Toaster />
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
