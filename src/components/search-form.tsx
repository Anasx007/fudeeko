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
  const [showLocationEditor, setShowLocationEditor] = useState(false);

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
    return 'What are you looking for today?';
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
        <div className="rounded-3xl bg-[rgba(255,255,255,0.95)] p-3 sm:p-5">
          <label className="block text-sm font-semibold" style={{ color: 'rgba(31,41,55,0.8)' }}>Search by food, mood, or occasion</label>
          <div className="mt-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border bg-white px-4 py-3 text-xl sm:text-2xl font-semibold outline-none placeholder:text-slate-400"
              style={{ borderColor: 'rgba(31,41,55,0.06)', color: '#1F2937' }}
              placeholder={queryLabel}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-[rgba(31,41,55,0.8)] flex items-center gap-3">
              <span className="text-lg">📍</span>
              <span>
                {locationInput
                  ? locationInput
                  : locationCoords
                  ? locationLabel
                  : isDetecting
                  ? 'Detecting…'
                  : 'Location unavailable'}
              </span>
              <button type="button" className="ml-2 text-sm font-semibold underline" onClick={() => setShowLocationEditor(true)}>
                Change Location
              </button>
            </div>
            <div className="text-xs text-[rgba(31,41,55,0.6)]">{isDetecting ? 'Detecting…' : 'Using location'}</div>
          </div>

          {showLocationEditor ? (
            <div className="mt-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: 'rgba(31,41,55,0.06)', color: '#1F2937' }}
                  placeholder="Enter city or neighborhood (e.g. Kannur)"
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => { setShowLocationEditor(false); }} className="text-sm text-[rgba(31,41,55,0.7)]">Cancel</button>
                  <button
                    type="button"
                    onClick={() => { setShowLocationEditor(false); setError(null); }}
                    className="rounded-md bg-[rgba(255,107,53,1)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : null}

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

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              disabled={query.trim().length === 0}
              className={
                `w-full sm:w-56 h-14 rounded-full text-base font-semibold text-white transition-opacity duration-200 ease-in-out flex items-center justify-center ` +
                (query.trim().length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100')
              }
              style={{ backgroundColor: '#FF6B35' }}
            >
              Discover
            </button>
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </form>
    </section>
  );
}
