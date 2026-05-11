"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectWallet from './ConnectWallet';
import UserMenu from './auth/UserMenu';
import AuthModal from './auth/AuthModal';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/app/lib/auth/AuthProvider';

function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="glide-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4A90D9"/>
                    <stop offset="100%" stopColor="#6BB5FF"/>
                </linearGradient>
            </defs>
            <path d="M 26 5 A 19 19 0 0 0 26 43 Z" fill="currentColor" transform="translate(-3, -2)"/>
            <path d="M 26 5 A 19 19 0 0 1 26 43 Z" fill="url(#glide-grad)" transform="translate(3, 2)"/>
        </svg>
    );
}

export default function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user } = useAuth();

    const navItems = [
        { name: 'Lessons', href: '/lessons' },
        { name: 'Exercises', href: '/exercises' },
        { name: 'Challenge', href: '/daily-challenge' },
    ];

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`pointer-events-auto relative flex items-center gap-2 p-2 rounded-full backdrop-blur-xl border transition-colors duration-300
                    bg-[var(--surface-overlay)] border-[var(--border-default)] shadow-[0_2px_20px_rgba(0,0,0,0.06)]`}
            >
                {/* Logo */}
                <Link href="/" className="px-4 py-2 flex items-center gap-3 group">
                    <LogoMark className="w-8 h-8 text-foreground transition-transform group-hover:scale-105" />
                    <span className="font-bold tracking-tight hidden sm:block transition-colors text-foreground group-hover:text-blue-600">
                        Glide<span className="text-blue-500">.</span>
                    </span>
                </Link>

                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Divider */}
                    <div className="w-[1px] h-6 mx-1 bg-[var(--border-default)]" />

                    {/* Links */}
                    <ul className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const itemClass = `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                isActive
                                    ? 'text-surface bg-foreground'
                                    : 'text-foreground-secondary hover:text-foreground hover:bg-[var(--border-subtle)]'
                            }`;

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={itemClass}
                                    >
                                        {item.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 border rounded-full border-foreground-tertiary"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Divider */}
                    <div className="w-[1px] h-6 mx-1 bg-[var(--border-default)]" />
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Mobile Hamburger Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden px-2 py-2 transition-colors text-foreground/80 hover:text-foreground"
                >
                    <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                        <motion.span
                            animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
                            className="w-5 h-0.5 block rounded-full bg-foreground"
                        />
                        <motion.span
                            animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                            className="w-5 h-0.5 block rounded-full bg-foreground"
                        />
                        <motion.span
                            animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
                            className="w-5 h-0.5 block rounded-full bg-foreground"
                        />
                    </div>
                </button>

                {/* CTA - Auth & Wallet */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <UserMenu isHome={isHome} />
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAuthModal(true)}
                            className="px-5 h-[36px] border rounded-full text-sm font-semibold transition-all shadow-sm bg-foreground text-surface border-foreground hover:opacity-90"
                        >
                            Sign In
                        </motion.button>
                    )}
                    <ConnectWallet />
                </div>
            </motion.nav>

            {/* Mobile Menu Dropdown & Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-auto md:hidden"
                        />

                        {/* Menu Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed top-24 left-4 right-4 p-2 bg-surface border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col gap-1 overflow-hidden origin-top z-50 pointer-events-auto md:hidden"
                        >
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`relative px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-foreground text-surface' : 'text-foreground-secondary hover:bg-surface-secondary'}`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="h-[1px] bg-[var(--border-default)] my-1 mx-2" />
                            <div className="flex flex-col gap-2 p-2">
                                {user ? (
                                    <div className="px-4 py-2 text-sm text-foreground-secondary text-center">
                                        Signed in as <span className="font-semibold text-foreground">{user.email}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowAuthModal(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-6 py-3 bg-foreground text-surface rounded-xl font-semibold text-sm"
                                    >
                                        Sign In
                                    </button>
                                )}
                                <ConnectWallet />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </header>
    );
}
