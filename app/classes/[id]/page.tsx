'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth/AuthProvider';

interface ClassData {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  maxStudents: number;
  status: string;
  chatEnabled: boolean;
  qaEnabled: boolean;
  donationsEnabled: boolean;
  participantCount: number;
  instructor: {
    username: string | null;
    email: string | null;
  };
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function fetchClass() {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          const foundClass = data.classes.find((c: ClassData) => c.id === params.id);
          if (foundClass) {
            setClassData(foundClass);
          }
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchClass();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-16 h-16 border-4 border-sui-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Class Not Found</h1>
          <Link href="/classes" className="text-sui-accent font-semibold hover:underline">
            ← Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  const startClass = async () => {
    if (!classData) return;

    setStarting(true);
    try {
      const response = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classData.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to start class');
        return;
      }

      // Redirect to watch page
      router.push(`/classes/watch/${classData.id}`);
    } catch (error) {
      console.error('Error starting class:', error);
      alert('Failed to start class');
    } finally {
      setStarting(false);
    }
  };

  const scheduledDate = new Date(classData.scheduledAt);
  const instructorName = classData.instructor?.username || classData.instructor?.email?.split('@')[0] || 'Instructor';
  const isInstructor = user && classData && user.id === classData.instructorId;

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-24 px-6">
      <div className="absolute inset-0 bg-grid-graph opacity-60 pointer-events-none fixed" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/classes" className="inline-flex items-center gap-2 text-zinc-500 hover:text-sui-accent transition-colors mb-8 text-sm font-bold">
          ← Back to Classes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 md:p-12 shadow-xl"
        >
          {/* Status Badge */}
          <div className="flex items-center gap-4 mb-6">
            {classData.status === 'live' && (
              <span className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-red-600">LIVE NOW</span>
              </span>
            )}
            {classData.status === 'scheduled' && (
              <span className="flex items-center gap-2 px-4 py-2 bg-sui-accent/10 border border-sui-accent/20 rounded-full">
                <span className="text-sm font-bold text-sui-accent-dark">SCHEDULED</span>
              </span>
            )}
            <span className="text-sm text-zinc-500 font-medium">
              {format(scheduledDate, 'EEEE, MMMM d, yyyy')} at {format(scheduledDate, 'h:mm a')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter-swiss mb-6">
            {classData.title}
          </h1>

          {/* Description */}
          {classData.description && (
            <p className="text-xl text-zinc-600 mb-8 leading-relaxed">
              {classData.description}
            </p>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-50 rounded-2xl p-6">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Duration</div>
              <div className="text-2xl font-bold text-zinc-900">{classData.durationMinutes} min</div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-6">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Max Students</div>
              <div className="text-2xl font-bold text-zinc-900">{classData.maxStudents}</div>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-6">
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Instructor</div>
              <div className="text-2xl font-bold text-zinc-900">{instructorName}</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-3 mb-8">
            {classData.chatEnabled && (
              <span className="px-4 py-2 bg-green-500/10 text-green-700 rounded-full text-sm font-semibold">
                💬 Chat Enabled
              </span>
            )}
            {classData.qaEnabled && (
              <span className="px-4 py-2 bg-sui-accent/10 text-sui-accent-dark rounded-full text-sm font-semibold">
                ❓ Q&A Enabled
              </span>
            )}
            {classData.donationsEnabled && (
              <span className="px-4 py-2 bg-yellow-500/10 text-yellow-700 rounded-full text-sm font-semibold">
                💎 Tips Enabled
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {classData.status === 'live' && (
              <Link
                href={`/classes/watch/${classData.id}`}
                className="px-8 py-4 bg-sui-accent text-zinc-900 rounded-full font-bold text-lg hover:bg-sui-accent-dim transition-colors shadow-lg shadow-sui-accent/30 inline-flex items-center gap-2"
              >
                <span>Join Live Stream</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            )}
            {classData.status === 'scheduled' && (
              <>
                {isInstructor ? (
                  <button
                    onClick={startClass}
                    disabled={starting}
                    className="px-8 py-4 bg-sui-accent text-zinc-900 rounded-full font-bold text-lg hover:bg-sui-accent-dim transition-colors shadow-lg shadow-sui-accent/30 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {starting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Start Class</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button className="px-8 py-4 bg-sui-accent text-zinc-900 rounded-full font-bold text-lg hover:bg-sui-accent-dim transition-colors shadow-lg shadow-sui-accent/30">
                    Register for Class
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
