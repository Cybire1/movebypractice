"use client";

import { motion } from "framer-motion";

const COMPANIES = [
    "Mysten Labs",
    "Sui Foundation",
    "BlueMove",
    "Cetus Protocol",
    "Ethos Wallet",
    "Typus Finance",
    "Scallop",
    "Navi Protocol"
];

const TESTIMONIALS = [
    {
        quote: "Shipping on Sui felt daunting until I found Glide. The interactive examples are a literal cheat code.",
        author: "Julian Soler",
        role: "Frontend Lead",
        company: "SuiVision"
    },
    {
        quote: "I've audited smart contracts for years. This platform teaches the security patterns that actually matter.",
        author: "Elena Zhang",
        role: "Security Researcher",
        company: "OtterSec"
    },
    {
        quote: "From Solidity veteran to Move expert in 2 weeks. The ownership explanations finally make sense.",
        author: "Marcus Kane",
        role: "DeFi Architect",
        company: "Scallop"
    },
    {
        quote: "The gamified approach kept me hooked. I deployed my first mainnet dApp before finishing module 3.",
        author: "Tariq Al-Fayed",
        role: "Indie Developer",
        company: "Stealth"
    }
];

export default function Testimonials() {
    return (
        <section className="py-32 bg-white relative overflow-hidden border-t border-gray-100">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-graph opacity-40 pointer-events-none" />

            {/* Marquee Section */}
            <div className="mb-32 overflow-hidden border-y border-gray-100 bg-gray-50/50 py-12">
                <div className="flex">
                    <motion.div
                        className="flex gap-16 md:gap-32 px-16 whitespace-nowrap text-2xl md:text-3xl font-bold text-gray-300 tracking-tighter-swiss uppercase select-none"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                    >
                        {[...COMPANIES, ...COMPANIES, ...COMPANIES].map((company, i) => (
                            <span key={i} className="flex items-center gap-4">
                                {/* Optional: Add minimal icon here */}
                                {company}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-black tracking-tighter-swiss mb-6">
                        Trusted by the <br />
                        <span className="text-gray-400">Next Generation.</span>
                    </h2>
                </div>

                {/* Testimonials Slider */}
                <div className="relative overflow-hidden -mx-6 px-6 md:px-0 md:mx-0">
                    <motion.div
                        className="flex gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ right: 0, left: -1000 }} // Adjustable based on content width
                        whileTap={{ scale: 0.98 }}
                    >
                        {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <motion.div
                                key={i}
                                className="relative min-w-[85vw] md:min-w-[400px] bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between select-none"
                            >
                                <div>
                                    {/* Quote Mark */}
                                    <div className="text-6xl text-blue-600 mb-6 font-serif opacity-30">&quot;</div>

                                    <h3 className="text-xl md:text-2xl font-medium text-black leading-tight mb-8 tracking-tight">
                                        {t.quote}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg font-bold text-gray-400 border border-gray-100">
                                        {t.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-black">{t.author}</div>
                                        <div className="text-sm text-gray-500">{t.role} @ {t.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Visual Hint for Scroll */}
                    <div className="flex justify-center mt-8 gap-2 md:hidden">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                    </div>
                </div>

                {/* Final Large CTA - Swiss Dark Mode */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 md:mt-32 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#050505] border border-white/10 shadow-2xl"
                >
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-noise-overlay opacity-[0.07] pointer-events-none mix-blend-overlay" />



                    <div className="relative z-10 p-8 md:p-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 md:mb-6 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">Accepting New Students</span>
                            </div>

                            <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tighter-swiss leading-[0.9] mb-4 md:mb-8">
                                Ready to <br />
                                <span className="text-gray-500">break stuff?</span>
                            </h2>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-center">
                            <p className="text-gray-400 text-lg md:text-2xl mb-8 md:mb-10 max-w-md text-left md:text-right leading-relaxed">
                                Join the cohort defining the future of on-chain finance on Sui.
                            </p>

                            <motion.button
                                initial="initial"
                                whileHover="hover"
                                whileTap={{ scale: 0.98 }}
                                className="group relative bg-white text-black px-8 py-4 md:px-10 md:py-5 rounded-full text-lg md:text-xl font-bold overflow-hidden shadow-lg transition-all hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
                            >
                                <motion.div
                                    variants={{
                                        initial: { y: 0 },
                                        hover: { y: "-100%" }
                                    }}
                                    transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }} // Cubic bezier for snap
                                    className="flex items-center gap-2 relative z-10"
                                >
                                    <span>Start Building</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </motion.div>

                                <motion.div
                                    variants={{
                                        initial: { y: "100%" },
                                        hover: { y: 0 }
                                    }}
                                    transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                                    className="absolute inset-0 flex items-center justify-center gap-2 bg-black text-white z-10"
                                >
                                    <span>Let's Build</span>
                                    <svg className="w-5 h-5 rotate-[-45deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
