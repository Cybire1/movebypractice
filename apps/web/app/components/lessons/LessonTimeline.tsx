'use client';

import { motion } from 'framer-motion';
import { LessonContent } from '@/app/types/lesson';

interface LessonTimelineProps {
    sections: NonNullable<LessonContent['teachingSections']>;
}

export default function LessonTimeline({ sections }: LessonTimelineProps) {
    // Flatten slides from all sections creates a linear journey
    const allModules = sections.flatMap((section, sIdx) =>
        section.slides.map((slide, slideIdx) => ({
            ...slide,
            sectionTitle: slideIdx === 0 ? section.sectionTitle : null,
            globalIndex: sIdx * 10 + slideIdx // crude unique key gen
        }))
    );

    return (
        <div className="relative w-full">
            {/* Scroll Container */}
            <div className="overflow-x-auto pb-12 px-6 -mx-6 md:mx-0 md:px-0 scrollbar-hide">
                <div className="relative min-w-max pt-20">

                    {/* Horizontal Line */}
                    <div className="absolute top-[102px] left-0 right-0 h-px bg-zinc-200" />

                    <div className="flex gap-8">
                        {allModules.map((module, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative flex flex-col items-center w-[300px] md:w-[350px]"
                            >
                                {/* Section Header (if start of new section) */}
                                {module.sectionTitle && (
                                    <div className="absolute -top-16 left-0 animate-fade-in">
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 bg-[#FAFAFA] py-1 pr-4">
                                            {module.sectionTitle}
                                        </span>
                                    </div>
                                )}

                                {/* Node on the line */}
                                <div className={`w-4 h-4 rounded-full border-2 bg-white z-10 transition-colors duration-500 mb-6
                                    ${i === 0 ? 'border-blue-600 scale-125' : 'border-zinc-300 group-hover:border-blue-400'}
                                `} />

                                {/* Content Card */}
                                <div className="group w-full p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl bg-zinc-50 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
                                                {module.emoji || '📘'}
                                            </span>
                                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                                                {module.title}
                                            </h3>
                                        </div>
                                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                                            {module.content}
                                        </p>
                                    </div>
                                </div>

                            </motion.div>
                        ))}

                        {/* End Node Helper Spacer */}
                        <div className="w-8 shrink-0" />
                    </div>
                </div>
            </div>
        </div>
    );
}
