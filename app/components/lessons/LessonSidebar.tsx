"use client";

import { motion } from "framer-motion";
import { LessonContent, TeachingSection } from "@/app/types/lesson";

interface LessonSidebarProps {
    lesson: LessonContent;
    currentSectionIndex: number;
    completedSections: number[]; // Array of completed section indices
    phase: 'intro' | 'teaching' | 'exercise' | 'quiz' | 'practice';
}

export default function LessonSidebar({
    lesson,
    currentSectionIndex,
    completedSections,
    phase
}: LessonSidebarProps) {
    const sections = lesson.teachingSections || [];

    return (
        <div className="w-64 h-full bg-surface border-r-2 border-[var(--border-default)] flex flex-col font-mono text-sm relative z-20">
            {/* Header / XP */}
            <div className="p-6 border-b border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground-tertiary font-bold text-xs uppercase tracking-widest">Mission Protocol</span>
                    <div className="flex items-center gap-1.5 text-sui-accent-dark font-bold">
                        <span className="w-2 h-2 bg-sui-accent rounded-full animate-pulse" />
                        <span>ONLINE</span>
                    </div>
                </div>
                <h1 className="font-bold text-foreground leading-tight mb-2">{lesson.title}</h1>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-surface-secondary rounded text-foreground-secondary font-bold">{lesson.difficulty}</span>
                    <span className="px-2 py-0.5 bg-sui-accent/20 text-sui-accent-dark rounded font-bold">+{lesson.xpReward} XP</span>
                </div>
            </div>

            {/* Timeline / Progress */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="space-y-6">
                    {/* Phase: Briefing */}
                    <div className={`relative pl-4 border-l-2 transition-colors duration-300 ${phase === 'intro' ? 'border-sui-accent' : 'border-[var(--border-default)]'
                        }`}>
                        <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full transition-colors duration-300 ${phase === 'intro' ? 'bg-sui-accent' : 'bg-[var(--border-default)]'
                            }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${phase === 'intro' ? 'text-sui-accent-dark' : 'text-foreground-tertiary'
                            }`}>Phase 01</span>
                        <span className={`font-bold ${phase === 'intro' ? 'text-foreground' : 'text-foreground-secondary'
                            }`}>Briefing</span>
                    </div>

                    {/* Phase: Learning Modules */}
                    <div className="relative pl-4 border-l-2 border-[var(--border-default)] pb-2">
                        <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full transition-colors duration-300 ${phase === 'teaching' || phase === 'exercise' ? 'bg-sui-accent' : (
                            phase === 'intro' ? 'bg-[var(--border-default)]' : 'bg-sui-accent' // Completed if past intro
                        )
                            }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest block mb-3 ${phase === 'teaching' || phase === 'exercise' ? 'text-sui-accent-dark' : 'text-foreground-tertiary'
                            }`}>Phase 02 · Modules</span>

                        <div className="space-y-3">
                            {sections.map((section, idx) => {
                                const isActive = idx === currentSectionIndex && (phase === 'teaching' || phase === 'exercise');
                                const isCompleted = completedSections.includes(idx) || (idx < currentSectionIndex);

                                return (
                                    <div key={idx} className="flex items-start gap-3 group">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ring-2 ring-offset-2 transition-all ${isActive ? 'bg-sui-accent ring-sui-accent/20' :
                                            isCompleted ? 'bg-gray-300 ring-transparent' : 'bg-gray-100 ring-transparent'
                                            }`} />
                                        <div className="flex-1">
                                            <p className={`text-xs font-medium leading-tight transition-colors ${isActive ? 'text-foreground' :
                                                isCompleted ? 'text-foreground-tertiary line-through decoration-foreground-tertiary' : 'text-foreground-tertiary'
                                                }`}>
                                                {section.sectionTitle}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Phase: Final Exam */}
                    <div className={`relative pl-4 border-l-2 transition-colors duration-300 ${phase === 'quiz' ? 'border-sui-accent' : 'border-[var(--border-default)]'
                        }`}>
                        <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full transition-colors duration-300 ${phase === 'quiz' ? 'bg-sui-accent' : (
                            phase === 'practice' ? 'bg-sui-accent' : 'bg-[var(--border-default)]'
                        )
                            }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${phase === 'quiz' ? 'text-sui-accent-dark' : 'text-foreground-tertiary'
                            }`}>Phase 03</span>
                        <span className={`font-bold ${phase === 'quiz' ? 'text-foreground' : 'text-foreground-secondary'
                            }`}>Certification Quiz</span>
                    </div>

                    {/* Phase: Free Flight */}
                    <div className={`relative pl-4 border-l-2 transition-colors duration-300 ${phase === 'practice' ? 'border-sui-accent' : 'border-[var(--border-default)]'
                        }`}>
                        <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full transition-colors duration-300 ${phase === 'practice' ? 'bg-sui-accent' : 'bg-[var(--border-default)]'
                            }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${phase === 'practice' ? 'text-sui-accent-dark' : 'text-foreground-tertiary'
                            }`}>Phase 04</span>
                        <span className={`font-bold ${phase === 'practice' ? 'text-foreground' : 'text-foreground-secondary'
                            }`}>Free Flight</span>
                    </div>

                </div>
            </div>

            {/* Footer / User Status */}
            <div className="p-4 border-t border-[var(--border-default)] bg-surface-secondary">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-[var(--border-default)] flex items-center justify-center font-bold text-foreground-tertiary text-xs">
                        ME
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Cadet</div>
                        <div className="text-[10px] text-foreground-tertiary uppercase tracking-wider">Level 1</div>
                    </div>
                </div>
            </div>

        </div>
    );
}
