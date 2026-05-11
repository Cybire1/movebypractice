'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useGameStore } from '@/app/lib/store/gameStore';

interface UserMenuProps {
  isHome?: boolean;
}

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: '/lessons',
    label: 'My Lessons',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/daily-challenge',
    label: 'Daily Challenge',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
  },
];

export default function UserMenu({ isHome = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { xp, level, streak } = useGameStore();

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-secondary animate-pulse border border-[var(--border-default)]" />
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const initial = user.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Builder';

  return (
    <div className="relative">
      {/* Avatar Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ring-2 ring-offset-1 ring-offset-transparent
          ${isOpen ? 'ring-[#4A90D9]' : 'ring-transparent hover:ring-[var(--border-default)]'}
          ${isHome
            ? 'bg-white/10 text-white'
            : 'bg-foreground text-surface'
          }`}
      >
        {initial}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 mt-3 w-72 bg-surface-elevated rounded-2xl shadow-2xl border border-[var(--border-default)] overflow-hidden z-50"
            >
              {/* User Header */}
              <div className="p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground text-surface flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-foreground-tertiary truncate">{user.email}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-mono font-bold">{level}</span>
                    <span className="text-foreground-tertiary">LVL</span>
                  </div>
                  <div className="w-px h-3 bg-[var(--border-default)]" />
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-mono font-bold">{xp.toLocaleString()}</span>
                    <span className="text-foreground-tertiary">XP</span>
                  </div>
                  <div className="w-px h-3 bg-[var(--border-default)]" />
                  <div className="flex items-center gap-1.5 text-xs">
                    {streak > 0 && <span className="text-orange-500">🔥</span>}
                    <span className="font-mono font-bold">{streak}</span>
                    <span className="text-foreground-tertiary">day streak</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-2 pb-2">
                {menuItems.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-secondary rounded-xl transition-colors"
                  >
                    <span className="text-foreground-tertiary">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sign Out */}
              <div className="px-2 pb-2 pt-1 border-t border-[var(--border-subtle)] mx-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5 rounded-xl transition-colors mt-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
