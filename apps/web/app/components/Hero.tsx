"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

const heroCode = `module move_by_practice::hero_contract {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Hero NFT with trainable stats
    struct Hero has key, store {
        id: UID,
        power: u64,
        xp: u64,
    }

    public entry fun create_hero(ctx: &mut TxContext) {
        let hero = Hero {
            id: object::new(ctx),
            power: 10,
            xp: 0,
        };
        transfer::transfer(hero, tx_context::sender(ctx));
    }
}`;

const renderCodeWithSyntax = (text: string) => {
    const trimmed = text.trimStart();
    const indent = text.length - trimmed.length;
    const spaces = '\u00A0'.repeat(indent);

    // Comments
    if (trimmed.startsWith('//')) {
        return <span className="text-foreground-tertiary italic">{spaces}{trimmed}</span>;
    }

    // module keyword
    if (trimmed.startsWith('module')) {
        const rest = trimmed.replace('module', '');
        return (
            <>
                {spaces}
                <span className="text-red-500 dark:text-red-400 font-semibold">module</span>
                <span className="text-foreground">{rest}</span>
            </>
        );
    }

    // use keyword
    if (trimmed.startsWith('use')) {
        const rest = trimmed.replace('use', '');
        return (
            <>
                {spaces}
                <span className="text-red-500 dark:text-red-400 font-semibold">use</span>
                <span className="text-foreground">{rest}</span>
            </>
        );
    }

    // struct keyword
    if (trimmed.startsWith('struct')) {
        const parts = trimmed.match(/^(struct)\s+(\w+)\s+(has)\s+(.+)$/);
        if (parts) {
            return (
                <>
                    {spaces}
                    <span className="text-red-500 dark:text-red-400 font-semibold">struct</span>
                    {' '}<span className="text-amber-700 dark:text-amber-400 font-bold">{parts[2]}</span>
                    {' '}<span className="text-red-500 dark:text-red-400 font-semibold">has</span>
                    {' '}<span className="text-foreground-secondary">{parts[4]}</span>
                </>
            );
        }
    }

    // public entry fun
    if (trimmed.startsWith('public entry fun')) {
        const rest = trimmed.replace('public entry fun', '');
        return (
            <>
                {spaces}
                <span className="text-red-500 dark:text-red-400 font-semibold">public entry fun</span>
                <span className="text-foreground">{rest}</span>
            </>
        );
    }

    // let keyword
    if (trimmed.startsWith('let')) {
        const rest = trimmed.replace('let', '');
        return (
            <>
                {spaces}
                <span className="text-red-500 dark:text-red-400 font-semibold">let</span>
                <span className="text-foreground">{rest}</span>
            </>
        );
    }

    return <span className="text-foreground">{spaces}{trimmed}</span>;
};

export default function Hero() {
    const [displayedCode, setDisplayedCode] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    // Typing effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < heroCode.length) {
                index++;
                setDisplayedCode(heroCode.slice(0, index));
            } else {
                clearInterval(interval);
            }
        }, 25);
        return () => clearInterval(interval);
    }, []);

    // Cursor blink
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const lines = displayedCode.split('\n');

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-surface text-foreground pt-24 md:pt-28">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.3,
                }}
            />

            <div className="container max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left space-y-8 lg:pl-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="mb-8">
                            <span className="block text-6xl sm:text-7xl md:text-[7rem] font-sans font-black tracking-tighter leading-[0.85]">
                                MASTER{' '}
                                <br className="hidden sm:block" />
                                MOVE.
                            </span>
                            <span className="block mt-4 text-xl sm:text-2xl md:text-3xl font-mono font-medium tracking-[0.2em] uppercase text-foreground-secondary">
                                Build the future.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-foreground-secondary max-w-lg leading-relaxed">
                            The interactive platform to master Sui Move. Write code, deploy contracts, and earn on-chain credentials.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link href="/lessons">
                            <span className="inline-flex items-center gap-3 bg-[#182435] text-white font-bold tracking-tight rounded-full px-10 py-5 text-lg transition-all hover:scale-105 hover:bg-black">
                                Start learning <span className="ml-1">&rarr;</span>
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Content - Animated Code Editor */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative hidden lg:block"
                >
                    <div className="relative bg-surface-secondary rounded-2xl shadow-xl overflow-hidden border border-[var(--border-default)]">
                        {/* Window Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-surface-tertiary border-b border-[var(--border-default)]">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                                </div>
                            </div>
                            <span className="text-xs text-foreground-tertiary font-mono flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-foreground-tertiary" />
                                hero_contract.move
                            </span>
                        </div>

                        {/* Code Content with Typing Effect */}
                        <div className="p-6 font-mono text-sm leading-relaxed h-[380px] overflow-hidden">
                            {lines.map((line, index) => (
                                <div key={index} className="min-h-[1.5rem]">
                                    <code className="whitespace-pre">
                                        {renderCodeWithSyntax(line)}
                                        {index === lines.length - 1 && showCursor && (
                                            <span className="inline-block w-2 h-4 bg-foreground ml-0.5 align-middle" />
                                        )}
                                    </code>
                                </div>
                            ))}
                        </div>

                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-5 py-2 bg-surface-tertiary border-t border-[var(--border-default)] text-xs text-foreground-tertiary font-mono">
                            <span>Ln 49, Col 1</span>
                            <span>UTF-8</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
