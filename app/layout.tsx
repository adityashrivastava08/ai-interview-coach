import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // Import our new session layer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntervAI - Technical Interview Coach",
  description: "Practice technical interviews with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        {/* Wrapping children inside AuthProvider lets every page know who is signed in */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
