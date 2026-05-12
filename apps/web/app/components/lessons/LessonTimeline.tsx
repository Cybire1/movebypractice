'use client';

import { motion } from 'framer-motion';
import { LessonContent } from '@/app/types/lesson';

interface LessonTimelineProps {
    sections: NonNullable<LessonContent['teachingSections']>;
}

export default function LessonTimeline({ sections }: LessonTimelineProps) {
    const allModules = sections.flatMap((section, sIdx) =>
        section.slides.map((slide, slideIdx) => ({
            ...slide,
            sectionTitle: slideIdx === 0 ? section.sectionTitle : null,
            globalIndex: sIdx * 10 + slideIdx
        }))
    );

    return (
        <div className="relative w-full">
            <div className="overflow-x-auto pb-12 px-4 sm:px-6 -mx-4 sm:-mx-6 md:mx-0 md:px-0 scrollbar-hide">
                <div className="relative min-w-max pt-20">

                    {/* Horizontal Line */}
                    <div className="absolute top-[102px] left-0 right-0 h-px bg-[var(--border-default)]" />

                    <div className="flex gap-8">
                        {allModules.map((module, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative flex flex-col items-center w-[260px] sm:w-[300px] md:w-[350px]"
                            >
                                {/* Section Header */}
                                {module.sectionTitle && (
                                    <div className="absolute -top-16 left-0 animate-fade-in">
                                        <span className="text-xs font-bold uppercase tracking-widest text-foreground-tertiary bg-surface-secondary py-1 pr-4">
                                            {module.sectionTitle}
                                        </span>
                                    </div>
                                )}

                                {/* Node */}
                                <div className={`w-4 h-4 rounded-full border-2 bg-surface z-10 transition-colors duration-500 mb-6
                                    ${i === 0 ? 'border-[#4A90D9] scale-125' : 'border-foreground-tertiary/40'}
                                `} />

                                {/* Card */}
                                <div className="group w-full p-6 bg-surface-elevated rounded-2xl border border-[var(--border-default)] hover:border-foreground-tertiary transition-all duration-300">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl bg-surface-secondary w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
                                                {module.emoji || '📘'}
                                            </span>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-[#4A90D9] transition-colors">
                                                {module.title}
                                            </h3>
                                        </div>
                                        <p className="text-foreground-secondary text-sm leading-relaxed line-clamp-3">
                                            {module.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="w-8 shrink-0" />
                    </div>
                </div>
            </div>
        </div>
    );
}
