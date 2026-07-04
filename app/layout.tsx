import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
// @ts-ignore: CSS module type declarations may not be present in this repo setup
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // Import our new session layer

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PrepPath - AI Placement Prep Platform",
  description: "Ace your placements with AI mock interviews, resume ATS audit, and DSA skill strengthening.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} h-full`}>
      <body className="font-sans min-h-full bg-background text-foreground antialiased">
        {/* Wrapping children inside AuthProvider lets every page know who is signed in */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

