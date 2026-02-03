import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthProvider";
import SmoothScroll from "./components/SmoothScroll";
import Header from "./components/Header";
import DataMigrationNotice from "./components/auth/DataMigrationNotice";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leo by Practice | Master Zero-Knowledge Programming",
  description: "Interactive, gamified platform to learn Aleo's Leo language and build zero-knowledge applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-aleo-green selection:text-aleo-navy`}>
        <AuthProvider>
          <SmoothScroll />
          <Header />

          {/* Main Content Wrapper */}
          <div className="relative z-10">
            {children}
          </div>

          <div className="bg-noise absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10" />
          <DataMigrationNotice />
        </AuthProvider>
      </body>
    </html>
  );
}
