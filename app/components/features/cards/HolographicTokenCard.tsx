"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card } from "@/app/components/ui/Card";

export default function HolographicTokenCard() {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [20, -20]); // Reversed for natural tilt
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
    const shineX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
    const shineY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

    return (
        <div style={{ perspective: 1000 }} className="h-full">
            <motion.div
                ref={ref}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full relative transition-shadow duration-300"
            >
                <Card variant="clean" className="h-full relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-gray-200">
                    {/* Holographic Sheen */}
                    <motion.div
                        style={{
                            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(0, 255, 153, 0.15), transparent 60%)`,
                        }}
                        className="absolute inset-0 z-10 pointer-events-none"
                    />

                    {/* Content Layer (Popped out) */}
                    <div style={{ transform: "translateZ(50px)" }} className="absolute inset-0 flex flex-col p-6 z-20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-sui-accent/10 rounded-xl flex items-center justify-center text-sui-accent-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-black mb-2">Verifiable Credentials</h3>
                        <p className="text-gray-500 text-sm mb-8">Mint on-chain achievements that prove your knowledge without revealing personal data.</p>

                        {/* 3D Floating Token */}
                        <div className="flex-1 flex items-center justify-center relative">
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-32 h-40 bg-gradient-to-br from-black to-gray-800 rounded-xl shadow-2xl flex flex-col items-center justify-center border border-gray-700 relative"
                            >
                                {/* Token Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl" />

                                <div className="w-12 h-12 bg-sui-accent rounded-full flex items-center justify-center mb-2 shadow-lg shadow-sui-accent/20">
                                    <span className="text-black font-bold text-xl">A</span>
                                </div>
                                <div className="h-2 w-16 bg-gray-700 rounded-full mb-1" />
                                <div className="h-2 w-10 bg-gray-700 rounded-full" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                </Card>
            </motion.div>
        </div>
    );
}
