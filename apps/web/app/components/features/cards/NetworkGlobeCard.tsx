"use client";

import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/Card";

export default function NetworkGlobeCard() {
    return (
        <Card variant="clean" className="h-full flex flex-col overflow-hidden relative border-gray-200 bg-black text-white">
            {/* Background Grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Content */}
            <div className="p-6 relative z-20">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Global Network</h3>
                <p className="text-gray-400 text-sm max-w-xs">Deploy to a decentralized network of provers and validators.</p>
            </div>

            {/* CSS 3D Globe Representation */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-80">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full border border-white/20 relative"
                    style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                    {/* Simple Latitude/Longitude Lines */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute inset-0 rounded-full border border-sui-accent/30"
                            style={{ transform: `rotateY(${i * 30}deg)` }} />
                    ))}
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="absolute inset-0 rounded-full border border-sui-accent/20"
                            style={{ transform: `rotateX(${45 + (i * 20)}deg)` }} />
                    ))}

                    {/* Glowing Nodes */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-3 h-3 bg-sui-accent rounded-full shadow-[0_0_10px_#00FF99]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, delay: 1, repeat: Infinity }}
                        className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                    />
                </motion.div>
            </div>

            {/* Overlay Gradient for "Horizon" effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </Card>
    );
}
