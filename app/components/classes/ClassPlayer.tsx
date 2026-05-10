'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AudioTrack,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  useMediaDeviceSelect,
} from '@livekit/components-react';
import {
  ConnectionState,
  LocalVideoTrack,
  Track,
  createLocalTracks,
} from 'livekit-client';
import { ParticipantMetadata } from '@/app/lib/livekit/controller';

interface ClassPlayerProps {
  isInstructor?: boolean;
  onEndClass?: () => void;
}

export function ClassPlayer({ isInstructor = false, onEndClass }: ClassPlayerProps) {
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();
  const localVideoEl = useRef<HTMLVideoElement>(null);

  const { metadata, name: roomName, state: roomState } = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const localMetadata = (localParticipant.metadata &&
    JSON.parse(localParticipant.metadata)) as ParticipantMetadata;
  const canPublish = isInstructor || localMetadata?.is_instructor;

  // Create and publish local video track for instructor
  useEffect(() => {
    if (canPublish && localParticipant) {
      const createAndPublishTracks = async () => {
        const tracks = await createLocalTracks({ audio: true, video: true });
        const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        const micTrack = tracks.find((t) => t.kind === Track.Kind.Audio);

        if (camTrack && localVideoEl?.current) {
          camTrack.attach(localVideoEl.current);
        }
        setLocalVideoTrack(camTrack as LocalVideoTrack);

        // Publish tracks to the room
        if (camTrack) {
          await localParticipant.publishTrack(camTrack);
        }
        if (micTrack) {
          await localParticipant.publishTrack(micTrack);
        }
      };
      void createAndPublishTracks();
    }
  }, [canPublish, localParticipant]);

  // Handle camera device selection
  const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
    kind: 'videoinput',
  });

  useEffect(() => {
    if (localVideoTrack) {
      void localVideoTrack.setDeviceId(activeCameraDeviceId);
    }
  }, [localVideoTrack, activeCameraDeviceId]);

  // Get remote video and audio tracks
  const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  return (
    <div className="relative w-full h-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      {/* Main video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full">
        {/* Local participant video (instructor) */}
        {canPublish && (
          <div className="relative bg-black/20 rounded-2xl overflow-hidden aspect-video border border-white/5">
            <video
              ref={localVideoEl}
              className="absolute w-full h-full object-cover -scale-x-100"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute bottom-3 left-3 bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold tracking-wide">
              {localMetadata?.username || localParticipant.name || 'You'} (you)
            </div>
          </div>
        )}

        {/* Remote participants video */}
        {remoteVideoTracks.map((track) => {
          const metadata = (track.participant.metadata &&
            JSON.parse(track.participant.metadata)) as ParticipantMetadata;
          return (
            <div
              key={track.participant.identity}
              className="relative bg-black/20 rounded-2xl overflow-hidden aspect-video border border-white/5"
            >
              <VideoTrack trackRef={track} className="absolute w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold tracking-wide flex items-center gap-2">
                {metadata?.hand_raised && <span className="animate-bounce">✋</span>}
                {metadata?.username || track.participant.name || track.participant.identity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio tracks (not visible) */}
      {remoteAudioTracks.map((track) => (
        <AudioTrack trackRef={track} key={track.participant.identity} />
      ))}

      {/* Header with class info */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-zinc-900/80 to-transparent pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
            {roomState === ConnectionState.Connected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sui-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sui-accent"></span>
                </span>
                <span className="text-white font-bold text-xs tracking-wider uppercase">Live</span>
              </>
            ) : (
              <span className="text-white/60 text-xs font-medium">Connecting...</span>
            )}
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-white/80">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-xs font-medium">{participants.length}</span>
            </div>
          </div>

          {isInstructor && onEndClass && (
            <button
              onClick={onEndClass}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              End Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
