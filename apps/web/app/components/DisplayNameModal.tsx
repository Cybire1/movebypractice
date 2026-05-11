'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';

export default function DisplayNameModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user already has a display name
    fetch('/api/user/display-name')
      .then((r) => r.json())
      .then((data) => {
        if (!data.displayName) {
          setOpen(true);
        }
      })
      .catch(() => {});
  }, [user]);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Display name must be 2-30 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Welcome! Choose a display name</h2>
        <p className="text-zinc-400 text-sm mb-6">
          This is how other learners will see you in classes and on the leaderboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sui-accent/50 focus:border-sui-accent"
              maxLength={30}
              autoFocus
            />
            <p className="text-xs text-zinc-500 mt-1">{name.trim().length}/30 characters</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving || name.trim().length < 2}
              className="flex-1 px-4 py-2.5 bg-sui-accent text-zinc-900 font-bold rounded-lg hover:bg-sui-accent-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
