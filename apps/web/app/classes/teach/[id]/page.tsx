'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { ClassPlayer } from '@/app/components/classes/ClassPlayer';
import { ClassChat } from '@/app/components/classes/ClassChat';
import { QuestionsPanel } from '@/app/components/classes/QuestionsPanel';
import { ParticipantsList } from '@/app/components/classes/ParticipantsList';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import '@livekit/components-styles';

export default function TeachClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = use(params);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'participants'>('qa');
  const [ending, setEnding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    startClass();
  }, [classId]);

  const startClass = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call create API to start the class
      const response = await fetch('/api/classes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: classId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start class');
      }

      const data = await response.json();
      setToken(data.connection_details.token);
    } catch (err: unknown) {
      console.error('Error starting class:', err);
      setError(err instanceof Error ? err.message : 'Failed to start class');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const endClass = async () => {
    if (!confirm('Are you sure you want to end the class? This action cannot be undone.')) {
      return;
    }

    try {
      setEnding(true);

      const response = await fetch(`/api/classes/${classId}/end`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to end class');
      }

      // Redirect to classes page
      router.push('/classes');
    } catch (err: unknown) {
      console.error('Error ending class:', err);
      alert('Failed to end class: ' + (err instanceof Error ? err.message : String(err)));
      setEnding(false);
    }
  };

  const inviteToSpeak = async (studentId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/invite-to-speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite student');
      }
    } catch (err) {
      console.error('Error inviting student:', err);
      alert('Failed to invite student to speak');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sui-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Starting class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Start Class</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={startClass}
            className="px-6 py-3 bg-sui-accent hover:bg-sui-accent-dim text-zinc-900 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
      >
        <div className="h-screen flex flex-col">
          {/* Main content area */}
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Video player */}
            <div className="flex-1 min-w-0">
              <ClassPlayer isInstructor={true} onEndClass={endClass} />
            </div>

            {/* Right sidebar */}
            <div className="w-96 flex-shrink-0 flex flex-col gap-4">
              {/* Instructor controls */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Instructor Controls</h3>
                <div className="flex gap-2">
                  <button
                    onClick={endClass}
                    disabled={ending}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {ending ? 'Ending...' : 'End Class'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-gray-900 rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${activeTab === 'chat'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('qa')}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${activeTab === 'qa'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Q&A
                </button>
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${activeTab === 'participants'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  People
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0">
                {activeTab === 'chat' && <ClassChat classId={classId} />}
                {activeTab === 'qa' && (
                  <QuestionsPanel classId={classId} isInstructor={true} />
                )}
                {activeTab === 'participants' && (
                  <ParticipantsList
                    isInstructor={true}
                    onInviteToSpeak={inviteToSpeak}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
