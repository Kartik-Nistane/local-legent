'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Heart, Bookmark, Mic, Sparkles, MessageSquare, Compass } from 'lucide-react';
import { Memory } from '@/lib/types';
import { MOOD_CONFIG } from '@/lib/demo-data';
import { memoryStore } from '@/lib/store';

interface MemoryCardProps {
  memory: Memory;
  onSelectOnMap?: (memory: Memory) => void;
  featured?: boolean;
}

export default function MemoryCard({ memory, onSelectOnMap, featured }: MemoryCardProps) {
  const [likesCount, setLikesCount] = useState(memory.reactions_count?.heart || 0);
  const [hasLiked, setHasLiked] = useState(memory.user_reaction === 'heart');
  const [isSaved, setIsSaved] = useState(Boolean(memory.is_saved));

  const moodStyle = MOOD_CONFIG[memory.mood] || MOOD_CONFIG['Nostalgic'];

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = await memoryStore.toggleReaction(memory.id, 'heart');
    if (updated) {
      setLikesCount(updated.reactions_count?.heart || 0);
      setHasLiked(updated.user_reaction === 'heart');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const saved = await memoryStore.toggleSave(memory.id);
    setIsSaved(saved);
  };

  return (
    <article
      className={`group bg-white rounded-journal border border-sand-300 overflow-hidden hover:border-sand-400 hover:shadow-journal-hover transition-all duration-300 flex flex-col ${
        featured ? 'ring-1 ring-terracotta/20 shadow-journal' : 'shadow-journal'
      }`}
    >
      {/* Visual Header / Photo / Postcard */}
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-200">
        <img
          src={memory.illustration_url || memory.media?.[0]?.url || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&auto=format&fit=crop&q=80'}
          alt={memory.ai_title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* AI Postcard badge */}
        {memory.is_postcard_generated && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-charcoal-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>AI Postcard</span>
          </div>
        )}

        {/* Mood Pill */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm flex items-center gap-1.5 ${moodStyle.bg} ${moodStyle.color} border ${moodStyle.border}`}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: moodStyle.markerColor }}
          />
          <span>{memory.mood}</span>
        </div>

        {/* Voice Note Pill */}
        {memory.audio_url && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-charcoal text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
            <Mic className="w-3 h-3 text-terracotta" />
            <span>Voice Story</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Location link */}
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <div className="flex items-center gap-1 truncate font-medium text-terracotta-700">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{memory.place.name}</span>
            </div>
            {onSelectOnMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectOnMap(memory);
                }}
                className="text-[11px] font-semibold text-charcoal-500 hover:text-terracotta transition-colors flex items-center gap-1 shrink-0 ml-2"
                title="Locate on map"
              >
                <Compass className="w-3 h-3" />
                <span>Locate</span>
              </button>
            )}
          </div>

          {/* Title */}
          <Link href={`/memories/${memory.id}`} className="block">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal leading-snug group-hover:text-terracotta transition-colors line-clamp-2">
              {memory.ai_title}
            </h3>
          </Link>

          {/* AI Summary */}
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed line-clamp-3 font-normal">
            {memory.ai_summary}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {memory.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-sand-100 text-[11px] font-medium text-charcoal-600 border border-sand-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer: Author & Social Actions */}
        <div className="pt-3 border-t border-sand-200 flex items-center justify-between gap-3 text-xs">
          
          {/* Author */}
          <div className="flex items-center gap-2 truncate">
            <img
              src={memory.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={memory.user?.display_name || 'Story author'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-sand-300 shrink-0"
            />
            <span className="font-medium text-charcoal truncate">
              {memory.user?.display_name || 'Local Resident'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Comments count */}
            <Link
              href={`/memories/${memory.id}#comments`}
              className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-900 transition-colors"
              title="View comments"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{memory.comments_count || memory.comments?.length || 0}</span>
            </Link>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                hasLiked ? 'text-rose-600 font-semibold' : 'text-charcoal-500 hover:text-rose-600'
              }`}
              aria-label="Like story"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark Save */}
            <button
              type="button"
              onClick={handleSave}
              className={`p-1 rounded-md transition-colors ${
                isSaved ? 'text-terracotta' : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
              aria-label="Save to my journal"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-terracotta' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </article>
  );
}
