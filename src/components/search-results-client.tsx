'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PlaceCard from './place-card';
import { PlaceResult } from '@/types';

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [intent, setIntent] = useState<Record<string, string | null> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q') ?? '';
  const latitude = searchParams.get('lat');
  const longitude = searchParams.get('lng');
  const locationText = searchParams.get('loc');

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: query });
        if (latitude) params.set('lat', latitude);
        if (longitude) params.set('lng', longitude);
        if (locationText) params.set('loc', locationText);

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load results.');
        }

        setResults(data.results ?? []);
        if (process.env.NODE_ENV === 'development') {
          setIntent(data.intent ?? null);
        } else {
          setIntent(null);
        }
      } catch (err) {
        setError((err as Error).message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, latitude, longitude, locationText]);

  if (!query) {
    return (
      <div className="mx-auto mt-20 max-w-3xl rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'rgba(31,41,55,0.6)' }}>Search</p>
        <h1 className="mt-4 text-3xl font-semibold" style={{ color: '#1F2937' }}>Enter your idea and find the best place.</h1>
        <p className="mt-3" style={{ color: 'rgba(31,41,55,0.7)' }}>Use the search bar from the home page to start a location-aware discovery.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Results for</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{query}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {latitude && longitude
                  ? 'Restaurants close to your current location.'
                  : `Searching near ${locationText ?? 'your area'}.`}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-soft">Loading the best options for you…</div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-slate-800 shadow-soft">{error}</div>
        ) : results.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-700 shadow-soft">No restaurants found. Try a broader query or a nearby landmark.</div>
        ) : (
          <div className="grid gap-6">
            {process.env.NODE_ENV === 'development' && intent && (
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-800">Parsed intent (dev)</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><strong>food:</strong> {intent.food ?? '—'}</div>
                  <div><strong>meal:</strong> {intent.meal ?? '—'}</div>
                  <div><strong>mood:</strong> {intent.mood ?? '—'}</div>
                  <div><strong>occasion:</strong> {intent.occasion ?? '—'}</div>
                  <div><strong>budget:</strong> {intent.budget ?? '—'}</div>
                  <div><strong>time:</strong> {intent.time ?? '—'}</div>
                </div>
              </div>
            )}
            {results.map((place) => (
              <PlaceCard key={place.placeId} place={place} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
