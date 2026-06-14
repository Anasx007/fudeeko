'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const examples = [
  'Best breakfast near me',
  'Late-night shawarma',
  'Coffee and work',
  'Family dinner tonight',
  'Dinner under ₹1000 for 2',
  'Quiet cafe to work',
];

export default function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [status, setStatus] = useState('Finding your location…');
  const [isDetecting, setIsDetecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = locationCoords || locationLabel;

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsDetecting(false);
      setStatus('Geolocation is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
        });
        setLocationLabel('Current location');
        setStatus('Location detected.');
        setIsDetecting(false);
      },
      () => {
        setIsDetecting(false);
        setStatus('Enter a city, neighborhood, or landmark.');
      },
      { timeout: 9000 },
    );
  }, []);

  const queryLabel = useMemo(() => {
    if (query.trim()) return query.trim();
    return 'What are you in the mood for?';
  }, [query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError('Please enter what you want right now.');
      return;
    }
    setError(null);
    const params = new URLSearchParams({ q: query.trim() });
    if (locationCoords) {
      params.set('lat', locationCoords.lat);
      params.set('lng', locationCoords.lng);
    } else if (locationInput.trim()) {
      params.set('loc', locationInput.trim());
    }
    router.push(`/search?${params.toString()}`);
  }

  const handleExample = (value: string) => {
    setQuery(value);
    setError(null);
  };

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-3xl bg-[rgba(255,255,255,0.9)] p-4 sm:p-5">
          <label className="block text-sm font-semibold" style={{ color: 'rgba(31,41,55,0.8)' }}>Search by food, mood, or occasion</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border bg-white px-5 py-4 text-2xl font-semibold outline-none placeholder:text-slate-400"
              style={{ borderColor: 'rgba(31,41,55,0.06)', color: '#1F2937' }}
              placeholder="e.g. Rooftop dinner, quiet cafe, late-night biryani"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-full px-6 text-base font-semibold text-white"
              style={{ backgroundColor: '#FF6B35' }}
            >
              Discover
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {examples.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleExample(item)}
                className="rounded-full border border-transparent px-4 py-2 text-sm"
                style={{ backgroundColor: 'rgba(255, 183, 3, 0.2)', color: 'rgba(31,41,55,0.85)' }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(31,41,55,0.8)' }}>Location</p>
              <p className="mt-1 text-sm" style={{ color: 'rgba(31,41,55,0.6)' }}>Your current location or manual fallback.</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]" style={{ backgroundColor: 'rgba(31,41,55,0.06)', color: 'rgba(31,41,55,0.7)' }}>
              {isDetecting ? 'Detecting…' : 'Ready'}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'rgba(31,41,55,0.06)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'rgba(31,41,55,0.85)' }}>
              {locationCoords ? `${locationLabel} • ${locationCoords.lat.slice(0, 7)}, ${locationCoords.lng.slice(0, 7)}` : status}
            </div>
            <input
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              className="w-full rounded-full border bg-white px-4 py-3 text-sm outline-none"
              style={{ borderColor: 'rgba(31,41,55,0.06)', color: '#1F2937' }}
              placeholder="Manual location fallback (e.g. Bangalore, Church Street)"
            />
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </form>
    </section>
  );
}
