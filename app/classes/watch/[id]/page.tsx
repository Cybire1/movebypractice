'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { ClassPlayer } from '@/app/components/classes/ClassPlayer';
import { ClassChat } from '@/app/components/classes/ClassChat';
import { QuestionsPanel } from '@/app/components/classes/QuestionsPanel';
import { ParticipantsList } from '@/app/components/classes/ParticipantsList';
import { createClient } from '@/app/lib/supabase/client';
import '@livekit/components-styles';

export default function WatchClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = use(params);
  const [token, setToken] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'participants'>('chat');

  const joinClass = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call join API
      const response = await fetch(`/api/classes/${classId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join class');
      }

      const data = await response.json();
      console.log('Join API response:', data); // Debug log

      if (!data || !data.connection_details || !data.connection_details.token) {
        throw new Error('Invalid response from server');
      }

      setToken(data.connection_details.token);

      // Check if user is instructor by decoding token metadata
      if (data.metadata && data.metadata.is_instructor !== undefined) {
        setIsInstructor(data.metadata.is_instructor);
      }
    } catch (err: unknown) {
      console.error('Error joining class:', err);
      setError(err instanceof Error ? err.message : 'Failed to join class');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    joinClass();
  }, [joinClass]);

  const endClass = async () => {
    if (!confirm('Are you sure you want to end this class?')) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}/end`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to end class');
      }

      // Redirect to classes page
      window.location.href = '/classes';
    } catch (err) {
      console.error('Error ending class:', err);
      alert('Failed to end class');
    }
  };

  const raiseHand = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/raise-hand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to raise hand');
      }
    } catch (err) {
      console.error('Error raising hand:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sui-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Joining class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Join Class</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={joinClass}
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
              <ClassPlayer isInstructor={isInstructor} onEndClass={endClass} />
            </div>

            {/* Right sidebar */}
            <div className="w-96 flex-shrink-0 flex flex-col gap-4">
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
                  <QuestionsPanel classId={classId} isInstructor={isInstructor} />
                )}
                {activeTab === 'participants' && (
                  <ParticipantsList isInstructor={isInstructor} />
                )}
              </div>

              {/* Actions */}
              {isInstructor ? (
                <div className="bg-sui-accent/10 border border-sui-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sui-accent text-sm font-bold">👨‍🏫 Instructor Mode</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    You have full control of this class. Students can see your video and audio.
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={raiseHand}
                    className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    ✋ Raise Hand
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
