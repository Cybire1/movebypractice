"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
    {
        number: "01",
        title: "Pick a Lesson",
        description: "Choose from 23 interactive modules covering Move fundamentals, messaging SDKs, and DeFi protocols on Sui.",
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.467.89 6.065 2.352m0-14.31A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.352" />
            </svg>
        ),
    },
    {
        number: "02",
        title: "Write & Test",
        description: "Write Move code in the browser IDE with instant feedback, guided hints, and real-time error detection.",
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        ),
        highlight: true,
    },
    {
        number: "03",
        title: "Deploy to Sui",
        description: "Deploy to Sui Testnet and mint proof-of-knowledge NFT certificates. Build your on-chain developer portfolio.",
        icon: (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        ),
    },
];

export default function TimelineSection() {
    return (
        <section id="how-it-works" className="py-24 md:py-32 px-6 bg-surface relative overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:60px_60px] opacity-60" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 md:mb-24"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary rounded-full text-sm font-semibold text-foreground-secondary mb-8"
                    >
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        The Process
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        From Zero to <span className="text-foreground-tertiary">Deploy in Minutes.</span>
                    </h2>
                    <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
                        Three steps to go from beginner to shipping on Sui.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="relative grid md:grid-cols-3 gap-8 md:gap-12 mb-16">
                    {/* Horizontal connector line (desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-[1px] bg-[var(--border-default)] z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            {/* Background number */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10rem] md:text-[12rem] font-bold text-surface-secondary opacity-50 select-none pointer-events-none leading-none z-0">
                                {step.number}
                            </div>

                            {/* Circle icon */}
                            <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-8 ${
                                step.highlight
                                    ? 'bg-black text-white'
                                    : 'bg-surface text-foreground border border-[var(--border-default)]'
                            }`}>
                                {step.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                                {step.title}
                            </h3>
                            <p className="text-foreground-secondary text-lg leading-relaxed max-w-xs relative z-10">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link href="/lessons">
                        <span className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-bold text-lg shadow-xl hover:-translate-y-0.5">
                            View All Lessons
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
