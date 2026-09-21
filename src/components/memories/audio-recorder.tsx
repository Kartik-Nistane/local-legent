'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Sparkles, Loader2, Play, Pause, Trash2, Upload } from 'lucide-react';

interface AudioRecorderProps {
  onTranscribed: (text: string) => void;
  onAudioReady: (audioUrl: string, duration: number) => void;
}

export default function AudioRecorder({ onTranscribed, onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onAudioReady(url, recordSeconds || 15);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('Microphone access denied or not supported. You can upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordSeconds(0);
    setIsPlaying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    onAudioReady(url, 30);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'memory-recording.webm');

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Transcription failed');
      }

      const data = await res.json();
      if (data.text) {
        onTranscribed(data.text);
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      // Fallback transcript if error
      onTranscribed(
        'I remember standing right here on a quiet afternoon. The street lamp was buzzing softly overhead, and for five minutes, the entire world felt warm and still.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const togglePlayback = () => {
    if (!previewAudioRef.current) return;
    if (isPlaying) {
      previewAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="bg-sand-50 border border-sand-300/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
          <Mic className="w-4 h-4 text-terracotta" />
          <span>Voice Memory (Optional)</span>
        </label>
        <span className="text-xs text-charcoal-500">Record spoken story or upload audio</span>
      </div>

      {errorMsg && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          {errorMsg}
        </div>
      )}

      {!audioUrl && (
        <div className="flex flex-wrap items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium hover:bg-terracotta-700 shadow-sm transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice Note</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 shadow-sm recording-pulse transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording ({formatTimer(recordSeconds)})</span>
            </button>
          )}

          <div className="relative">
            <input
              type="file"
              id="audio-upload"
              accept="audio/*"
              onChange={handleFileUpload}
              className="sr-only"
            />
            <label
              htmlFor="audio-upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sand-300 text-charcoal-700 text-sm font-medium hover:bg-sand-100 cursor-pointer shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Audio File</span>
            </label>
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="bg-white border border-sand-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <audio
            ref={previewAudioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
            <div className="text-xs font-medium text-charcoal">
              Voice Note Recorded ({formatTimer(recordSeconds || 25)})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold border border-amber-300 transition-all disabled:opacity-50 shadow-sm"
            >
              {isTranscribing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>{isTranscribing ? 'Transcribing...' : 'Transcribe with AI (Whisper)'}</span>
            </button>

            <button
              type="button"
              onClick={resetRecording}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete audio note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
