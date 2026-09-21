'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Memory } from '@/lib/types';
import { memoryStore } from '@/lib/store';
import InteractiveMap from '@/components/map/interactive-map';
import FilterBar from '@/components/memories/filter-bar';
import MemoryCard from '@/components/memories/memory-card';
import { X, ExternalLink, Sparkles, MapPin, Heart, Mic, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialMood = searchParams.get('mood') || 'All';

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memoryStore.getMemories().then((data) => {
      setMemories(data);
      setLoading(false);
    });
  }, []);

  // Filter memories based on mood and search query
  const filteredMemories = useMemo(() => {
    let list = [...memories];

    if (selectedMood && selectedMood !== 'All') {
      list = list.filter((m) => m.mood.toLowerCase() === selectedMood.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.ai_title.toLowerCase().includes(q) ||
          m.original_text.toLowerCase().includes(q) ||
          m.ai_summary.toLowerCase().includes(q) ||
          m.place.name.toLowerCase().includes(q) ||
          m.place.address.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [memories, selectedMood, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden">
      
      {/* Top Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredMemories.length}
      />

      {/* Main Content Area: Map + Side Drawer or List View */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* LIST VIEW (Visible on mobile toggle or desktop if selected) */}
        <div
          className={`w-full lg:w-96 xl:w-[420px] bg-sand-50/70 border-r border-sand-300 overflow-y-auto p-4 space-y-4 shrink-0 transition-all ${
            viewMode === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'Story' : 'Stories'} Found
            </span>
            {selectedMood !== 'All' && (
              <button
                onClick={() => setSelectedMood('All')}
                className="text-xs text-terracotta hover:underline font-medium"
              >
                Reset filter
              </button>
            )}
          </div>

          {filteredMemories.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-sand-300 space-y-3">
              <MapPin className="w-8 h-8 text-charcoal-400 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-charcoal">No stories matched</h4>
              <p className="text-xs text-charcoal-600">
                Try searching for another neighborhood or clearing your mood filter.
              </p>
              <button
                onClick={() => {
                  setSelectedMood('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-full bg-sand-200 text-charcoal text-xs font-semibold hover:bg-sand-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => {
                  setSelectedMemory(mem);
                  if (window.innerWidth < 1024) {
                    setViewMode('map');
                  }
                }}
                className={`cursor-pointer transition-transform ${
                  selectedMemory?.id === mem.id ? 'ring-2 ring-terracotta rounded-journal' : ''
                }`}
              >
                <MemoryCard memory={mem} />
              </div>
            ))
          )}
        </div>

        {/* MAP VIEW CONTAINER */}
        <div className={`flex-1 h-full relative ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
          <InteractiveMap
            memories={filteredMemories}
            selectedMemory={selectedMemory}
            onSelectMemory={(m) => setSelectedMemory(m)}
            className="w-full h-full rounded-none border-none shadow-none"
          />

          {/* FLOATING RICH PREVIEW CARD ON MAP SELECTION */}
          {selectedMemory && (
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-[400px] z-30 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sand-300 shadow-2xl p-4 sm:p-5 space-y-3 relative">
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-sand-200 text-charcoal hover:bg-sand-300 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs text-terracotta-700 font-semibold pr-8">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedMemory.place.name}</span>
                </div>

                <Link href={`/memories/${selectedMemory.id}`} className="block group">
                  <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-terracotta transition-colors line-clamp-2">
                    {selectedMemory.ai_title}
                  </h3>
                </Link>

                <p className="text-xs text-charcoal-700 line-clamp-2 leading-relaxed">
                  {selectedMemory.ai_summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-sand-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sand-100 border border-sand-300">
                      {selectedMemory.mood}
                    </span>
                    {selectedMemory.audio_url && (
                      <span className="flex items-center gap-1 text-[11px] text-terracotta font-medium">
                        <Mic className="w-3 h-3" /> Voice
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/memories/${selectedMemory.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-terracotta hover:underline text-xs"
                  >
                    <span>Read Full Story</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
