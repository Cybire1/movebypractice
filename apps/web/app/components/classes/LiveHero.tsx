'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface LiveHeroProps {
    liveClasses: any[];
}

export default function LiveHero({ liveClasses }: LiveHeroProps) {
    if (!liveClasses || liveClasses.length === 0) return null;

    const activeClass = liveClasses[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full bg-zinc-900 rounded-[2.5rem] p-2 overflow-hidden mb-24"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative bg-zinc-900 rounded-[2rem] border border-white/10 p-8 md:p-12 overflow-hidden">
                {/* Background Mesh */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left: Content */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="font-mono text-xs font-bold text-white/60 tracking-[0.2em] uppercase">
                                Mission Control • Live Feed
                            </span>
                        </div>

                        <h3 className="text-display font-bold text-white/40 uppercase tracking-wider mb-2 text-sm">
                            Currently Airing
                        </h3>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-[0.95]">
                            {activeClass.title}
                        </h1>
                        <p className="text-lg text-zinc-400 mb-10 max-w-md leading-relaxed">
                            {activeClass.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <Link
                                href={`/classes/watch/${activeClass.id}`}
                                className="group relative px-8 py-4 bg-white text-zinc-900 rounded-full font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-all duration-300 flex items-center gap-3 overflow-hidden"
                            >
                                <span className="relative z-10">Join Uplink</span>
                                <motion.svg
                                    className="w-5 h-5 relative z-10"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </motion.svg>
                                <div className="absolute inset-0 bg-zinc-200 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                            </Link>

                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-mono font-bold text-white">
                                    {activeClass.participantCount} Cadets Online
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stream Preview */}
                    <div className="relative group">
                        {/* Decor */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                            {/* Simulated Screen UI */}
                            <div className="absolute top-4 left-4 flex gap-2 z-20">
                                <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white/80 border border-white/10">REC</div>
                                <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white/80 border border-white/10">HD</div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                {/* Placeholder for stream or thumbnail */}
                                <div className="text-6xl">🎥</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 box-shadow-xl">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Instructor Tag */}
                            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold border-2 border-black">
                                    {activeClass.instructor?.username?.[0] || 'I'}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Instructor</div>
                                    <div className="text-sm font-bold text-white">{activeClass.instructor?.username}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

