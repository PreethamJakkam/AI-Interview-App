import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Pro | Practice Technical Interviews with AI",
  description: "Master technical interviews with AI-powered practice sessions. Get personalized questions, instant feedback, and improvement plans.",
  keywords: ["interview prep", "technical interview", "AI interview", "coding interview", "practice interview"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
