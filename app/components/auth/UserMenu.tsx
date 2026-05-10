'use client';

/**
 * User Menu Component
 * Displays user avatar and dropdown menu
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth/AuthProvider';

interface UserMenuProps {
  isHome?: boolean;
}

export default function UserMenu({ isHome = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-secondary animate-pulse border border-[var(--border-default)]"></div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Get user initial for avatar
  const initial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative">
      {/* Minimalistic Pill Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-2 pr-4 py-1.5 border rounded-full text-sm font-semibold transition-all shadow-sm
          ${isHome
            ? 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-sui-accent/50'
            : 'bg-black text-white border-black hover:bg-zinc-800'
          }`}
      >
        {/* Avatar Circle */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
          ${isHome ? 'bg-sui-accent text-black' : 'bg-white text-black'}`}>
          {initial}
        </div>
        <span className="text-xs font-medium opacity-90">Account</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-64 bg-[var(--surface-overlay)] backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--border-default)] overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="px-4 py-3 bg-surface-secondary border-b border-[var(--border-subtle)]">
                <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-sui-accent animate-pulse" />
                  <p className="text-[10px] uppercase tracking-wider font-bold text-foreground-secondary">Connected</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <span className="mr-2">📊</span> Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <span className="mr-2">👤</span> Profile
                </Link>
                <Link
                  href="/achievements"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <span className="mr-2">🏆</span> Achievements
                </Link>
                <Link
                  href="/classes"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <span className="mr-2">🎥</span> Live Classes
                </Link>
              </div>

              {/* Sign Out */}
              <div className="p-1 border-t border-[var(--border-subtle)]">
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
