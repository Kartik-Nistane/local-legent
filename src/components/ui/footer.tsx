import React from 'react';
import Link from 'next/link';
import { Compass, Heart, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-sand-100 border-t border-sand-300 text-charcoal-700 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Manifesto & Branding */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">
                Local Legend
              </span>
            </div>
            <p className="text-sm text-charcoal-700 leading-relaxed font-serif italic max-w-sm">
              “Every place has a story. We believe the true pulse of a city is measured not in star ratings or tourist rankings, but in the quiet, human memories left behind on its street corners.”
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-charcoal-500">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>AI-assisted preservation & oral history archive</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-charcoal-900">
              Explore the Archive
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-terracotta transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                  Interactive World Map
                </Link>
              </li>
              <li>
                <Link href="/memories/new" className="hover:text-terracotta transition-colors">
                  Share Your Story
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-terracotta transition-colors">
                  Personal Journal
                </Link>
              </li>
              <li>
                <Link href="/explore?mood=Hidden%20Gem" className="hover:text-terracotta transition-colors">
                  Hidden Gems
                </Link>
              </li>
            </ul>
          </div>

          {/* Mood Archetypes */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-charcoal-900">
              Story Moods
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Nostalgic', 'Food', 'Hidden Gem', 'Student Life', 'History', 'Romance', 'Nature'].map((mood) => (
                <Link
                  key={mood}
                  href={`/explore?mood=${encodeURIComponent(mood)}`}
                  className="px-2.5 py-1 text-xs rounded-full bg-white border border-sand-300 hover:border-terracotta hover:text-terracotta transition-all"
                >
                  {mood}
                </Link>
              ))}
            </div>
            <p className="text-xs text-charcoal-500 pt-2">
              Built with Next.js 14, Supabase, Mapbox GL JS, and OpenAI.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} Local Legend. Celebrating the living memory of streets and neighborhoods.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for explorers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
