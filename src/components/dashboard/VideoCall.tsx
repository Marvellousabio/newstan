'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
 

interface VideoCallProps {
  currentLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}

export default function VideoCall({}: VideoCallProps) {
  const [joined, setJoined] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const remoteContainerRef = useRef<HTMLDivElement | null>(null);

  const clientRef = useRef<any>(null);
  const localAudioRef = useRef<any>(null);
  const localVideoRef = useRef<any>(null);
  const AgoraRef = useRef<any>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

  useEffect(() => {
    // Defer Agora import to client only
    let mounted = true;
    (async () => {
      if (typeof window === 'undefined') return;
      const mod = await import('agora-rtc-sdk-ng');
      if (!mounted) return;
      AgoraRef.current = mod.default;
      clientRef.current = mod.default.createClient({ mode: 'rtc', codec: 'vp8' });
    })();
    return () => {
      mounted = false;
      leave();
    };
  }, []);

  const join = async () => {
    if (!appId) {
      toast.error('Missing Agora App ID');
      return;
    }
    try {
      const channel = 'maternal-help';
      const token = null; // For testing with app certificate disabled
      const uid = await clientRef.current!.join(appId, channel, token || null, null);
      const [audioTrack, videoTrack] = await AgoraRef.current.createMicrophoneAndCameraTracks();
      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;
      localVideoRef.current.play(localContainerRef.current!);

      clientRef.current!.on('user-published', async (user, mediaType) => {
        await clientRef.current!.subscribe(user, mediaType);
        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack as any;
          remoteVideoTrack.play(remoteContainerRef.current!);
        }
        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack as any;
          remoteAudioTrack.play();
        }
      });

      await clientRef.current!.publish([audioTrack, videoTrack]);
      setJoined(true);
      toast.success('Joined call');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to join call');
    }
  };

  const leave = async () => {
    try {
      if (localAudioRef.current) {
        localAudioRef.current.stop();
        localAudioRef.current.close();
      }
      if (localVideoRef.current) {
        localVideoRef.current.stop();
        localVideoRef.current.close();
      }
      await clientRef.current?.leave();
      setJoined(false);
    } catch {}
  };

  const toggleAudio = async () => {
    if (!localAudioRef.current) return;
    if (mutedAudio) {
      await localAudioRef.current.setEnabled(true);
      setMutedAudio(false);
    } else {
      await localAudioRef.current.setEnabled(false);
      setMutedAudio(true);
    }
  };

  const toggleVideo = async () => {
    if (!localVideoRef.current) return;
    if (mutedVideo) {
      await localVideoRef.current.setEnabled(true);
      setMutedVideo(false);
    } else {
      await localVideoRef.current.setEnabled(false);
      setMutedVideo(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div ref={localContainerRef} className="aspect-video bg-black rounded" />
        <div ref={remoteContainerRef} className="aspect-video bg-black rounded" />
      </div>
      <div className="flex items-center justify-center space-x-2">
        {!joined ? (
          <button onClick={join} className="btn btn-primary">
            <Video className="w-4 h-4 mr-2" /> Join Call
          </button>
        ) : (
          <>
            <button onClick={toggleAudio} className="btn btn-outline">
              {mutedAudio ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />} Audio
            </button>
            <button onClick={toggleVideo} className="btn btn-outline">
              {mutedVideo ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />} Video
            </button>
            <button onClick={leave} className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50">
              <PhoneOff className="w-4 h-4 mr-2" /> Leave
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}





