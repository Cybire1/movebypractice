'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickRevealConfig {
  reveals?: { label: string; content: string }[];
}

interface ClickRevealInteractiveProps {
  config: ClickRevealConfig;
}

export default function ClickRevealInteractive({ config }: ClickRevealInteractiveProps) {
  const { reveals = [] } = config;
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const toggleReveal = (index: number) => {
    setRevealedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-8 py-4 sm:py-8 perspective-1000">
      <div className="text-center space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Discover Features</h3>
        <p className="text-sm sm:text-base text-foreground-secondary font-medium">Click each card to reveal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {reveals.map((reveal, index) => {
          const isRevealed = revealedIndices.has(index);

          return (
            <div key={index} className="relative h-32 sm:h-56 md:h-64 group cursor-pointer" onClick={() => toggleReveal(index)}>
              <div className="absolute inset-0 transition-all duration-500 preserve-3d" style={{ perspective: "1000px" }}>
                <motion.div
                  initial={false}
                  animate={{ rotateY: isRevealed ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-full h-full relative preserve-3d"
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 backface-hidden">
                    <div className="h-full w-full bg-surface-elevated/60 backdrop-blur-xl border border-[var(--border-default)] rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center p-4 sm:p-8 group-hover:border-sui-accent/30">
                      {/* Gradient Blob for subtle background */}
                      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-sui-accent/20 blur-2xl rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                      </div>

                      <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-surface-secondary border border-[var(--border-subtle)] flex items-center justify-center text-foreground-tertiary font-mono text-xs sm:text-sm group-hover:bg-sui-accent/10 group-hover:text-sui-accent-dark group-hover:border-sui-accent/20 transition-colors">
                          0{index + 1}
                        </div>
                        <h4 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-foreground">
                          {reveal.label}
                        </h4>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-sui-accent-dark/70 transition-colors">
                          Reveal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div
                    className="absolute inset-0 backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <div className="h-full w-full bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 p-4 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Glowing Ring */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-sui-accent/20 via-transparent to-transparent opacity-50" />

                      <div className="relative z-10">
                        <div className="mb-2 sm:mb-4 text-sui-accent">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h5 className="text-sm sm:text-lg font-bold text-white mb-1 sm:mb-2">{reveal.label}</h5>
                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                          {reveal.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <AnimatePresence>
        {revealedIndices.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="px-4 py-2 bg-surface-secondary rounded-full text-xs font-bold text-foreground-secondary tracking-wide uppercase">
              {revealedIndices.size} of {reveals.length} cards revealed
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
