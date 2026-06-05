"use client";

import { motion } from "framer-motion";

const partners = [
    "Mysten Labs",
    "Sui Foundation",
    "BlueMove",
    "Cetus",
    "Ethos",
    "Typus",
    "Scallop",
    "Navi",
];

export default function PartnerLogos() {
    return (
        <div className="border-y border-[var(--border-subtle)] bg-surface-secondary/50 py-10 sm:py-12 overflow-hidden">
            <div className="text-center mb-6 sm:mb-8 px-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-foreground-tertiary">
                    Protocols on Sui
                </span>
            </div>

            <div className="relative">
                {/* Left fade */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

                <div className="overflow-hidden">
                    <motion.div
                        className="flex w-max items-center gap-12 md:gap-16"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 25,
                                ease: "linear",
                            },
                        }}
                    >
                        {[...partners, ...partners].map((name, i) => (
                            <span
                                key={i}
                                className="text-2xl md:text-3xl font-bold text-foreground-tertiary/50 tracking-tight uppercase whitespace-nowrap select-none"
                            >
                                {name}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
