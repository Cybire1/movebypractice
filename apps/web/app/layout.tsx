import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthProvider";
import SmoothScroll from "./components/SmoothScroll";
import Header from "./components/Header";
import DataMigrationNotice from "./components/auth/DataMigrationNotice";
import DisplayNameModal from "./components/DisplayNameModal";
import SuiProviders from "./components/SuiProviders";
import ThemeProvider from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glide | Learn Move & Sui Development",
  description: "Interactive, gamified platform to master Move and build on Sui through hands-on practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-sui-accent selection:text-sui-navy`}>
        <ThemeProvider>
          <SuiProviders>
            <AuthProvider>
              <SmoothScroll />
              <Header />

              {/* Main Content Wrapper */}
              <div className="relative z-10">
                {children}
              </div>

              <div className="bg-noise absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10" />
              <DataMigrationNotice />
              <DisplayNameModal />
            </AuthProvider>
          </SuiProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
