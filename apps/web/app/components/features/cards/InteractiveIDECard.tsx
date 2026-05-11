"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/app/components/ui/Card";

export default function InteractiveIDECard() {
    const [typedText, setTypedText] = useState("");
    const [isCompiling, setIsCompiling] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const fullCode = `module hello::hello {
    public entry fun main(a: u32, b: u32): u32 {
        let c: u32 = a + b;
        c
    }
}`;

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullCode.length) {
                setTypedText(fullCode.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
                // Auto compile after typing
                setTimeout(() => startCompilation(), 500);
            }
        }, 50); // Typing speed

        return () => clearInterval(interval);
    }, []);

    const startCompilation = () => {
        setIsCompiling(true);
        setTimeout(() => {
            setIsCompiling(false);
            setIsSuccess(true);
            // Reset after a while for loop effect? Optional.
            setTimeout(() => {
                setIsSuccess(false);
                setTypedText("");
                // Re-trigger typing? For now let's keep it simple final state.
            }, 5000);
        }, 1500);
    };

    return (
        <Card variant="clean" className="h-full flex flex-col overflow-hidden relative group border-gray-200 bg-white">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sui-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Header */}
            <div className="p-4 md:p-6 pb-2 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-sui-accent/10 rounded-xl flex items-center justify-center text-sui-accent-dark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Live Coding Environment</h3>
                <p className="text-gray-500 text-sm">Write, compile, and deploy Move smart contracts directly in your browser.</p>
            </div>

            {/* Editor Surface */}
            <div className="flex-1 m-4 md:m-6 mt-2 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative font-mono text-xs p-4 shadow-inner">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100/50 border-b border-gray-200/50 flex items-center px-3 gap-2">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">main.move</span>
                </div>

                <div className="mt-8 relative z-10">
                    <pre className="text-gray-800 whitespace-pre-wrap">
                        {typedText}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2 H-4 bg-sui-accent align-middle ml-1"
                        />
                    </pre>
                </div>

                {/* Compilation Overlay */}
                <AnimatePresence>
                    {isCompiling && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-sui-accent border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-sui-accent-dark font-bold">Compiling...</span>
                            </div>
                        </motion.div>
                    )}
                    {isSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-20"
                        >
                            <div className="bg-white px-6 py-3 rounded-full shadow-xl border border-sui-accent/20 flex items-center gap-2">
                                <div className="w-5 h-5 bg-sui-accent rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                                <span className="text-sui-accent-dark font-bold">Build Successful</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </Card>
    );
}
