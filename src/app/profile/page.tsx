'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  Heart,
  Bookmark,
  Sparkles,
  Plus,
  Compass,
  FileText,
  Calendar,
  Grid,
} from 'lucide-react';
import { Memory, Profile } from '@/lib/types';
import { memoryStore, CURRENT_USER } from '@/lib/store';
import MemoryCard from '@/components/memories/memory-card';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(CURRENT_USER);
  const [userMemories, setUserMemories] = useState<Memory[]>([]);
  const [savedMemories, setSavedMemories] = useState<Memory[]>([]);
  const [activeTab, setActiveTab] = useState<'my_memories' | 'saved' | 'drafts'>('my_memories');
  const [stats, setStats] = useState({
    memoriesCount: 0,
    savedCount: 0,
    reactionsReceived: 0,
    distinctMoods: 0,
  });

  useEffect(() => {
    memoryStore.getMemories().then((all) => {
      const my = all.filter((m) => m.user_id === CURRENT_USER.id);
      const saved = all.filter((m) => m.is_saved);
      setUserMemories(my);
      setSavedMemories(saved);

      memoryStore.getUserStats().then((s) => setStats(s));
    });
  }, []);

  const publishedMemories = userMemories.filter((m) => m.visibility === 'public');
  const draftMemories = userMemories.filter((m) => m.visibility === 'draft');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sand-300 shadow-journal space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-terracotta/20 shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                  {profile.display_name}
                </h1>
                <p className="text-xs sm:text-sm text-terracotta font-medium">
                  @{profile.username}
                </p>
              </div>

              <Link
                href="/memories/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Share New Memory</span>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-700 max-w-xl font-serif italic">
              {profile.bio}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-charcoal-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-terracotta" />
                <span>Archivist since January 2024</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sage" />
                <span>Nagpur, Maharashtra</span>
              </span>
            </div>
          </div>
        </div>

        {/* CONTRIBUTION STATISTICS */}
        <div className="pt-6 border-t border-sand-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-sand-50 rounded-2xl p-4 border border-sand-300">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              {stats.memoriesCount}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mt-1">
              Stories Shared
            </div>
          </div>

          <div className="bg-sand-50 rounded-2xl p-4 border border-sand-300">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              {stats.savedCount}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mt-1">
              Saved Bookmarks
            </div>
          </div>

          <div className="bg-sand-50 rounded-2xl p-4 border border-sand-300">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-rose-600">
              {stats.reactionsReceived}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mt-1">
              Warmth & Likes
            </div>
          </div>

          <div className="bg-sand-50 rounded-2xl p-4 border border-sand-300">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-sage">
              {stats.distinctMoods}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 mt-1">
              Moods Explored
            </div>
          </div>
        </div>
      </div>

      {/* MEMORY TABS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-sand-300 pb-1">
          <button
            onClick={() => setActiveTab('my_memories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === 'my_memories'
                ? 'border-b-2 border-terracotta text-terracotta bg-white/60'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>My Published Stories ({publishedMemories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === 'saved'
                ? 'border-b-2 border-terracotta text-terracotta bg-white/60'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Bookmarks ({savedMemories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === 'drafts'
                ? 'border-b-2 border-terracotta text-terracotta bg-white/60'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Drafts ({draftMemories.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'my_memories' && (
          <div>
            {publishedMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedMemories.map((mem) => (
                  <MemoryCard key={mem.id} memory={mem} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-300 space-y-4">
                <MapPin className="w-10 h-10 text-charcoal-300 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  No memories published yet
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
                  Every neighborhood has a secret. Add your first memory and anchor your experiences to the interactive map.
                </p>
                <Link
                  href="/memories/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Your First Memory</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedMemories.map((mem) => (
                  <MemoryCard key={mem.id} memory={mem} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-300 space-y-4">
                <Bookmark className="w-10 h-10 text-charcoal-300 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  No saved bookmarks
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
                  Explore stories from other wanderers on the map and tap the bookmark icon to save them to your personal journal.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sand-200 text-charcoal text-xs font-semibold hover:bg-terracotta hover:text-white transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Stories on Map</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drafts' && (
          <div>
            {draftMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftMemories.map((mem) => (
                  <MemoryCard key={mem.id} memory={mem} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-300 space-y-3">
                <FileText className="w-10 h-10 text-charcoal-300 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  No drafts saved
                </h3>
                <p className="text-xs text-charcoal-600">
                  Any stories you choose to "Save as Draft" will be archived here for you to edit and publish later.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );

}
