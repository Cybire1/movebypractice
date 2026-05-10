'use client';

import { useState } from 'react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { ParticipantMetadata } from '@/app/lib/livekit/controller';

interface ParticipantsListProps {
  isInstructor?: boolean;
  onInviteToSpeak?: (userId: string) => void;
  authToken?: string;
  classId?: string;
}

export function ParticipantsList({
  isInstructor = false,
  onInviteToSpeak,
  authToken,
  classId,
}: ParticipantsListProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [mutingId, setMutingId] = useState<string | null>(null);

  const handleMute = async (studentId: string, mute: boolean) => {
    if (!authToken || !classId) return;
    setMutingId(studentId);
    try {
      await fetch(`/api/classes/${classId}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ student_id: studentId, mute }),
      });
    } catch (err) {
      console.error('Failed to mute/unmute:', err);
    } finally {
      setMutingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">
          Participants ({participants.length})
        </h3>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => {
          const metadata = (participant.metadata &&
            JSON.parse(participant.metadata)) as ParticipantMetadata;
          const isLocal = participant.identity === localParticipant.identity;
          const canPublish = participant.permissions?.canPublish;
          const isMuting = mutingId === participant.identity;

          return (
            <div
              key={participant.identity}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sui-accent font-bold border border-sui-accent/20">
                  {metadata?.username?.[0]?.toUpperCase() || participant.identity[0]?.toUpperCase() || '?'}
                </div>

                {/* Name and status */}
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    {metadata?.username || participant.identity}
                    {isLocal && ' (you)'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {metadata?.is_instructor && (
                      <span className="px-2 py-0.5 bg-sui-accent text-zinc-900 font-bold rounded">
                        Instructor
                      </span>
                    )}
                    {canPublish && !metadata?.is_instructor && (
                      <span className="px-2 py-0.5 bg-sui-accent/20 text-sui-accent border border-sui-accent/30 rounded">
                        Speaking
                      </span>
                    )}
                    {metadata?.hand_raised && (
                      <span className="flex items-center gap-1">
                        Hand raised
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions (instructor only) */}
              {isInstructor && !metadata?.is_instructor && (
                <div className="flex gap-2">
                  {metadata?.hand_raised && !canPublish && onInviteToSpeak && (
                    <button
                      onClick={() => onInviteToSpeak(participant.identity)}
                      className="px-3 py-1 bg-sui-accent hover:bg-sui-accent-dim text-zinc-900 font-bold text-sm rounded transition-colors"
                    >
                      Invite to Speak
                    </button>
                  )}
                  {canPublish && (
                    <button
                      onClick={() => handleMute(participant.identity, true)}
                      disabled={isMuting}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
                    >
                      {isMuting ? '...' : 'Mute'}
                    </button>
                  )}
                  {!canPublish && !metadata?.hand_raised && (
                    <button
                      onClick={() => handleMute(participant.identity, false)}
                      disabled={isMuting}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-300 text-sm rounded transition-colors"
                    >
                      {isMuting ? '...' : 'Unmute'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
