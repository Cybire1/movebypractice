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

                {/* Mobile Header (Placeholder) */}
                <div className="md:hidden h-14 border-b border-[var(--border-default)] bg-surface flex items-center px-4">
                    <span className="font-bold text-sm">Mission Control</span>
                </div>

                {/* Split Pane Container */}
                <div className="flex-1 flex relative">

                    {/* Left Pane: Content / Briefing / Slides */}
                    {/* On small screens, this might be full width unless editor is toggled */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 relative z-10">
                        {children}
                    </div>

                    {/* Right Pane: Editor & Terminal */}
                    {/* Persistent, but responsive sizing */}
                    <div className="w-[45%] border-l-2 border-[var(--border-default)] flex flex-col bg-surface relative z-20 shadow-[-10px_0_40px_-20px_rgba(0,0,0,0.05)]">
                        {editorPanel}
                    </div>

                </div>

            </div>

        </div>
    );
}
