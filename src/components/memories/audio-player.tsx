'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  label?: string;
}

export default function AudioPlayer({ audioUrl, duration = 45, label }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback prevented or failed:', e);
        // Toggle simulated play if actual audio stream blocked
        setIsPlaying(true);
      });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-sand-100/80 border border-sand-300 rounded-2xl p-4 shadow-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700">
          <Mic className="w-3.5 h-3.5 text-terracotta" />
          <span>{label || 'Recorded Voice Memory'}</span>
        </div>
        <div className="text-xs font-mono text-charcoal-500">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-700 transition-transform active:scale-95 shadow-sm shrink-0"
          aria-label={isPlaying ? 'Pause voice memory' : 'Play voice memory'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* Audio scrub bar with waveform bars */}
        <div className="flex-1 relative flex items-center">
          <div className="w-full h-8 flex items-center gap-[3px] px-1">
            {[40, 60, 30, 80, 95, 50, 70, 45, 90, 65, 30, 85, 75, 55, 90, 40, 70, 100, 60, 45, 80, 50, 35, 65, 45].map(
              (height, i) => {
                const barPercent = (i / 25) * 100;
                const isPassed = barPercent <= progressPercent;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors duration-150 ${
                      isPassed ? 'bg-terracotta' : 'bg-sand-300'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              }
            )}
          </div>
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Audio seeker"
          />
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="p-2 text-charcoal-500 hover:text-charcoal-900 transition-colors shrink-0"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
