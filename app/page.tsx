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
      <section className="relative py-24 md:py-32 bg-surface overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-surface-secondary text-foreground-secondary text-sm font-mono font-bold rounded-full mb-6">
              Accepting New Students
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
              Ready to break stuff?
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto mb-10">
              Join the cohort defining the future of on-chain finance on Sui.
            </p>
            <Link href="/lessons">
              <span className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full hover:bg-zinc-800 transition-all font-bold text-lg hover:-translate-y-1">
                <span>Start Building</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
