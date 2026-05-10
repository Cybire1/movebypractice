'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultimodalLive } from '@/app/hooks/useMultimodalLive';
import { TeachingSlide } from '@/app/types/lesson';

interface SlideAIAssistantProps {
  slide: TeachingSlide;
  lessonTitle: string;
  slideIndex: number;
  totalSlides: number;
}

export default function SlideAIAssistant({
  slide,
  lessonTitle,
  slideIndex,
  totalSlides
}: SlideAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // For portal - only render after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Build context for this specific slide
  const buildSlideContext = () => {
    let context = `You are Lydia, an expert and friendly Move programming tutor.\n\n`;
    context += `Lesson: "${lessonTitle}"\n`;
    context += `Slide: ${slideIndex + 1}/${totalSlides} - "${slide.title}"\n`;
    context += `Content: ${slide.content}\n\n`;

    if (slide.interactiveElement) {
      context += `Interactive: ${slide.interactiveElement.type}\n`;
      if (slide.interactiveElement.config?.code) {
        context += `Code:\n\`\`\`move\n${slide.interactiveElement.config.code}\n\`\`\`\n`;
      }
      if (slide.interactiveElement.config?.explanation) {
        context += `Explanation: ${slide.interactiveElement.config.explanation}\n`;
      }
    }

    context += `\nGuidelines:\n`;
    context += `1. Be concise, encouraging, and clear.\n`;
    context += `2. Focus on the current slide's concept.\n`;
    context += `3. Use the Socratic method when appropriate.\n`;

    return context;
  };

  const { connect, disconnect, isConnected, isSpeaking, volume } = useMultimodalLive({
    context: buildSlideContext(),
  });

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      disconnect();
      setIsVoiceActive(false);
    } else {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        alert('API Key missing');
        return;
      }
      connect(apiKey);
      setIsVoiceActive(true);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (isVoiceActive) disconnect();
    };
  }, []);

  // Generate morphing border-radius based on volume for blob effect
  const blobRadius = useMemo(() => {
    const base = 50;
    const variance = Math.min(volume * 30, 15);
    const r1 = base + variance;
    const r2 = base - variance * 0.5;
    const r3 = base + variance * 0.7;
    const r4 = base - variance * 0.3;
    return `${r1}% ${r2}% ${r3}% ${r4}% / ${r2}% ${r3}% ${r4}% ${r1}%`;
  }, [volume]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING TRIGGER BUTTON - Black & Grey Design
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="fixed bottom-8 right-8 z-[100]"
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Outer Glow Effect */}
        <div className="absolute -inset-3 bg-gradient-to-r from-zinc-400/20 via-zinc-500/15 to-zinc-400/20 rounded-full blur-xl opacity-70 animate-pulse" />

        <motion.button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 pl-3 pr-5 py-2.5 bg-surface-elevated backdrop-blur-2xl border border-[var(--border-default)] rounded-full shadow-xl shadow-zinc-900/10 hover:shadow-zinc-900/20 hover:border-foreground-tertiary transition-all duration-500"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          animate={{ y: [0, -4, 0] }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.2 },
          }}
        >
          {/* Icon Container with Animated Orb */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Animated Gradient Orb - Black/Grey */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-900"
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Inner White Circle */}
            <div className="relative z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner">
              {/* Waveform Bars */}
              <div className="flex items-center gap-0.5 h-4">
                <motion.div
                  className="w-0.5 bg-zinc-800 rounded-full"
                  animate={{ height: ["40%", "100%", "60%", "80%", "40%"] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  className="w-0.5 bg-zinc-800 rounded-full"
                  animate={{ height: ["60%", "40%", "100%", "50%", "60%"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="w-0.5 bg-zinc-700 rounded-full"
                  animate={{ height: ["80%", "60%", "40%", "100%", "80%"] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <motion.div
                  className="w-0.5 bg-zinc-600 rounded-full"
                  animate={{ height: ["50%", "80%", "60%", "40%", "50%"] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
                <motion.div
                  className="w-0.5 bg-zinc-600 rounded-full"
                  animate={{ height: ["70%", "50%", "80%", "60%", "70%"] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
              AI Tutor
            </span>
            <span className="text-sm font-bold text-foreground leading-none">
              Ask Lydia
            </span>
          </div>

          {/* Hover Ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-zinc-900/0 group-hover:ring-zinc-900/20 transition-all duration-500" />
        </motion.button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL - Rendered via Portal to escape stacking context
      ═══════════════════════════════════════════════════════════════════ */}
      {isMounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={() => {
                if (isVoiceActive) disconnect(), setIsVoiceActive(false);
                setIsOpen(false);
              }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-surface/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl shadow-zinc-900/10 border border-[var(--border-default)] overflow-hidden"
              >
                {/* Decorative Gradient Blobs */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-zinc-300/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-zinc-400/15 rounded-full blur-[100px]" />

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (isVoiceActive) disconnect(), setIsVoiceActive(false);
                    setIsOpen(false);
                  }}
                  className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-surface-secondary text-foreground-tertiary hover:bg-[var(--border-default)] hover:text-foreground transition-all z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="relative z-10 p-10 pt-8">
                  {!isVoiceActive ? (
                    /* ─────────────────────────────────────────────────────────
                       INACTIVE STATE: Breathing Orb with "Start" CTA
                    ───────────────────────────────────────────────────────── */
                    <div className="flex flex-col items-center">
                      {/* The Breathing Orb */}
                      <div className="relative w-44 h-44 mb-8">
                        {/* Outer Glow Rings */}
                        <motion.div
                          className="absolute inset-0 rounded-full border border-zinc-300"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-2 rounded-full border border-zinc-200"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.05, 0.2] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        />

                        {/* Main Orb - Black/Grey gradient */}
                        <motion.div
                          className="absolute inset-6 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-900 shadow-lg shadow-zinc-900/30"
                          animate={{
                            scale: [1, 1.03, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                          }}
                        />

                        {/* Inner White Core */}
                        <motion.div
                          className="absolute inset-10 rounded-full bg-white flex items-center justify-center shadow-inner"
                          animate={{ scale: [1, 0.97, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {/* Microphone Icon */}
                          <svg className="w-10 h-10 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </motion.div>
                      </div>

                      {/* Text */}
                      <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                        Hey, I'm Lydia
                      </h3>
                      <p className="text-center text-foreground-secondary mb-8 text-sm leading-relaxed max-w-xs">
                        Your AI tutor for this slide. Ask me anything about <span className="text-foreground font-medium">{slide.title}</span>
                      </p>

                      {/* Start Button with Pulsing Ring */}
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-1 rounded-full bg-zinc-900/20"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.button
                          onClick={handleToggleVoice}
                          className="relative px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-lg shadow-xl shadow-zinc-900/30 flex items-center gap-3 hover:bg-zinc-800 transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span>Start Talking</span>
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* ─────────────────────────────────────────────────────────
                       ACTIVE STATE: Audio-Reactive Morphing Orb
                    ───────────────────────────────────────────────────────── */
                    <div className="flex flex-col items-center py-4">
                      {/* The Audio-Reactive Orb */}
                      <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
                        {/* Outer Glow - Intensifies when speaking */}
                        <motion.div
                          className="absolute inset-0 bg-zinc-500/30 blur-[60px]"
                          animate={{
                            scale: isSpeaking ? [1, 1.3, 1] : 1.1,
                            opacity: isSpeaking ? [0.4, 0.7, 0.4] : 0.2
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* Morphing Blob Orb */}
                        <motion.div
                          className="relative w-40 h-40 bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-900 shadow-2xl shadow-zinc-900/40"
                          animate={{
                            scale: 1 + volume * 0.15,
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            scale: { duration: 0.1 },
                            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                          }}
                          style={{ borderRadius: blobRadius }}
                        >
                          {/* Inner Core */}
                          <motion.div
                            className="absolute inset-4 bg-white flex items-center justify-center shadow-inner"
                            style={{ borderRadius: blobRadius }}
                          >
                            {/* Waveform Visualization */}
                            <div className="flex items-center gap-1 h-12">
                              {[...Array(7)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-gradient-to-t from-zinc-800 to-zinc-500 rounded-full"
                                  animate={{
                                    height: Math.max(8, (volume * 40) + Math.sin(Date.now() / 200 + i) * 8)
                                  }}
                                  transition={{ duration: 0.05 }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-zinc-600/50"
                            animate={{
                              x: Math.cos(i * 60 * Math.PI / 180) * (60 + volume * 20),
                              y: Math.sin(i * 60 * Math.PI / 180) * (60 + volume * 20),
                              opacity: [0.3, 0.8, 0.3],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                              duration: 2 + i * 0.2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            style={{
                              left: '50%',
                              top: '50%',
                              marginLeft: -4,
                              marginTop: -4
                            }}
                          />
                        ))}
                      </div>

                      {/* Status Text */}
                      <motion.p
                        className="text-foreground font-bold text-xl mb-1"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isSpeaking ? 'Lydia is speaking...' : 'Listening...'}
                      </motion.p>
                      <p className="text-foreground-tertiary text-sm mb-8">
                        {isSpeaking ? 'Wait for response to finish' : 'Ask your question now'}
                      </p>

                      {/* End Session Button */}
                      <motion.button
                        onClick={handleToggleVoice}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 text-red-500 rounded-full font-semibold text-sm hover:bg-red-100 transition-colors"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full bg-red-500"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        End Session
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
