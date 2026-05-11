"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import PartnerLogos from "./PartnerLogos";

const testimonials = [
    {
        name: "Julian Soler",
        role: "Frontend Lead",
        company: "SuiVision",
        text: "Shipping on Sui felt daunting until I found Glide. The interactive examples are a literal cheat code.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        avatar: "/assets/avatars/avatar-julian.svg",
    },
    {
        name: "Elena Zhang",
        role: "Security Researcher",
        company: "OtterSec",
        text: "I've audited smart contracts for years. This platform teaches the security patterns that actually matter.",
        gradient: "from-purple-500/20 to-pink-500/20",
        avatar: "/assets/avatars/avatar-elena.svg",
    },
    {
        name: "Marcus Kane",
        role: "DeFi Architect",
        company: "Scallop",
        text: "From Solidity veteran to Move expert in 2 weeks. The ownership explanations finally make sense.",
        gradient: "from-amber-500/20 to-orange-500/20",
        avatar: "/assets/avatars/avatar-marcus.svg",
    },
    {
        name: "Tariq Al-Fayed",
        role: "Indie Developer",
        company: "Stealth",
        text: "The gamified approach kept me hooked. I deployed my first mainnet dApp before finishing module 3.",
        gradient: "from-emerald-500/20 to-teal-500/20",
        avatar: "/assets/avatars/avatar-tariq.svg",
    },
    {
        name: "Priya Mehta",
        role: "Protocol Engineer",
        company: "Navi Protocol",
        text: "Move's resource model clicked for me here. The visual debugger alone is worth the entire experience.",
        gradient: "from-rose-500/20 to-red-500/20",
        avatar: "/assets/avatars/avatar-priya.svg",
    },
    {
        name: "Daniel Park",
        role: "Fullstack Developer",
        company: "BlueMove",
        text: "I went from zero blockchain experience to shipping an NFT marketplace. The project-based learning is unmatched.",
        gradient: "from-indigo-500/20 to-violet-500/20",
        avatar: "/assets/avatars/avatar-daniel.svg",
    },
];

const ROW_1 = testimonials.slice(0, 3);
const ROW_2 = testimonials.slice(3, 6);

function TestimonialCard({
    t,
    index,
}: {
    t: (typeof testimonials)[0];
    index: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
        stiffness: 300,
        damping: 30,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
        stiffness: 300,
        damping: 30,
    });

    function handleMouse(e: React.MouseEvent) {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 800,
            }}
            className="group flex-shrink-0 w-[340px] md:w-[400px] select-none"
        >
            <div
                className={`relative h-full rounded-2xl p-[1px] bg-gradient-to-br ${t.gradient} transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/5`}
            >
                {/* Inner card */}
                <div className="relative h-full bg-surface-secondary rounded-2xl p-7 md:p-8 overflow-hidden">
                    {/* Hover glow */}
                    <div
                        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none`}
                    />

                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className="w-4 h-4 text-amber-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="relative z-10 text-foreground text-[15px] md:text-base leading-relaxed mb-7 font-normal">
                        &ldquo;{t.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="relative z-10 flex items-center gap-3 pt-5 border-t border-[var(--border-subtle)]">
                        <div
                            className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} overflow-hidden ring-2 ring-surface-secondary flex-shrink-0`}
                        >
                            <Image
                                src={t.avatar}
                                alt={t.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">
                                {t.name}
                            </div>
                            <div className="text-xs text-foreground-secondary">
                                {t.role} @ {t.company}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function InfiniteMarquee({
    items,
    direction = "left",
    speed = 35,
}: {
    items: typeof testimonials;
    direction?: "left" | "right";
    speed?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            const firstSet = containerRef.current.children[0] as HTMLElement;
            if (firstSet) {
                setContentWidth(firstSet.scrollWidth);
            }
        }
    }, []);

    return (
        <div className="relative overflow-hidden">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

            <motion.div
                ref={containerRef}
                className="flex gap-6"
                animate={
                    contentWidth > 0
                        ? {
                              x:
                                  direction === "left"
                                      ? [0, -contentWidth - 24]
                                      : [-contentWidth - 24, 0],
                          }
                        : undefined
                }
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
            >
                {/* Three copies for seamless loop */}
                <div className="flex gap-6 flex-shrink-0">
                    {items.map((t, i) => (
                        <TestimonialCard key={`a-${i}`} t={t} index={i} />
                    ))}
                </div>
                <div className="flex gap-6 flex-shrink-0">
                    {items.map((t, i) => (
                        <TestimonialCard key={`b-${i}`} t={t} index={i} />
                    ))}
                </div>
                <div className="flex gap-6 flex-shrink-0">
                    {items.map((t, i) => (
                        <TestimonialCard key={`c-${i}`} t={t} index={i} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default function TestimonialsSection() {
    return (
        <section className="py-24 md:py-32 bg-surface relative overflow-hidden border-t border-[var(--border-subtle)]">
            {/* Partner Logos Marquee */}
            <PartnerLogos />

            <div className="max-w-7xl mx-auto px-6 mt-20 md:mt-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-[var(--border-default)] rounded-full bg-surface-secondary">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono font-semibold text-foreground-secondary uppercase tracking-wider">
                            Wall of Love
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight">
                        Trusted by the{" "}
                        <span className="text-foreground-tertiary">
                            Next Generation.
                        </span>
                    </h2>
                    <p className="text-lg text-foreground-secondary max-w-xl mx-auto">
                        Builders, auditors, and degens who leveled up their
                        on-chain skills.
                    </p>
                </motion.div>
            </div>

            {/* Marquee rows */}
            <div className="mt-12 md:mt-16 space-y-6">
                <InfiniteMarquee items={ROW_1} direction="left" speed={40} />
                <InfiniteMarquee items={ROW_2} direction="right" speed={45} />
            </div>

            {/* Stats bar */}
            <div className="max-w-5xl mx-auto px-6 mt-16 md:mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 px-6 md:px-10 rounded-2xl bg-surface-secondary border border-[var(--border-subtle)]"
                >
                    {[
                        { value: "2,400+", label: "Students enrolled" },
                        { value: "98%", label: "Completion rate" },
                        { value: "180+", label: "dApps deployed" },
                        { value: "4.9/5", label: "Avg. rating" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-xs md:text-sm text-foreground-secondary mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
