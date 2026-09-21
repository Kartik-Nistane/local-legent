'use client';

import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Sparkles, KeyRound } from 'lucide-react';

interface MapPinPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (loc: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const PRESET_PLACES = [
  { name: 'Futala Lake, Nagpur', lat: 21.1539, lng: 79.0494, address: 'Futala Lake Promenade, Nagpur, Maharashtra' },
  { name: 'Greenwich Village, New York', lat: 40.7301, lng: -73.9996, address: 'Washington Square Park area, NY' },
  { name: 'Montmartre, Paris', lat: 48.8867, lng: 2.3431, address: 'Rue de l’Abreuvoir, 75018 Paris' },
  { name: 'Gion District, Kyoto', lat: 35.0037, lng: 135.7772, address: 'Higashiyama Ward, Kyoto' },
  { name: 'Alfama, Lisbon', lat: 38.7118, lng: -9.1306, address: 'Largo Santa Luzia, Lisboa' },
];

function PinController({
  coords,
}: {
  coords: { lat: number; lng: number };
}) {
  const map = useMap();

  React.useEffect(() => {
    if (map) {
      map.panTo(coords);
    }
  }, [map, coords]);

  return null;
}

export default function MapPinPicker({
  initialLat = 21.1539,
  initialLng = 79.0494,
  onLocationSelected,
}: MapPinPickerProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey && !apiKey.includes('your_google_maps'));

  const handleSelectPreset = (preset: typeof PRESET_PLACES[0]) => {
    const newCoords = { lat: preset.lat, lng: preset.lng };
    setCoords(newCoords);
    onLocationSelected({
      name: preset.name,
      address: preset.address,
      latitude: preset.lat,
      longitude: preset.lng,
    });
  };

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newCoords = { lat: latitude, lng: longitude };
          setCoords(newCoords);
          onLocationSelected({
            name: 'My Current Location',
            address: `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
            latitude,
            longitude,
          });
        },
        (err) => console.warn('Geolocation denied', err)
      );
    }
  };

  const getLatLngNum = (val: any): number => {
    if (typeof val === 'function') return val();
    if (typeof val === 'number') return val;
    return Number(val) || 0;
  };

  const handleMapClick = (e: any) => {
    const latLng = e.detail?.latLng || e.latLng;
    if (latLng) {
      const lat = getLatLngNum(latLng.lat);
      const lng = getLatLngNum(latLng.lng);
      setCoords({ lat, lng });
      onLocationSelected({
        name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        address: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick location presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-charcoal-500">Popular neighborhoods:</span>
        {PRESET_PLACES.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className="px-2.5 py-1 text-xs rounded-full bg-sand-100 hover:bg-terracotta hover:text-white border border-sand-300 transition-colors"
          >
            {p.name.split(',')[0]}
          </button>
        ))}
        <button
          type="button"
          onClick={handleGeolocate}
          className="px-2.5 py-1 text-xs rounded-full bg-white hover:bg-sand-100 border border-sand-300 text-charcoal flex items-center gap-1 transition-colors ml-auto"
        >
          <Navigation className="w-3 h-3 text-terracotta" />
          <span>My Location</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-sand-300 shadow-sm bg-sand-100">
        {hasApiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={coords}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_git_agentskills_v1']}
              onClick={handleMapClick}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              <PinController coords={coords} />
              <AdvancedMarker
                position={coords}
                draggable
                onDragEnd={(e: any) => {
                  if (e.latLng) {
                    const lat = getLatLngNum(e.latLng.lat);
                    const lng = getLatLngNum(e.latLng.lng);
                    setCoords({ lat, lng });
                    onLocationSelected({
                      name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                      address: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
                      latitude: lat,
                      longitude: lng,
                    });
                  }
                }}
              >
                <div className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center shadow-xl ring-4 ring-terracotta/30 cursor-grab">
                  <MapPin className="w-5 h-5 fill-white stroke-white" />
                </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <KeyRound className="w-8 h-8 text-terracotta mb-2" />
            <div className="font-serif font-bold text-sm text-charcoal">
              Selected Anchor: ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </div>
            <p className="text-xs text-charcoal-500 max-w-sm mt-1 mb-4">
              Click preset neighborhoods above to position your pin, or provide <code className="bg-sand-200 px-1 py-0.5 rounded text-terracotta font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable full interactive Google Maps dragging.
            </p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-sand-300 text-[11px] font-medium text-charcoal shadow-sm flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-terracotta" />
          <span>Click anywhere or drag the pin to set story coordinates</span>
        </div>
      </div>
    </div>
  );
}
