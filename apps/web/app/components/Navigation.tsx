'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import AuthModal from './auth/AuthModal';
import UserMenu from './auth/UserMenu';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Scroll shadow effect
      setIsScrolled(window.scrollY > 20);

      // Scroll progress indicator
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/daily-challenge', label: 'Daily Challenge' },
    { href: '/lessons', label: 'Lessons' },
    { href: '/exercises', label: 'Exercises' },
    { href: '/classes', label: 'Live Classes' },
  ];

  return (
    <>
      {/* Navigation Bar - Floating Pill Container */}
      <div className="fixed top-0 w-full z-50 pt-4 px-4 md:px-6 lg:px-8">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className={`relative max-w-7xl mx-auto backdrop-blur-2xl transition-all duration-500 rounded-full border-2 overflow-visible ${
            isScrolled
              ? 'bg-white/95 shadow-2xl shadow-sui-ocean/20 border-sui-ocean'
              : 'bg-white/90 shadow-xl shadow-sui-ocean/10 border-sui-ocean/50'
          }`}
        >
          {/* Animated Blue Orb - travels around the border */}
          <motion.div
            className="absolute -top-1.5 left-0 w-3 h-3"
            animate={{
              x: ['0%', '100%', '100%', '0%', '0%'],
              y: ['0%', '0%', '1600%', '1600%', '0%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            <div className="w-3 h-3 bg-sui-ocean rounded-full shadow-lg shadow-sui-ocean/60" />
          </motion.div>
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group relative">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="relative"
                >
                  {/* Logo container */}
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sui-ocean to-sui-ocean-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <Image
                      src="/sui-symbol.svg"
                      alt="Sui"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                  </div>
                </motion.div>

                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-sui-navy group-hover:text-sui-ocean transition-colors">
                    Move By Practice
                  </span>
                  <div className="text-[9px] font-medium text-sui-gray-500 -mt-0.5 tracking-widest uppercase">
                    Learn Sui • Build Smart
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative group px-4 py-2"
                    >
                      <span className={`text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-sui-navy font-semibold'
                          : 'text-sui-gray-600 group-hover:text-sui-navy'
                      }`}>
                        {link.label}
                      </span>

                      {/* Hover background */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-sui-sky/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      )}
                    </Link>
                  );
                })}

                {/* Auth Buttons or User Menu */}
                {user ? (
                  <UserMenu />
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      className="px-5 py-2 text-sm font-medium text-sui-gray-700 hover:text-sui-navy transition-colors"
                    >
                      Sign In
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="px-6 py-2.5 bg-sui-ocean hover:bg-sui-ocean-dark text-white rounded-full font-semibold text-sm shadow-lg shadow-sui-ocean/30 hover:shadow-xl hover:shadow-sui-ocean/50 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        Start Learning
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-sui-navy hover:text-sui-ocean transition-colors flex-shrink-0"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={isMobileMenuOpen ? 'open' : 'closed'}
                  className="w-5 h-4 flex flex-col justify-between"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 },
                    }}
                    className="w-full h-0.5 bg-current transform transition-all origin-center"
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                    className="w-full h-0.5 bg-current transition-opacity"
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 },
                    }}
                    className="w-full h-0.5 bg-current transform transition-all origin-center"
                  />
                </motion.div>
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-24" />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-sui-navy/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-sui-gray-200">
                  <span className="text-lg font-bold text-sui-navy">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-sui-gray-600 hover:text-sui-ocean transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Links */}
                <div className="flex-1 overflow-y-auto py-6">
                  <div className="space-y-1 px-4">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-sui-gray-700 hover:text-sui-ocean hover:bg-sui-sky rounded-xl transition-all font-medium"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mobile Menu Footer - Hide Start Learning button on lesson pages */}
                {!pathname?.startsWith('/lessons/') && (
                  <div className="p-6 border-t border-sui-gray-200 space-y-3">
                    <Link
                      href="/lessons/1"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-6 py-3 bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white rounded-full hover:shadow-lg transition-all font-semibold text-center"
                    >
                      Start Learning →
                    </Link>
                    <p className="text-xs text-center text-sui-gray-500">
                      14 interactive lessons • 100% free
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
}
