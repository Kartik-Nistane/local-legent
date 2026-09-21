'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, MapPin, Sparkles, Plus, ArrowRight, BookOpen, Mic, Heart } from 'lucide-react';
import { Memory } from '@/lib/types';
import { memoryStore } from '@/lib/store';
import MemoryCard from '@/components/memories/memory-card';
import InteractiveMap from '@/components/map/interactive-map';

export default function LandingPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    memoryStore.getMemories().then((data) => {
      setMemories(data);
      if (data.length > 0) {
        setSelectedMemory(data[0]);
      }
    });
  }, []);

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Editorial Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand-200/80 border border-sand-300 text-xs font-semibold text-charcoal tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          <span>An AI-Powered Neighborhood Memory Map</span>
        </div>

        {/* Hero Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal leading-[1.1]">
            Every place has a <span className="text-terracotta italic font-normal">story</span>.
          </h1>
          <p className="text-base sm:text-xl text-charcoal-700 max-w-2xl mx-auto font-serif italic leading-relaxed">
            Attach personal memories, vintage photographs, and voice notes to real coordinates.
            Discover cities through genuine human moments, not ratings or tourist checklists.
          </p>
        </div>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/explore"
            className="px-7 py-3.5 rounded-full bg-terracotta text-white font-medium text-sm sm:text-base shadow-lg shadow-terracotta/25 hover:bg-terracotta-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2.5 active:scale-95"
          >
            <Compass className="w-5 h-5" />
            <span>Explore the Map</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/memories/new"
            className="px-7 py-3.5 rounded-full bg-white text-charcoal font-medium text-sm sm:text-base border border-sand-300 shadow-sm hover:border-terracotta hover:text-terracotta hover:bg-sand-50 transition-all flex items-center gap-2.5 active:scale-95"
          >
            <Plus className="w-5 h-5 text-terracotta stroke-[2.5]" />
            <span>Share a Memory</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-charcoal-600 font-medium">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-terracotta" />
            <span>Voice Memories & Whisper Transcription</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sage" />
            <span>Oral History & Emotional Archiving</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Enhancement & Illustrated Postcards</span>
          </div>
        </div>

      </section>

      {/* 2. INTERACTIVE MAP PREVIEW SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sand-100 rounded-3xl p-4 sm:p-6 border border-sand-300 shadow-journal-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                Living Memories Across the Globe
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                Click any pin to inspect the neighborhood story or wander the globe.
              </p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold text-terracotta hover:text-terracotta-800 flex items-center gap-1.5 shrink-0"
            >
              <span>Open Fullscreen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[440px] sm:h-[520px] rounded-2xl overflow-hidden">
            <InteractiveMap
              memories={memories}
              selectedMemory={selectedMemory}
              onSelectMemory={(m) => setSelectedMemory(m)}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED MEMORIES SECTION */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-terracotta">
            Community Archive
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Featured Neighborhood Memories
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-serif italic">
            Quiet corners, late-night coffees, and the indelible marks left behind by travelers and locals alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.slice(0, 6).map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onSelectOnMap={(m) => {
                setSelectedMemory(m);
                window.scrollTo({ top: 500, behavior: 'smooth' });
              }}
            />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sand-200 text-charcoal hover:bg-terracotta hover:text-white font-medium text-sm transition-all shadow-sm"
          >
            <span>Browse all stories in the map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. THE LOCAL LEGEND PHILOSOPHY / HOW IT WORKS */}
      <section className="bg-sand-100/70 border-y border-sand-300 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              A Digital Travel Journal, Not a Review Directory
            </h2>
            <p className="text-sm text-charcoal-600">
              How Local Legend captures the soul of neighborhoods with AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif text-xl font-bold">
                1
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal">
                Pin Your Memory
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Choose a place on the map — a park bench, corner cafe, or rain-swept bridge. Write your story or speak directly into your microphone.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-800 flex items-center justify-center font-serif text-xl font-bold">
                2
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal">
                AI Literary Enhancement
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Our AI archivist distills an evocative title, a respectful 2-3 sentence summary, moods, and tags while strictly preserving your authentic words.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif text-xl font-bold">
                3
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal">
                Postcards & Multilingual Voices
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Generate collectible vintage postcard illustrations with DALL-E and share multilingual translations so anyone can read your story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-terracotta to-terracotta-700 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Have a place that holds your heart?
          </h2>
          <p className="text-sand-100 text-sm sm:text-base max-w-xl mx-auto font-serif italic">
            Don't let the memories fade into old message threads. Drop a pin and anchor your experience to the map for future wanderers to find.
          </p>
          <div className="pt-2">
            <Link
              href="/memories/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-terracotta font-semibold text-sm hover:bg-sand-100 hover:shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Share Your First Memory</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
