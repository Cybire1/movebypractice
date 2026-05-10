"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const codeSnippet = `module token::token {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// The type identifier of our token
    struct TOKEN has drop {}

    /// Initialize the token module
    fun init(witness: TOKEN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 9,
            b"TOKEN", b"Token",
            b"A custom token on Sui",
            option::none(), ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    /// Mint new tokens
    public entry fun mint(
        treasury: &mut TreasuryCap<TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Transfer tokens to a recipient
    public entry fun transfer_token(
        token: Coin<TOKEN>,
        recipient: address,
    ) {
        transfer::public_transfer(token, recipient);
    }

    /// Burn tokens
    public entry fun burn(
        treasury: &mut TreasuryCap<TOKEN>,
        token: Coin<TOKEN>,
    ) {
        coin::burn(treasury, token);
    }
}`;

export default function InteractiveCodeVisualizer() {
    const [displayedCode, setDisplayedCode] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let currentIndex = 0;
        const typingSpeed = 30; // ms per char

        const typeChar = () => {
            if (currentIndex < codeSnippet.length) {
                // Use functional state securely to append the correct character
                const char = codeSnippet[currentIndex];
                setDisplayedCode((prev) => prev + char);
                currentIndex++;

                // Auto-scroll
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }

                // Variable speed for realism
                const randomSpeed = typingSpeed + Math.random() * 20;
                setTimeout(typeChar, randomSpeed);
            } else {
                setIsTyping(false);
                setTimeout(() => setShowSuccess(true), 500);
            }
        };


        // Start delay
        const startTimeout = setTimeout(typeChar, 1000);

        return () => clearTimeout(startTimeout);
    }, []);

    return (
        <div className="relative group perspective-1000">
            {/* Main Container - Physical Touch */}
            <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative bg-white rounded-xl border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                {/* Window Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                    </div>
                    <div className="text-[10px] font-mono font-medium text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sui-accent/20"></span>
                        token.move
                    </div>
                    <div className="w-12"></div> {/* Spacer for center alignment */}
                </div>

                {/* Code Area */}
                <div ref={scrollRef} className="p-6 h-[400px] overflow-y-auto font-mono text-sm leading-relaxed no-scrollbar scroll-smooth bg-white text-gray-800">
                    <pre className="whitespace-pre-wrap">
                        <code className="language-move">
                            {displayedCode.split(/(\s+)/).map((chunk, i) => {
                                // Light Mode Move Syntax Highlighting
                                let color = "text-gray-800";

                                // Keywords (red/pink)
                                if (["module", "struct", "fun", "public", "entry", "use", "let", "return", "if", "else", "for", "const", "has", "drop", "store", "key", "copy", "transfer", "mut"].includes(chunk.trim())) {
                                    color = "text-red-500 font-bold";
                                }

                                // Types (blue)
                                if (["u8", "u16", "u32", "u64", "u128", "u256", "address", "bool", "vector", "option", "Coin", "TreasuryCap", "TxContext", "TOKEN"].includes(chunk.trim())) {
                                    color = "text-blue-600 font-bold";
                                }

                                // Built-in functions (blue)
                                if (["coin::mint", "coin::burn", "coin::create_currency", "transfer::public_transfer", "transfer::public_freeze_object", "tx_context::sender"].includes(chunk.trim())) {
                                    color = "text-blue-600 font-bold";
                                }

                                // Special keywords (purple)
                                if (["treasury", "recipient", "amount", "witness", "coin", "metadata", "token", "ctx"].includes(chunk.trim())) {
                                    color = "text-purple-600";
                                }

                                // Numbers (green)
                                if (/^\d+u(8|16|32|64|128)$/.test(chunk.trim()) || /^\d+$/.test(chunk.trim())) {
                                    color = "text-green-600";
                                }

                                // Module name (orange)
                                if (chunk.trim().includes("::") && !chunk.trim().startsWith("//")) {
                                    color = "text-orange-600 font-semibold";
                                }

                                return <span key={i} className={color}>{chunk}</span>;
                            })}
                            {isTyping && (
                                <span className="inline-block w-2.5 h-5 ml-1 bg-black animate-pulse align-middle" />
                            )}
                        </code>
                    </pre>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center justify-between text-xs font-mono text-gray-400">
                    <div className="flex gap-4">
                        <span>Ln 49, Col 1</span>
                        <span>UTF-8</span>
                    </div>
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-semibold">Compiled & Deployed</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
