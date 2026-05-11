"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';

interface StickyTerminalProps {
    step: 1 | 2 | 3;
}

export default function StickyTerminal({ step }: StickyTerminalProps) {
    return (
        <Card variant="solid" className="w-full h-[500px] border-white/10 relative overflow-hidden flex flex-col font-mono text-sm shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="ml-4 text-xs text-gray-500 flex-1 text-center font-sans tracking-wide uppercase opacity-70">
                    Sui Builder v2.0
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 relative bg-sui-dark/50 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                    {step === 1 && <LessonSelectState key="step1" />}
                    {step === 2 && <CodeEditorState key="step2" />}
                    {step === 3 && <DeploymentState key="step3" />}
                </AnimatePresence>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sui-accent/5 opacity-20 pointer-events-none" style={{ backgroundSize: '100% 4px' }} />
        </Card>
    );
}

function LessonSelectState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            <div className="text-gray-500 mb-4">// Select a module to begin</div>
            {['basics.move', 'token.move', 'nft_mint.move', 'defi_pool.move'].map((file, i) => (
                <div key={file} className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-white/5 hover:border-sui-accent/30 group cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                        <span className="text-sui-accent opacity-50 group-hover:opacity-100">./</span>
                        <span className="text-gray-300 group-hover:text-white">{file}</span>
                    </div>
                    {i === 2 && (
                        <div className="px-2 py-0.5 text-[10px] bg-sui-accent text-black font-bold rounded">
                            SELECTED
                        </div>
                    )}
                </div>
            ))}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-600">
                <span>4 modules found</span>
                <span>-- INSERT --</span>
            </div>
        </motion.div>
    );
}

function CodeEditorState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
        >
            <div>
                <span className="text-sui-accent">module</span> <span className="text-white">nft_mint</span> {'{'}
            </div>
            <div className="pl-4">
                <span className="text-sui-accent">struct</span> <span className="text-white">TokenId</span> {'{'}
            </div>
            <div className="pl-8 text-gray-400">
                bits: u128,
            </div>
            <div className="pl-4">{'}'}</div>
            <br />
            <div className="pl-4">
                <span className="text-sui-accent">public entry fun</span> <span className="text-white">mint</span>(
                <span className="text-orange-300">owner</span>: <span className="text-sui-accent-light">address</span>,
                <span className="text-orange-300">amount</span>: <span className="text-sui-accent-light">u64</span>
                ) {'{'}
            </div>
            <div className="pl-8 text-gray-400">// Constructing record...</div>
            <div className="pl-8">
                <span className="text-sui-accent">return</span> <span className="text-white">Token</span> {'{'}
            </div>
            <div className="pl-12">
                owner: owner,
            </div>
            <div className="pl-12 flex items-center gap-1">
                amount: amount, <span className="w-2 h-4 bg-sui-accent animate-pulse" />
            </div>
            <div className="pl-8">{'}'};</div>
            <div className="pl-4">{'}'}</div>
            <div>{'}'}</div>
        </motion.div>
    );
}

function DeploymentState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
        >
            <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sui-accent">➜</span>
                <span>sui client publish --gas-budget 100000000</span>
            </div>

            <div className="h-px w-full bg-white/10 my-4" />

            <div className="space-y-2">
                <LogLine text="Compiling Move modules..." delay={0.2} />
                <LogLine text="Building package dependencies..." delay={1.2} />
                <LogLine text="Verifying bytecode..." delay={2.0} />
                <LogLine text="Publishing to Sui Network..." delay={2.8} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5 }}
                className="mt-6 p-4 rounded-lg bg-sui-accent/10 border border-sui-accent/30 flex items-center gap-3"
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sui-accent text-black">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <div className="text-sui-accent font-bold">Deployment Successful</div>
                    <div className="text-xs text-sui-accent/70">Transaction ID: at1z...9x4q</div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LogLine({ text, delay }: { text: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex items-center gap-2 text-white"
        >
            <span className="text-gray-600">[INFO]</span>
            {text}
        </motion.div>
    );
}
