'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Plus, Menu, X, Bookmark, User, Sparkles } from 'lucide-react';
import { CURRENT_USER } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-parchment-50/90 backdrop-blur-md border-b border-sand-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-md shadow-terracotta/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal group-hover:text-terracotta transition-colors">
                Local Legend
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-widest text-charcoal-500">
                Neighborhood Memory Map
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${
                isActive('/explore')
                  ? 'text-terracotta font-semibold'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-terracotta-500" />
              Explore Map
            </Link>

            <Link
              href="/#featured"
              className={`text-sm font-medium tracking-wide transition-colors ${
                isActive('/#featured')
                  ? 'text-terracotta font-semibold'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              Featured Stories
            </Link>

            <Link
              href="/profile"
              className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${
                isActive('/profile')
                  ? 'text-terracotta font-semibold'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              <Bookmark className="w-4 h-4 text-sage-600" />
              My Journal
            </Link>
          </nav>

          {/* Actions: Add Memory CTA & Profile */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/memories/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium shadow-md shadow-terracotta/25 hover:bg-terracotta-700 hover:shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Share a Memory</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-sand-300 bg-white hover:border-sand-400 hover:shadow-sm transition-all"
              title="View profile"
            >
              <img
                src={CURRENT_USER.avatar_url}
                alt={CURRENT_USER.display_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-sand-300"
              />
              <span className="text-xs font-semibold text-charcoal max-w-[100px] truncate">
                {CURRENT_USER.display_name}
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/memories/new"
              className="p-2 rounded-full bg-terracotta text-white shadow-sm"
              title="Share Memory"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-700 hover:bg-sand-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-parchment-50 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-charcoal hover:bg-sand-200"
          >
            <MapPin className="w-5 h-5 text-terracotta" />
            Explore the Map
          </Link>
          <Link
            href="/memories/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-terracotta bg-terracotta-50 hover:bg-terracotta-100"
          >
            <Sparkles className="w-5 h-5 text-terracotta" />
            Share a Memory (with AI)
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-charcoal hover:bg-sand-200"
          >
            <User className="w-5 h-5 text-sage" />
            My Journal & Bookmarks
          </Link>
        </div>
      )}
    </header>
  );
}
