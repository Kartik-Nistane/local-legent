'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  ArrowLeft,
  Languages,
  Loader2,
  Send,
  Calendar,
  MessageSquare,
  Compass,
  Check,
} from 'lucide-react';
import { Memory } from '@/lib/types';
import { memoryStore, CURRENT_USER } from '@/lib/store';
import { MOOD_CONFIG } from '@/lib/demo-data';
import AudioPlayer from '@/components/memories/audio-player';
import MemoryCard from '@/components/memories/memory-card';
import InteractiveMap from '@/components/map/interactive-map';

const TRANSLATION_LANGS = [
  'Spanish',
  'French',
  'Japanese',
  'Italian',
  'Portuguese',
  'German',
];

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [nearbyMemories, setNearbyMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // Reaction & Save state
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Translation state
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    memoryStore.getMemoryById(id).then((data) => {
      if (data) {
        setMemory(data);
        setLikesCount(data.reactions_count?.heart || 0);
        setHasLiked(data.user_reaction === 'heart');
        setIsSaved(Boolean(data.is_saved));

        // Fetch nearby memories
        memoryStore
          .getNearbyMemories(data.place.latitude, data.place.longitude, data.id, 3)
          .then((nearby) => setNearbyMemories(nearby));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-charcoal">Memory Not Found</h2>
        <p className="text-charcoal-600 text-sm">
          This story may have been relocated or removed from the archive.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium hover:bg-terracotta-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Map</span>
        </Link>
      </div>
    );
  }

  const moodStyle = MOOD_CONFIG[memory.mood] || MOOD_CONFIG['Nostalgic'];

  const handleLike = async () => {
    const updated = await memoryStore.toggleReaction(memory.id, 'heart');
    if (updated) {
      setLikesCount(updated.reactions_count?.heart || 0);
      setHasLiked(updated.user_reaction === 'heart');
    }
  };

  const handleSave = async () => {
    const saved = await memoryStore.toggleSave(memory.id);
    setIsSaved(saved);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleTranslate = async (lang: string) => {
    if (targetLang === lang) {
      // Toggle back to original only
      setTargetLang(null);
      setTranslatedText(null);
      return;
    }

    setIsTranslating(true);
    setTargetLang(lang);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: memory.original_text,
          targetLanguage: lang,
        }),
      });

      const data = await res.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
      }
    } catch (e) {
      console.error('Translation error', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const comm = await memoryStore.addComment(memory.id, newComment);
      if (comm) {
        setMemory((prev) =>
          prev
            ? {
                ...prev,
                comments: [comm, ...(prev.comments || [])],
                comments_count: (prev.comments_count || 0) + 1,
              }
            : prev
        );
        setNewComment('');
      }
    } catch (e) {
      console.error('Comment error', e);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Map</span>
        </Link>

        {/* Social actions bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm ${
              hasLiked
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleSave}
            className={`p-2 rounded-full border text-xs transition-all shadow-sm ${
              isSaved
                ? 'bg-terracotta-50 border-terracotta text-terracotta'
                : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-100'
            }`}
            title="Save memory"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-terracotta' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-sand-300 bg-white text-charcoal-700 hover:bg-sand-100 transition-all shadow-sm relative"
            title="Share story"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* HERO POSTCARD / IMAGE */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-sand-200 border border-sand-300 shadow-journal-lg">
        <img
          src={memory.illustration_url || memory.media?.[0]?.url || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1600&auto=format&fit=crop&q=80'}
          alt={memory.ai_title}
          className="w-full h-full object-cover"
        />

        {memory.is_postcard_generated && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Generated Archival Postcard</span>
          </div>
        )}

        <div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5 ${moodStyle.bg} ${moodStyle.color} border ${moodStyle.border}`}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: moodStyle.markerColor }}
          />
          <span>{memory.mood}</span>
        </div>
      </div>

      {/* MAIN STORY CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left / Center Column: Title, Story, Audio, Translation */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-terracotta">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{memory.place.name} — {memory.place.address}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal leading-tight">
              {memory.ai_title}
            </h1>

            {/* Author details and date */}
            <div className="flex items-center gap-3 pt-2 text-xs text-charcoal-500 border-b border-sand-200 pb-4">
              <img
                src={memory.user?.avatar_url || CURRENT_USER.avatar_url}
                alt={memory.user?.display_name || 'Story author'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-sand-300"
              />
              <div>
                <span className="font-bold text-charcoal block">
                  {memory.user?.display_name || 'Local Resident'}
                </span>
                <span className="text-[11px] text-charcoal-500">
                  {new Date(memory.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Voice Memory Player if available */}
          {memory.audio_url && (
            <div className="space-y-2">
              <AudioPlayer audioUrl={memory.audio_url} duration={memory.audio_duration} />
            </div>
          )}

          {/* AI Archival Summary */}
          <div className="bg-sand-100/90 rounded-2xl p-5 border border-sand-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-500">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>AI Archival Synthesis</span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-800 font-serif italic leading-relaxed">
              "{memory.ai_summary}"
            </p>
          </div>

          {/* Original Story Text (Strictly preserved) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
              Original Story
            </h3>
            <div className="prose prose-stone max-w-none text-charcoal-900 leading-relaxed font-sans text-base sm:text-lg whitespace-pre-line bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-journal">
              {memory.original_text}
            </div>
          </div>

          {/* Translation Feature */}
          <div className="space-y-3 bg-sand-50 rounded-2xl p-5 border border-sand-300">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700">
                <Languages className="w-4 h-4 text-sage" />
                <span>Read in Another Language</span>
              </div>
              <span className="text-[11px] text-charcoal-500">
                Original text is always preserved above
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {TRANSLATION_LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleTranslate(lang)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    targetLang === lang
                      ? 'bg-sage text-white border-sage font-medium shadow-sm'
                      : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {isTranslating && (
              <div className="flex items-center gap-2 text-xs text-charcoal-600 py-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sage" />
                <span>Translating story into {targetLang}...</span>
              </div>
            )}

            {translatedText && !isTranslating && (
              <div className="mt-3 p-4 bg-white rounded-xl border border-sand-300 text-sm leading-relaxed text-charcoal-800 animate-in fade-in-50">
                <span className="text-[10px] uppercase font-bold text-sage-700 tracking-wider block mb-1">
                  {targetLang} Translation
                </span>
                <p className="whitespace-pre-line">{translatedText}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {memory.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white border border-sand-300 text-xs font-medium text-charcoal-700 shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* COMMENTS SECTION */}
          <section id="comments" className="space-y-6 pt-6 border-t border-sand-300">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-terracotta" />
                <span>Conversations ({memory.comments?.length || 0})</span>
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share a memory or reflection about this place..."
                className="w-full p-3.5 bg-white border border-sand-300 rounded-2xl text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-terracotta/40 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {isPostingComment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Leave Reflection</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {memory.comments && memory.comments.length > 0 ? (
                memory.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-white rounded-2xl p-4 border border-sand-300 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                          alt={comm.user?.display_name || 'Commenter'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-charcoal">
                          {comm.user?.display_name || 'Fellow Wanderer'}
                        </span>
                      </div>
                      <span className="text-charcoal-400 text-[11px]">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed pl-8">
                      {comm.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-500 italic py-2">
                  No comments yet. Be the first to share your reflection on this memory.
                </p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Embedded Mini-Map & Nearby Stories */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Mini-Map */}
          <div className="bg-white rounded-3xl p-5 border border-sand-300 shadow-journal space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-terracotta" />
                <span>Location Anchor</span>
              </span>
              <span className="text-[11px] text-charcoal-500 font-mono">
                {memory.place.latitude.toFixed(3)}, {memory.place.longitude.toFixed(3)}
              </span>
            </div>

            <div className="h-60 rounded-2xl overflow-hidden border border-sand-300">
              <InteractiveMap
                memories={[memory]}
                selectedMemory={memory}
                onSelectMemory={() => {}}
                initialCenter={[memory.place.longitude, memory.place.latitude]}
                initialZoom={14}
                className="w-full h-full min-h-0 rounded-2xl"
              />
            </div>

            <div className="pt-1">
              <Link
                href="/explore"
                className="block text-center text-xs font-semibold text-terracotta hover:underline py-1"
              >
                View in Full World Map →
              </Link>
            </div>
          </div>

          {/* Related Nearby Memories */}
          {nearbyMemories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                More Stories Nearby
              </h3>
              <div className="space-y-4">
                {nearbyMemories.map((near) => (
                  <MemoryCard key={near.id} memory={near} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
