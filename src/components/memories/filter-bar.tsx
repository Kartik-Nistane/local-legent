'use client';

import React from 'react';
import { Search, Map as MapIcon, List, Compass, Sparkles } from 'lucide-react';
import { MoodType } from '@/lib/types';
import { MOOD_CONFIG } from '@/lib/demo-data';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  viewMode?: 'map' | 'list';
  onViewModeChange?: (mode: 'map' | 'list') => void;
  totalCount?: number;
}

const ALL_MOODS: Array<{ id: string; label: string }> = [
  { id: 'All', label: 'All Memories' },
  { id: 'Nostalgic', label: 'Nostalgic' },
  { id: 'Food', label: 'Food' },
  { id: 'Hidden Gem', label: 'Hidden Gem' },
  { id: 'Student Life', label: 'Student Life' },
  { id: 'History', label: 'History' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Nature', label: 'Nature' },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedMood,
  onMoodChange,
  viewMode,
  onViewModeChange,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-sand-300 py-3 px-4 sm:px-6 shadow-sm sticky top-16 sm:top-20 z-30 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories, cafes, tags..."
            className="w-full pl-9 pr-4 py-2 bg-sand-50 border border-sand-300 rounded-full text-xs sm:text-sm text-charcoal placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-400 hover:text-charcoal-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mood filter pills */}
        <div className="w-full md:flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {ALL_MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            const moodStyle = m.id !== 'All' ? MOOD_CONFIG[m.id] : null;

            return (
              <button
                key={m.id}
                onClick={() => onMoodChange(m.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-terracotta text-white shadow-sm ring-2 ring-terracotta/20'
                    : 'bg-sand-100/90 text-charcoal-700 hover:bg-sand-200 border border-sand-300/80'
                }`}
              >
                {moodStyle && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : moodStyle.markerColor }}
                  />
                )}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle (Map vs List) & Count */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 shrink-0">
          {typeof totalCount === 'number' && (
            <span className="text-xs font-medium text-charcoal-500">
              {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
            </span>
          )}

          {onViewModeChange && viewMode && (
            <div className="flex items-center p-0.5 bg-sand-200 rounded-full border border-sand-300">
              <button
                onClick={() => onViewModeChange('map')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-terracotta shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-terracotta shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
