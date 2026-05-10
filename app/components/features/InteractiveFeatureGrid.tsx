"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "Instant Compilation",
        description: "Write and compile Move code directly in your browser. No local setup required — just open and start building.",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
        ),
        stats: [
            { value: "0s", label: "Setup" },
            { value: "100%", label: "Web" },
        ],
        dark: true,
        colSpan: "lg:col-span-2",
        rowSpan: "lg:row-span-2",
    },
    {
        title: "Gamified Learning",
        description: "Earn XP, unlock achievements, and track your progress through interactive challenges.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-2.77.682 6.016 6.016 0 01-2.77-.682" />
            </svg>
        ),
        badge: "+50 XP",
        dark: false,
        colSpan: "lg:col-span-2",
        rowSpan: "",
    },
    {
        title: "Deploy to Sui",
        description: "One-click deploy to Sui Testnet. See your contracts live on the blockchain in minutes.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        ),
        badge: "Deploy in 5 minutes",
        dark: false,
        colSpan: "",
        rowSpan: "lg:row-span-2",
    },
    {
        title: "VS Code Editor",
        description: "Full-featured code editor with syntax highlighting, auto-complete, and Move language support.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        ),
        dark: false,
        colSpan: "",
        rowSpan: "",
        bordered: true,
    },
    {
        title: "Hands-On Projects",
        description: "Build real dApps — from token contracts to DeFi protocols. Learn by doing, not watching.",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        dark: true,
        colSpan: "lg:col-span-2",
        rowSpan: "",
    },
    {
        title: "NFT Certificates",
        description: "Mint proof-of-knowledge NFTs on Sui for each completed module. Build your on-chain portfolio.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        dark: false,
        colSpan: "",
        rowSpan: "",
        bordered: true,
    },
];

export default function InteractiveFeatureGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
            {features.map((feature, index) => (
                <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className={`${feature.colSpan || ''} ${feature.rowSpan || ''}`}
                >
                    <div
                        className={`h-full rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                            feature.dark
                                ? 'bg-black text-white hover:bg-zinc-900'
                                : feature.bordered
                                ? 'bg-surface-elevated text-foreground border-2 border-foreground hover:border-foreground'
                                : 'bg-surface-elevated text-foreground border border-[var(--border-default)] hover:border-foreground-tertiary hover:shadow-lg'
                        }`}
                    >
                        <div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                                feature.dark ? 'bg-white/10' : 'bg-surface-secondary'
                            }`}>
                                <div className={feature.dark ? 'text-white' : 'text-foreground'}>
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className={`text-xl font-bold mb-3 ${feature.dark ? 'text-white' : 'text-foreground'}`}>
                                {feature.title}
                            </h3>
                            <p className={`text-sm leading-relaxed ${feature.dark ? 'text-gray-400' : 'text-foreground-secondary'}`}>
                                {feature.description}
                            </p>
                        </div>

                        {feature.stats && (
                            <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
                                {feature.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-3xl font-black">{stat.value}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {feature.badge && (
                            <div className="mt-6">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    feature.dark ? 'bg-white/10 text-white' : 'bg-surface-secondary text-foreground-secondary'
                                }`}>
                                    {feature.badge}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
