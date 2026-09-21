'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Send,
  Eye,
  FileEdit,
  Palette,
  ArrowLeft,
  AlertCircle,
  Upload,
  Trash2,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { MoodType, AIEnhanceResponse } from '@/lib/types';
import { memoryStore } from '@/lib/store';
import MapPinPicker from '@/components/map/map-pin-picker';
import AudioRecorder from '@/components/memories/audio-recorder';

const SAMPLE_PHOTOS = [
  { label: 'Lake Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Historic Street', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Old Books', url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80' },
];

const MOODS: MoodType[] = [
  'Nostalgic',
  'Food',
  'Hidden Gem',
  'Student Life',
  'History',
  'Romance',
  'Nature',
];

export default function AddMemoryPage() {
  const router = useRouter();

  // Location state
  const [place, setPlace] = useState({
    name: 'Caffe Reggio, New York',
    address: '119 MacDougal St, New York, NY 10012',
    latitude: 40.7301,
    longitude: -73.9996,
  });

  // Story & Media state
  const [storyText, setStoryText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const [visibility, setVisibility] = useState<'public' | 'draft'>('public');

  // AI Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiResult, setAiResult] = useState<AIEnhanceResponse | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [editedMood, setEditedMood] = useState<MoodType>('Nostalgic');
  const [tagsInput, setTagsInput] = useState('');

  // Postcard state
  const [isGeneratingPostcard, setIsGeneratingPostcard] = useState(false);
  const [isPostcardGenerated, setIsPostcardGenerated] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger AI enhancement
  const handleEnhanceWithAI = async () => {
    if (!storyText || storyText.trim().length < 15) {
      setErrorMsg('Please write at least a sentence or two of your memory before enhancing with AI.');
      return;
    }

    setErrorMsg(null);
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: storyText,
          placeName: place.name,
        }),
      });

      const data: AIEnhanceResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error || 'Failed to enhance story');
      }

      setAiResult(data);
      setEditedTitle(data.title);
      setEditedSummary(data.summary);
      setEditedMood(data.mood);
      setTagsInput(data.tags.join(', '));
    } catch (err: any) {
      console.error('Enhance error:', err);
      setErrorMsg(err.message || 'Could not enhance memory. You can still set your title and tags manually.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Postcard illustration
  const handleGeneratePostcard = async () => {
    setIsGeneratingPostcard(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/postcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: editedTitle || place.name,
          placeName: place.name,
          storySummary: editedSummary || storyText.slice(0, 100),
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setPhotoUrl(data.imageUrl);
        setIsPostcardGenerated(true);
      }
    } catch (err: any) {
      console.error('Postcard generation error:', err);
      setErrorMsg('Failed to generate postcard illustration.');
    } finally {
      setIsGeneratingPostcard(false);
    }
  };

  // Submit and create memory
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyText.trim()) {
      setErrorMsg('Please enter your story text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const tagsArray = tagsInput
        ? tagsInput.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
        : ['Neighborhood'];

      const created = await memoryStore.createMemory({
        place,
        original_text: storyText,
        ai_title: editedTitle || `Memories at ${place.name}`,
        ai_summary: editedSummary || storyText.slice(0, 150) + '...',
        tags: tagsArray,
        mood: editedMood,
        visibility,
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1200&auto=format&fit=crop&q=80',
        audio_url: audioUrl,
        audio_duration: audioDuration,
        is_postcard_generated: isPostcardGenerated,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C2410C', '#0F766E', '#F59E0B'],
        });
      } catch {}

      router.push(`/memories/${created.id}`);
    } catch (err: any) {
      console.error('Save memory error:', err);
      setErrorMsg('Failed to save memory. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Map</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
          Share a Neighborhood Memory
        </h1>
        <p className="text-sm text-charcoal-600 font-serif italic">
          Drop a pin on the map, recount what happened, and let our AI archivist craft a title and collectible postcard.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* STEP 1: PLACE SELECTOR */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-journal space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Where did this memory happen?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Place or Spot Name
              </label>
              <input
                type="text"
                value={place.name}
                onChange={(e) => setPlace({ ...place, name: e.target.value })}
                placeholder="e.g. Caffe Reggio, MacDougal Street"
                required
                className="w-full px-4 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-sm text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Neighborhood / Address
              </label>
              <input
                type="text"
                value={place.address}
                onChange={(e) => setPlace({ ...place, address: e.target.value })}
                placeholder="e.g. Greenwich Village, New York, NY"
                required
                className="w-full px-4 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-sm text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta focus:outline-none"
              />
            </div>
          </div>

          {/* Interactive Map Pin Dropper */}
          <MapPinPicker
            initialLat={place.latitude}
            initialLng={place.longitude}
            onLocationSelected={(loc) => {
              setPlace({
                name: loc.name || place.name,
                address: loc.address || place.address,
                latitude: loc.latitude,
                longitude: loc.longitude,
              });
            }}
          />
        </section>

        {/* STEP 2: RAW STORY & VOICE NOTE */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-journal space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Tell Your Story
            </h2>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              Your Memory (Original Voice)
            </label>
            <p className="text-xs text-charcoal-500 font-serif italic">
              Write naturally. Mention sensory details — the smells, sounds, light, or who you were with.
            </p>
            <textarea
              rows={6}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="It was a chilly October night when we first stumbled into this alleyway..."
              required
              className="w-full p-4 bg-sand-50 border border-sand-300 rounded-2xl text-sm text-charcoal leading-relaxed focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta focus:outline-none"
            />
          </div>

          {/* Voice Memory Recorder */}
          <AudioRecorder
            onTranscribed={(transcript) => {
              setStoryText((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
            }}
            onAudioReady={(url, dur) => {
              setAudioUrl(url);
              setAudioDuration(dur);
            }}
          />

          {/* Enhance with AI Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancing || !storyText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-terracotta text-white font-medium text-sm shadow-md shadow-terracotta/20 hover:bg-terracotta-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isEnhancing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isEnhancing ? 'Analyzing with AI...' : 'Enhance with AI (Title, Summary & Mood)'}</span>
            </button>
          </div>
        </section>

        {/* STEP 3: AI PREVIEW & METADATA (Appears after enhance or editable anytime) */}
        {(aiResult || storyText.length > 30) && (
          <section className="bg-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-journal space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-sage text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h2 className="font-serif text-xl font-bold text-charcoal">
                  AI Editorial Preview
                </h2>
              </div>
              {aiResult && (
                <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Structured Analysis Ready
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                  Title (Evocative & Concise)
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="e.g. The Chrome Espresso Machine of Greenwich Village"
                  className="w-full px-4 py-2.5 bg-white border border-sand-300 rounded-xl text-sm font-serif font-bold text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:outline-none"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                  AI Archival Summary (2–3 Sentences)
                </label>
                <textarea
                  rows={3}
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  placeholder="Summary honoring original experience..."
                  className="w-full p-3 bg-white border border-sand-300 rounded-xl text-xs sm:text-sm text-charcoal leading-relaxed focus:ring-2 focus:ring-terracotta/40 focus:outline-none"
                />
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                  Detected Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditedMood(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        editedMood === m
                          ? 'bg-terracotta text-white shadow-sm ring-2 ring-terracotta/25'
                          : 'bg-white text-charcoal-700 border border-sand-300 hover:bg-sand-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Village Life, Espresso, Winter"
                  className="w-full px-4 py-2 bg-white border border-sand-300 rounded-xl text-xs text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: PHOTO OR AI POSTCARD ILLUSTRATION */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-journal space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h2 className="font-serif text-xl font-bold text-charcoal">
                Visual Postcard
              </h2>
            </div>
            {isPostcardGenerated && (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Labeled: AI-Generated Postcard
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Preview Box */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-sand-100 border border-sand-300 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Postcard preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2 text-charcoal-400">
                  <ImageIcon className="w-10 h-10 mx-auto stroke-1" />
                  <p className="text-xs font-medium">No photo or illustration selected yet</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* DALL-E generate button */}
              <button
                type="button"
                onClick={handleGeneratePostcard}
                disabled={isGeneratingPostcard || !storyText}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-sm"
              >
                {isGeneratingPostcard ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Palette className="w-4 h-4 text-amber-700" />
                )}
                <span>
                  {isGeneratingPostcard
                    ? 'Crafting Postcard Illustration...'
                    : 'Generate Postcard Illustration (DALL-E)'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-sand-300"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-semibold text-charcoal-400">
                  Or upload a photo
                </span>
                <div className="flex-grow border-t border-sand-300"></div>
              </div>

              {/* File upload button + clear */}
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta/10 border border-terracotta/30 text-terracotta hover:bg-terracotta/20 font-semibold text-xs transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setPhotoUrl(objectUrl);
                        setIsPostcardGenerated(false);
                      }
                    }}
                  />
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setIsPostcardGenerated(false);
                    }}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 border border-red-200 transition-all"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sample photo quick-picks */}
              <div>
                <p className="text-[10px] uppercase font-semibold text-charcoal-400 mb-2 flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Quick picks
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_PHOTOS.map((photo) => (
                    <button
                      key={photo.url}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(photo.url);
                        setIsPostcardGenerated(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        photoUrl === photo.url
                          ? 'border-terracotta ring-2 ring-terracotta/30'
                          : 'border-sand-300 hover:border-terracotta/50'
                      }`}
                      title={photo.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-sand-300"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-semibold text-charcoal-400">
                  Or paste URL
                </span>
                <div className="flex-grow border-t border-sand-300"></div>
              </div>

              {/* URL input */}
              <div>
                <input
                  type="url"
                  value={photoUrl.startsWith('blob:') ? '' : photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setIsPostcardGenerated(false);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STEP 5: VISIBILITY & SUBMISSION */}
        <section className="bg-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Ready to Anchor Your Story?
            </h3>
            <p className="text-xs text-charcoal-600">
              Published memories are publicly visible to neighborhood explorers on the map.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-charcoal cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="text-terracotta focus:ring-terracotta"
                />
                <span>Public Archive</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-charcoal cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="draft"
                  checked={visibility === 'draft'}
                  onChange={() => setVisibility('draft')}
                  className="text-terracotta focus:ring-terracotta"
                />
                <span>Save as Draft</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting || !storyText.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-terracotta text-white font-semibold text-sm shadow-md shadow-terracotta/25 hover:bg-terracotta-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Map'}</span>
            </button>
          </div>
        </section>

      </form>
    </div>
  );
}
