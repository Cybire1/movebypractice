'use client';

import { motion } from "framer-motion";
import Hero from "./components/Hero";
import Link from "next/link";
import InteractiveFeatureGrid from "@/app/components/features/InteractiveFeatureGrid";
import TimelineSection from "@/app/components/TimelineSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-foreground selection:bg-sui-accent selection:text-sui-navy">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-6 bg-surface-tertiary relative z-20"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-full text-sm font-semibold border border-[var(--border-default)]">
                Features
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold font-sans mb-6 text-foreground">
              Everything You Need to <span className="text-foreground-tertiary">Master Move</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
              A complete learning platform designed for developers who want to build on Sui.
            </p>
          </motion.div>

          <InteractiveFeatureGrid />
        </div>
      </section>

      {/* How It Works */}
      <TimelineSection />

      {/* Testimonials & Partner Logos */}
      <TestimonialsSection />

      {/* CTA */}
      <section className="relative py-8 md:py-12 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#050505] border border-white/10 shadow-2xl"
          >
            {/* Noise texture */}
            <div className="absolute inset-0 bg-noise-overlay opacity-[0.07] pointer-events-none mix-blend-overlay" />

            {/* Animated gradient orbs */}
            <motion.div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"
              animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"
              animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 p-8 md:p-16 lg:p-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      Accepting New Students
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4">
                    Ready to <br />
                    <span className="text-gray-500">break stuff?</span>
                  </h2>
                </motion.div>
              </div>

              <motion.div
                className="flex flex-col items-start md:items-end justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-md text-left md:text-right leading-relaxed">
                  Join the cohort defining the future of on-chain finance on Sui.
                </p>

                <Link href="/lessons">
                  <motion.span
                    className="group relative inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-white text-black rounded-full text-lg font-bold overflow-hidden shadow-lg cursor-pointer"
                    whileHover={{
                      boxShadow: "0 0 40px -5px rgba(255,255,255,0.3)",
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span>Start Building</span>
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
