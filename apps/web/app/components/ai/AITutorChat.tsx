'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultimodalLive } from '@/app/hooks/useMultimodalLive';
import { capturePageContext, formatContextForAI } from '@/app/lib/ai/pageContext';

interface AITutorChatProps {
    context: {
        lessonTitle: string;
        phase: string;
        code: string;
        slideContent?: string;
    };
}

export default function AITutorChat({ context }: AITutorChatProps) {
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [pageContext, setPageContext] = useState<string>('');

    const { connect, disconnect, isConnected, isSpeaking, volume } = useMultimodalLive({
        context: pageContext,
    });

    const handleToggleVoice = () => {
        if (isVoiceActive) {
            disconnect();
            setIsVoiceActive(false);
        } else {
            // Capture LIVE page context when button is clicked (like X Grok)
            console.log('[AI] Capturing live page context...');

            try {
                const pageCtx = capturePageContext();
                const formattedContext = formatContextForAI(pageCtx);
                setPageContext(formattedContext);

                console.log('[AI] Page context captured:', {
                    url: pageCtx.currentUrl,
                    codeBlocks: pageCtx.codeBlocks.length,
                    textLength: pageCtx.visibleText.length,
                    metadata: pageCtx.metadata
                });
            } catch (error) {
                console.error('[AI] Error capturing page context:', error);
                // Use fallback minimal context
                setPageContext('You are an expert Move programming tutor helping a student.');
            }

            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                alert('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env');
                return;
            }

            // Connect with fresh context
            setTimeout(() => {
                connect(apiKey);
                setIsVoiceActive(true);
            }, 100);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isVoiceActive) {
                disconnect();
                setIsVoiceActive(false);
            }
        };
    }, []);

    return (
        <>
            {/* Voice Button - Bottom Right */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleVoice}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-2xl rounded-full font-bold transition-all ${
                    isVoiceActive
                        ? 'bg-red-50 text-red-600 border-2 border-red-300'
                        : 'bg-white text-sui-navy border-2 border-sui-ocean/20 hover:bg-sui-gray-50'
                }`}
            >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm ${
                    isVoiceActive
                        ? 'bg-gradient-to-tr from-red-500 to-red-600'
                        : 'bg-gradient-to-tr from-blue-500 to-purple-500'
                }`}>
                    {isVoiceActive ? (
                        isSpeaking ? '🗣️' : (
                            <motion.svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </motion.svg>
                        )
                    ) : (
                        <span>AI</span>
                    )}
                </div>
                <span className="text-sm">
                    {isVoiceActive ? (isSpeaking ? 'Speaking...' : 'Listening...') : 'AI Tutor'}
                </span>
            </motion.button>

            {/* Floating Indicator - When Active */}
            <AnimatePresence>
                {isVoiceActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="fixed bottom-24 right-6 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-zinc-900/5 p-4 max-w-xs"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: isSpeaking ? [1, 1.15, 1] : 1 + Math.max(0, volume) * 2 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -inset-2 bg-indigo-400/20 rounded-full blur-md"
                                />
                                <div className="relative w-12 h-12 bg-white rounded-full border-2 border-indigo-100 shadow-lg flex items-center justify-center">
                                    <span className="text-xl">
                                        {isSpeaking ? '🗣️' : '👂'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-zinc-900">
                                    {isSpeaking ? 'AI is speaking' : 'Listening...'}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {isSpeaking ? 'Please wait' : 'Ask your question'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-zinc-400">
                            💡 I can see your code and help debug
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
