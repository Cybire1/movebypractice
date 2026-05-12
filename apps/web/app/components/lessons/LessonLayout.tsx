"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LessonLayoutProps {
    sidebar: ReactNode;
    children: ReactNode; // Main Content (Slides, etc)
    editorPanel: ReactNode; // Editor + Terminal
    isEditorExpanded?: boolean; // Mobile/Tablet toggle
}

export default function LessonLayout({
    sidebar,
    children,
    editorPanel,
    isEditorExpanded = false
}: LessonLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-surface-secondary overflow-hidden">

            {/* Sidebar - Mission Control */}
            <div className="hidden md:block flex-shrink-0">
                {sidebar}
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile Header */}
                <div className="md:hidden h-14 border-b border-[var(--border-default)] bg-surface flex items-center px-4 gap-3">
                    <a href="/lessons" className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center text-foreground-secondary hover:text-foreground transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </a>
                    <span className="font-bold text-sm text-foreground">Mission Control</span>
                </div>

                {/* Split Pane Container */}
                <div className="flex-1 flex relative">

                    {/* Left Pane: Content / Briefing / Slides */}
                    {/* Full width on mobile/tablet, 55% on large screens when editor is visible */}
                    <div className="w-full lg:w-[55%] flex-shrink-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 relative z-10">
                        {children}
                    </div>

                    {/* Right Pane: Editor & Terminal */}
                    {/* Hidden on mobile/tablet, visible on large screens */}
                    <div className="hidden lg:flex lg:w-[45%] border-l-2 border-[var(--border-default)] flex-col bg-surface relative z-20 shadow-[-10px_0_40px_-20px_rgba(0,0,0,0.05)]">
                        {editorPanel}
                    </div>

                </div>

            </div>

        </div>
    );
}
