'use client';

import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Memory } from '@/lib/types';
import { MOOD_CONFIG } from '@/lib/demo-data';
import { ZoomIn, ZoomOut, Compass, MapPin, Sparkles, KeyRound } from 'lucide-react';

interface InteractiveMapProps {
  memories: Memory[];
  selectedMemory: Memory | null;
  onSelectMemory: (memory: Memory | null) => void;
  className?: string;
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
}

// Controller component to smoothly center/fly when memory changes
function MapCameraController({
  selectedMemory,
  memories,
}: {
  selectedMemory: Memory | null;
  memories: Memory[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedMemory) {
      const { latitude, longitude } = selectedMemory.place;
      map.panTo({ lat: latitude, lng: longitude });
      map.setZoom(Math.max(map.getZoom() || 12, 14));
    } else if (memories.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      memories.forEach((m) => {
        bounds.extend({ lat: m.place.latitude, lng: m.place.longitude });
      });
      map.fitBounds(bounds, 70);
    }
  }, [map, selectedMemory, memories]);

  return null;
}

export default function InteractiveMap({
  memories,
  selectedMemory,
  onSelectMemory,
  className = 'w-full h-full min-h-[500px]',
  initialCenter = [79.0494, 21.1539], // Default: Nagpur [lng, lat]
  initialZoom = 4,
}: InteractiveMapProps) {
  const [hoveredMemory, setHoveredMemory] = useState<Memory | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey && !apiKey.includes('your_google_maps'));

  const centerCoords = Array.isArray(initialCenter)
    ? { lat: initialCenter[1], lng: initialCenter[0] }
    : { lat: 21.1539, lng: 79.0494 }; // Nagpur

  // Fallback banner if API key is not yet configured
  if (!hasApiKey) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-sand-300 bg-sand-100 flex flex-col items-center justify-center p-8 text-center shadow-journal ${className}`}>
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-sm">
          <KeyRound className="w-7 h-7 text-terracotta" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
          Google Maps API Key Required
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mb-6 leading-relaxed">
          Google Maps Platform requires an API Key. You can get a free instant prototyping key from the Maps Demo Key portal without setting up billing.
        </p>

        <div className="bg-white rounded-2xl p-4 border border-sand-300 max-w-lg w-full text-left space-y-3 text-xs mb-6">
          <div className="font-semibold text-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span>How to enable Google Maps:</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1.5 text-charcoal-700">
            <li>
              Mint a free key at{' '}
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                target="_blank"
                rel="noreferrer"
                className="text-terracotta font-semibold underline"
              >
                Google Maps Demo Key
              </a>{' '}
              or Google Cloud Console.
            </li>
            <li>
              Add it to your <code className="bg-sand-100 px-1.5 py-0.5 rounded font-mono text-terracotta">.env.local</code> file:
              <pre className="mt-1 p-2 bg-sand-50 rounded text-[11px] font-mono border border-sand-200 overflow-x-auto">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
              </pre>
            </li>
            <li>Restart your dev server (<code className="bg-sand-100 px-1 py-0.5 rounded">npm run dev</code>).</li>
          </ol>
        </div>

        {/* Render interactive mock pin grid for instant testing */}
        <div className="w-full max-w-lg border-t border-sand-200 pt-4">
          <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider block mb-2">
            Mapped Stories ({memories.length}):
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {memories.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMemory(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedMemory?.id === m.id
                    ? 'bg-terracotta text-white border-terracotta shadow-sm'
                    : 'bg-white text-charcoal-700 border-sand-300 hover:bg-sand-50'
                }`}
              >
                📍 {m.place.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-sand-300 shadow-journal ${className}`}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={centerCoords}
          defaultZoom={initialZoom}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full min-h-[500px]"
          style={{ width: '100%', height: '100%' }}
        >
          <MapCameraController selectedMemory={selectedMemory} memories={memories} />

          {/* Advanced Markers for each memory pin */}
          {memories.map((memory) => {
            const moodConfig = MOOD_CONFIG[memory.mood] || MOOD_CONFIG['Nostalgic'];
            const isSelected = selectedMemory?.id === memory.id;

            return (
              <AdvancedMarker
                key={memory.id}
                position={{ lat: memory.place.latitude, lng: memory.place.longitude }}
                onClick={() => onSelectMemory(memory)}
                title={memory.ai_title}
              >
                <div
                  className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer shadow-lg transition-transform duration-200 ${
                    isSelected
                      ? 'scale-125 ring-4 ring-terracotta/40'
                      : 'scale-100 hover:scale-115'
                  }`}
                  style={{
                    backgroundColor: moodConfig.markerColor,
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={() => setHoveredMemory(memory)}
                  onMouseLeave={() => setHoveredMemory(null)}
                >
                  <MapPin className="w-4 h-4 fill-white stroke-white" />
                  {memory.audio_url && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-terracotta animate-ping" />
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Hover Tooltip / Info Window */}
          {hoveredMemory && !selectedMemory && (
            <InfoWindow
              position={{
                lat: hoveredMemory.place.latitude,
                lng: hoveredMemory.place.longitude,
              }}
              onCloseClick={() => setHoveredMemory(null)}
            >
              <div className="p-1 max-w-[200px]">
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-wider">
                  {hoveredMemory.mood}
                </div>
                <div className="font-serif font-bold text-xs text-charcoal line-clamp-1">
                  {hoveredMemory.place.name}
                </div>
                <div className="text-[11px] text-charcoal-600 line-clamp-2 mt-0.5">
                  {hoveredMemory.ai_title}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Status Pill */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sand-300 shadow-sm flex items-center gap-2 text-xs font-semibold text-charcoal pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{memories.length} Google Maps Stories</span>
        </div>
      </div>
    </div>
  );
}
