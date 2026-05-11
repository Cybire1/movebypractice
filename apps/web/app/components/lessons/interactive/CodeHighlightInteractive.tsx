'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeHighlightConfig {
  code?: string;
  highlights?: { line: number; explanation: string }[];
}

interface CodeHighlightInteractiveProps {
  config: CodeHighlightConfig;
}

export default function CodeHighlightInteractive({ config }: CodeHighlightInteractiveProps) {
  const { code = '', highlights = [] } = config;
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const codeLines = code.split('\n');

  const getHighlightForLine = (lineNumber: number) => {
    return highlights.find((h) => h.line === lineNumber);
  };

  const selectedHighlight = selectedLine !== null ? getHighlightForLine(selectedLine) : null;

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start relative">
      {/* Editor Window */}
      <div className={`flex-1 transition-all duration-500 ${selectedHighlight ? 'md:-translate-x-12' : ''}`}>
        <div className="bg-[#0D1117] rounded-xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/50 relative group">

          {/* Glowing Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-white/5 relative z-10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Interactive Mode</span>
            </div>
          </div>

          {/* Code Content */}
          <div className="px-6 py-4 font-mono text-sm overflow-x-auto relative z-10">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1;
              const highlight = getHighlightForLine(lineNumber);
              const isHighlighted = !!highlight;
              const isSelected = selectedLine === lineNumber;

              // Dimming logic
              const isDimmed = selectedLine !== null && !isSelected;

              return (
                <motion.div
                  key={index}
                  onClick={() => isHighlighted && setSelectedLine(isSelected ? null : lineNumber)}
                  animate={{ opacity: isDimmed ? 0.3 : 1 }}
                  className={`relative flex items-center gap-4 py-1 px-3 rounded-lg transition-all duration-300 ${isHighlighted ? 'cursor-pointer' : ''
                    } ${isSelected
                      ? 'bg-blue-500/10 shadow-[inset_2px_0_0_0_#3B82F6]'
                      : isHighlighted
                        ? 'hover:bg-white/5'
                        : ''
                    }`}
                >
                  {/* Line Number */}
                  <span className={`select-none min-w-[1.5rem] text-right text-xs ${isSelected ? 'text-blue-400 font-bold' : 'text-zinc-700'
                    }`}>
                    {lineNumber}
                  </span>

                  {/* Code Line */}
                  <code className={`flex-1 relative z-10 whitespace-pre ${isSelected ? 'text-white' : 'text-zinc-400'
                    }`}>
                    {/* Basic syntax coloring simulation */}
                    {line.split(' ').map((word, i) => {
                      if (word.includes('module') || word.includes('struct') || word.includes('fun'))
                        return <span key={i} className="text-[#ff7b72] mr-1">{word}</span>;
                      if (word.includes('u8') || word.includes('u64') || word.includes('bool'))
                        return <span key={i} className="text-[#79c0ff] mr-1">{word}</span>;
                      if (word.includes('public') || word.includes('has'))
                        return <span key={i} className="text-[#d2a8ff] mr-1">{word}</span>;
                      return <span key={i} className="mr-1">{word}</span>
                    })}
                  </code>

                  {/* Highlight Pulse */}
                  {isHighlighted && !isSelected && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-ping" />
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-line"
                      className="absolute inset-0 border border-blue-500/30 rounded-lg pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contextual Explanation Card (Floating) */}
      <AnimatePresence>
        {selectedHighlight && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute right-0 top-1/4 md:translate-x-[110%] w-full md:w-72 bg-[var(--surface-overlay)] backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-[var(--border-default)] z-50 ring-1 ring-black/5"
            style={{ top: Math.max(0, (selectedLine || 0) * 28 + 60) }} // Rough positioning based on line height
          >
            {/* Connector Dot */}
            <div className="hidden md:block absolute top-6 -left-3 w-6 h-6 bg-white rotate-45 border-l border-b border-white/20" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Insight</span>
              </div>
              <p className="text-foreground-secondary text-sm leading-relaxed font-medium">
                {selectedHighlight.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
