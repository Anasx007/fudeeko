'use client';

import { MapPin, Navigation2 } from 'lucide-react';
import { PlaceResult } from '@/types';

interface PlaceCardProps {
  place: PlaceResult;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.destination)}`;

  // Prefer server-provided deterministic tags; fall back to a small client-side extractor
  const clientFallbackTags = (p: PlaceResult) => {
    const txt = [p.name, p.category, p.vicinity].filter(Boolean).join(' ').toLowerCase();
    const tags: string[] = [];
    const push = (t: string) => { if (tags.length < 3 && !tags.includes(t)) tags.push(t); };
    if (txt.includes('shawarma')) push('Shawarma');
    if (txt.includes('biryani')) push('Biryani');
    if (txt.includes('coffee') || txt.includes('cafe')) push('Coffee & Work');
    if (txt.includes('family')) push('Family Friendly');
    if (txt.includes('late') || txt.includes('night') || txt.includes('24')) push('Late Night');
    if (txt.includes('budget') || txt.includes('cheap') || txt.includes('affordable') || txt.includes('canteen') || txt.includes('dhaba')) push('Budget Friendly');
    if (txt.includes('romantic') || txt.includes('date') || txt.includes('fine dining') || txt.includes('fine-dining') || txt.includes('rooftop')) push('Date Night');
    return tags;
  };

  const tags = (place.tags && place.tags.length > 0) ? place.tags.slice(0, 3) : clientFallbackTags(place);

  const tagClass = (t: string) => {
    switch (t) {
      case 'Family Friendly':
        return { backgroundColor: '#FFB703', color: 'rgba(0,0,0,0.85)' };
      case 'Coffee & Work':
        return { backgroundColor: '#FF6B35', color: 'white' };
      case 'Budget Friendly':
        return { backgroundColor: 'rgba(0,0,0,0.06)', color: '#1F2937' };
      case 'Late Night':
        return { backgroundColor: '#FF6B35', color: 'white' };
      case 'Shawarma':
        return { backgroundColor: '#FFB703', color: 'rgba(0,0,0,0.85)' };
      case 'Biryani':
        return { backgroundColor: '#FFB703', color: 'rgba(0,0,0,0.85)' };
      case 'Date Night':
        return { backgroundColor: '#FF6B35', color: 'white' };
      default:
        return { backgroundColor: 'rgba(0,0,0,0.06)', color: '#1F2937' };
    }
  };

  return (
    <article className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>{place.name}</h3>
          <p className="mt-1 text-sm" style={{ color: 'rgba(31,41,55,0.7)' }}>{place.vicinity}</p>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full px-3 py-1 text-xs font-semibold" style={tagClass(t)}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {place.reason && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-slate-700">Why this place?</h4>
              <p className="mt-1 text-sm text-slate-500">{place.reason}</p>
            </div>
          )}
        </div>
      </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[rgba(31,41,55,0.75)]">
            <MapPin className="h-4 w-4 text-[rgba(31,41,55,0.6)]" />
            <span>{place.distanceText}</span>
          </div>
          <div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: '#FF6B35' }}
            >
              <Navigation2 className="h-4 w-4" />
              Directions
            </a>
          </div>
        </div>
    </article>
  );
}
