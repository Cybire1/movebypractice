import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { createBlob, decodeAudioData } from '../lib/audio/audioUtils';

interface UseMultimodalLiveProps {
    onMessage?: (role: 'user' | 'model', text: string) => void;
    context?: string;
    apiKey?: string;
}

export function useMultimodalLive({ onMessage, context, apiKey }: UseMultimodalLiveProps = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);

    const sessionRef = useRef<any | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextScheduledTimeRef = useRef<number>(0);

    // Initialize Audio Context on demand
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 24000,
            });
        }
        return audioContextRef.current;
    };

    const playAudio = (pcmData: Int16Array) => {
        const ctx = initAudioContext();
        if (!ctx) return;

        // Convert Int16 to Float32
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            float32Data[i] = pcmData[i] / 32768.0;
        }

        const buffer = ctx.createBuffer(1, float32Data.length, 24000);
        buffer.copyToChannel(float32Data, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;
        // Schedule next clip to play immediately after the previous one
        // If previous ended, start now
        const startTime = Math.max(now, nextScheduledTimeRef.current);
        source.start(startTime);

        nextScheduledTimeRef.current = startTime + buffer.duration;
    };

    const connect = useCallback(async (key: string) => {
        if (sessionRef.current) return;

        try {
            console.log('Connecting to Gemini Live...');
            const client = new GoogleGenAI({ apiKey: key });
            const session = await client.live.connect({
                model: 'gemini-2.0-flash-exp',
                config: {
                    responseModalities: ["AUDIO" as any],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
                    },
                    systemInstruction: {
                        parts: [{ text: context || "You are a helpful programming tutor." }]
                    }
                },
                callbacks: {
                    onopen: () => { },
                    onmessage: () => { },
                    onclose: () => { }
                }
            });

            // NOTE: The SDK might not support 'callbacks' in the connect options directly 
            // if types are strict (as per error), but for the purpose of this implementation
            // we attach listeners to the session object returned.
            // PROPER SDK USAGE:
            // The session object is an event emitter or likely has .on() methods.
            // Based on the error `Property 'callbacks' is missing...`, it seems strict type checking EXPECTS it?
            // Wait, the error said: "Property 'callbacks' is missing... but required in type 'LiveConnectParameters'".
            // THIS MEANS WE DO NEED TO PASS IT.
            // My previous attempt failed due to "content not found" for replacement, not type error.
            // So passing it here is CORRECT.

            sessionRef.current = session;
            setIsConnected(true);

            // We need to re-assign or attach logic if the 'callbacks' param wasn't enough?
            // Actually, if we pass callbacks to connect(), the SDK handles it.
            // Let's retry passing callbacks properly in this overwrite.

            // But wait... I can't modify the session object AFTER creation easily if the SDK uses init-time callbacks.
            // So I must include callbacks in the connect options.

            // EXCEPT: The error in step 2865 was:
            // Property 'callbacks' is missing... but required in type 'LiveConnectParameters'.
            // This confirms I MUST pass it.

        } catch (error) {
            console.error('Connection failed:', error);
            setIsConnected(false);
        }
    }, [context]);

    // RE-DEFINING CONNECT TO ACTUALLY PASS CALLBACKS
    const connectWithCallbacks = useCallback(async (key: string) => {
        if (sessionRef.current) return;
        try {
            console.log('Connecting to Gemini Live...');
            const client = new GoogleGenAI({ apiKey: key });
            const session = await client.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: ["AUDIO" as any],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
                    },
                    systemInstruction: {
                        parts: [{ text: context || "You are a helpful programming tutor." }]
                    }
                },
                callbacks: {
                    onopen: () => {
                        console.log('Gemini Live Connected');
                        setIsConnected(true);
                    },
                    onmessage: (msg: any) => {
                        // Check for audio content
                        if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                            const data = msg.serverContent.modelTurn.parts[0].inlineData.data;
                            const pcm = new Int16Array(
                                Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer
                            );
                            playAudio(pcm);
                            setIsSpeaking(true);
                        }
                        if (msg.serverContent?.turnComplete) {
                            setIsSpeaking(false);
                        }
                    },
                    onclose: () => {
                        console.log('Gemini Live Disconnected');
                        setIsConnected(false);
                        setIsSpeaking(false);
                    },
                    onError: (err: any) => {
                        console.error('Gemini Live Error:', err);
                    }
                } as any // Cast to satisfy potential strict types
            } as any);

            sessionRef.current = session;
            await startMicrophone(session);

        } catch (e) {
            console.error(e);
            setIsConnected(false);
        }
    }, [context]);

    const startMicrophone = async (session: any) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;

            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000,
            });

            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Calculate volume
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                setVolume(Math.sqrt(sum / inputData.length));

                // Create blob and send
                const blob = createBlob(inputData);
                session.sendRealtimeInput({ media: { mimeType: blob.mimeType, data: blob.data } });
            };

            source.connect(processor);
            processor.connect(ctx.destination);
            setIsListening(true);
        } catch (e) {
            console.error("Mic error", e);
        }
    };

    const disconnect = useCallback(() => {
        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (microphoneStreamRef.current) microphoneStreamRef.current.getTracks().forEach(t => t.stop());
        if (sessionRef.current) {
            sessionRef.current = null;
        }
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
    }, []);

    return {
        connect: connectWithCallbacks,
        disconnect,
        isConnected,
        isListening,
        isSpeaking,
        volume
    };
}
