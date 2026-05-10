"use client";

import { motion } from "framer-motion";
import PartnerLogos from "./PartnerLogos";

const testimonials = [
    {
        name: "Julian Soler",
        role: "Frontend Lead @ SuiVision",
        text: "Shipping on Sui felt daunting until I found Glide. The interactive examples are a literal cheat code.",
    },
    {
        name: "Elena Zhang",
        role: "Security Researcher @ OtterSec",
        text: "I've audited smart contracts for years. This platform teaches the security patterns that actually matter.",
    },
    {
        name: "Marcus Kane",
        role: "DeFi Architect @ Scallop",
        text: "From Solidity veteran to Move expert in 2 weeks. The ownership explanations finally make sense.",
    },
    {
        name: "Tariq Al-Fayed",
        role: "Indie Developer @ Stealth",
        text: "The gamified approach kept me hooked. I deployed my first mainnet dApp before finishing module 3.",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="py-32 bg-surface relative overflow-hidden border-t border-[var(--border-subtle)]">
            {/* Partner Logos Marquee */}
            <PartnerLogos />

            <div className="max-w-7xl mx-auto px-6 mt-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Trusted by the <span className="text-foreground-tertiary">Next Generation.</span>
                    </h2>
                </motion.div>

                {/* Testimonial Cards - Draggable Horizontal Scroll */}
                <div className="relative">
                    <motion.div
                        className="flex gap-6 cursor-grab active:cursor-grabbing pb-4"
                        drag="x"
                        dragConstraints={{ left: -800, right: 0 }}
                        style={{ touchAction: "pan-y" }}
                    >
                        {[...testimonials, ...testimonials].map((t, index) => (
                            <motion.div
                                key={`${t.name}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (index % 4) * 0.1, duration: 0.5 }}
                                className="flex-shrink-0 min-w-[85vw] md:min-w-[400px]"
                            >
                                <div className="h-full bg-surface-secondary rounded-3xl p-8 border border-[var(--border-subtle)]">
                                    {/* Quote Mark */}
                                    <div className="text-6xl text-blue-600 mb-6 font-serif opacity-30 leading-none select-none">
                                        &ldquo;
                                    </div>
                                    <p className="text-foreground text-lg leading-relaxed mb-8">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-lg font-bold text-foreground-tertiary border border-[var(--border-subtle)]">
                                            {t.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{t.name}</div>
                                            <div className="text-xs text-foreground-secondary">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
