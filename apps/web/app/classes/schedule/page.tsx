'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Magnetic from '@/app/components/Magnetic';

export default function ScheduleClassPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [maxStudents, setMaxStudents] = useState(50);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [qaEnabled, setQaEnabled] = useState(true);
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('You must be logged in to schedule a class');

      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const response = await fetch('/api/classes/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          scheduledAt,
          durationMinutes: duration,
          maxStudents,
          chatEnabled,
          qaEnabled,
          donationsEnabled,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create class');
      }

      router.push('/classes');
    } catch (err: unknown) {
      console.error('Error scheduling class:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      label: 'Enable Chat',
      desc: 'Real-time student messaging',
      state: chatEnabled,
      setState: setChatEnabled,
      icon: (
        <svg className="w-8 h-8 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      label: 'Enable Q&A',
      desc: 'Managed question queue',
      state: qaEnabled,
      setState: setQaEnabled,
      icon: (
        <svg className="w-8 h-8 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Token Tips',
      desc: 'Receive ALEO tips',
      state: donationsEnabled,
      setState: setDonationsEnabled,
      icon: (
        <svg className="w-8 h-8 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary text-foreground relative overflow-hidden pt-32 pb-24">
      {/* Background Assets */}
      <div className="absolute inset-0 bg-grid-graph opacity-60 pointer-events-none fixed" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sui-accent/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <main className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <Link href="/classes" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-[#4A90D9] transition-colors mb-6 text-sm font-bold tracking-wide uppercase">
              ← Back to Calendar
            </Link>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter-swiss mb-4">
              Schedule Session
            </h1>
            <p className="text-xl text-foreground-secondary max-w-xl">
              Create a new live learning environment. Share your Sui knowledge.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4"
            >
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-400">Unable to schedule</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Info Card */}
            <div className="bg-surface-elevated/50 backdrop-blur-md border border-[var(--border-default)] rounded-[2rem] p-8 md:p-10 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground flex items-center justify-center text-sm">1</span>
                Class Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Advanced Move Patterns"
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all text-lg font-medium placeholder:text-foreground-tertiary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="What will students learn?"
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all text-lg font-medium placeholder:text-foreground-tertiary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Timing Card */}
            <div className="bg-surface-elevated/50 backdrop-blur-md border border-[var(--border-default)] rounded-[2rem] p-8 md:p-10 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground flex items-center justify-center text-sm">2</span>
                Timing & Capacity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                    min={15} step={15}
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2 ml-1">Max Students</label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(parseInt(e.target.value))}
                    required
                    min={1} max={500}
                    className="w-full px-6 py-4 bg-surface-secondary border border-[var(--border-default)] rounded-2xl focus:outline-none focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Features Selection */}
            <div className="bg-surface-elevated/50 backdrop-blur-md border border-[var(--border-default)] rounded-[2rem] p-8 md:p-10 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground flex items-center justify-center text-sm">3</span>
                Room Configuration
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {features.map((f) => (
                  <div
                    key={f.label}
                    onClick={() => f.setState(!f.state)}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] ${f.state ? 'border-foreground bg-foreground/5' : 'border-[var(--border-default)] bg-surface-elevated hover:border-foreground-tertiary'
                      }`}
                  >
                    <div className="text-2xl mb-3">{f.icon}</div>
                    <div className="font-bold text-foreground mb-1">{f.label}</div>
                    <div className="text-xs text-foreground-secondary font-medium">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-6 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 font-bold text-foreground-secondary hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <Magnetic>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative px-10 py-5 bg-foreground text-surface rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-sui-accent/20 hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        Create Session
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-sui-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[0.23, 1, 0.32, 1]" />
                </button>
              </Magnetic>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
