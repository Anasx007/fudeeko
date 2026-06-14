import { PlaceResult } from '@/types';
import { parseIntent, Intent } from '@/lib/intent-parser';

const API_KEY = process.env.GEOAPIFY_API_KEY;
const BASE_URL = 'https://api.geoapify.com/v2/places';
const DEFAULT_LIMIT = 20;
const DEFAULT_FALLBACK_CITY = 'Bangalore, India';

function formatDistance(meters: number) {
  if (!Number.isFinite(meters)) return 'Unknown';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function buildUrlWithBias(query: string, lon: number, lat: number) {
  const url = new URL(BASE_URL);
  url.searchParams.set('apiKey', API_KEY ?? '');
  url.searchParams.set('limit', DEFAULT_LIMIT.toString());

  // Search text (keywords)
  url.searchParams.set('text', query);

  // Categories for restaurants and cafes
  url.searchParams.set('categories', 'catering.restaurant,catering.cafe');

  // Bias by proximity using lon,lat
  url.searchParams.set('bias', `proximity:${lon},${lat}`);

  return url.toString();
}

async function geocodeToCoordinates(place: string) {
  const geocodeUrl = new URL('https://api.geoapify.com/v1/geocode/search');
  geocodeUrl.searchParams.set('apiKey', API_KEY ?? '');
  geocodeUrl.searchParams.set('text', place);
  geocodeUrl.searchParams.set('limit', '1');

  try {
    const res = await fetch(geocodeUrl.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      const body = await res.text();
      console.error('[Geoapify] Geocoding failed', { geocodeUrl: geocodeUrl.toString(), status: res.status, body });
      return null;
    }

    const payload = await res.json();
    const feat = payload.features && payload.features[0];
    if (!feat) return null;
    const coords = feat.geometry?.coordinates ?? [];
    return { lon: coords[0], lat: coords[1] } as { lon: number; lat: number } | null;
  } catch (err) {
    const fetchError = err instanceof Error ? err.message : String(err);
    console.error('[Geoapify] Geocoding network error', { place, error: fetchError });
    return null;
  }
}

export async function searchPlaces(query: string, location?: string, latitude?: string, longitude?: string) {
  if (!API_KEY) {
    throw new Error('The Geoapify API key is not configured. Set GEOAPIFY_API_KEY.');
  }

  const normalizedQuery = query.trim() || 'restaurant';
  const intent: Intent = parseIntent(normalizedQuery);

  // Determine bias coordinates: prefer provided lat/lng, otherwise geocode manual location or fallback city
  let lonNum: number | null = null;
  let latNum: number | null = null;

  if (latitude && longitude) {
    latNum = Number(latitude);
    lonNum = Number(longitude);
  } else if (location && location.trim()) {
    const geocoded = await geocodeToCoordinates(location.trim());
    if (geocoded) {
      lonNum = geocoded.lon;
      latNum = geocoded.lat;
    } else {
      console.warn('[Geoapify] Could not geocode provided location; falling back to default city');
    }
  }

  if (latNum === null || lonNum === null) {
    const geocoded = await geocodeToCoordinates(DEFAULT_FALLBACK_CITY);
    if (geocoded) {
      lonNum = geocoded.lon;
      latNum = geocoded.lat;
      console.warn('[Geoapify] Using fallback city coordinates for bias:', DEFAULT_FALLBACK_CITY, geocoded);
    } else {
      throw new Error('Unable to determine bias coordinates for Geoapify Places request.');
    }
  }

  const url = buildUrlWithBias(normalizedQuery, lonNum, latNum);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err) {
    const fetchError = err instanceof Error ? err.message : String(err);
    console.error('[Geoapify] Network error while requesting Places API', { url, error: fetchError });
    throw new Error(`Geoapify Places API fetch error: ${fetchError}`);
  }

  if (!response.ok) {
    const responseBody = await response.text();
    console.error('[Geoapify] Places API request failed', {
      url,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
    });
    throw new Error(`Geoapify Places API request failed with status ${response.status} ${response.statusText}: ${responseBody || 'No response body'}`);
  }

  const payload = await response.json();
  const features = payload.features ?? [];

  // Build scored entries
  const entries = features
    .map((feature: any) => {
      const prop = feature.properties ?? {};
      const coords = feature.geometry?.coordinates ?? [];
      const lon = coords[0];
      const lat = coords[1];

      const name = (prop.name || '').trim();
      if (!name) return null; // filter out unnamed places

      const address = prop.formatted || [prop.address_line1, prop.city, prop.state]
        .filter(Boolean)
        .join(', ');

      const categories = prop.categories ?? [];
      const category = (categories.length > 0 && categories[0].title) || prop.category || null;
      const rating = typeof prop.rating === 'number' ? prop.rating : null;
      const distanceMeters = typeof prop.distance === 'number' ? prop.distance : (prop.distance_meters ?? Number.POSITIVE_INFINITY);

      // Relevance scoring
      let score = 0;
      const lname = name.toLowerCase();
      const lcat = (category || '').toLowerCase();
      const laddr = (address || '').toLowerCase();
      const q = normalizedQuery.toLowerCase();
      const intentFood = intent.food ?? null;
      const intentMeal = intent.meal ?? null;
      const intentMood = intent.mood ?? null;
      const intentOccasion = intent.occasion ?? null;
      const intentBudget = intent.budget ?? null;
      const intentTime = intent.time ?? null;

      // Prioritize restaurants
      if (lcat.includes('restaurant') || lname.includes('restaurant')) score += 60;
      // Family / family-friendly
      if (lcat.includes('family') || lname.includes('family')) score += 40;
      // Multi-cuisine / multicuisine
      if (lcat.includes('multi') || lname.includes('multi') || lname.includes('multicuisine')) score += 30;
      // Query match in name or category
      if (lname.includes(q) || lcat.includes(q)) score += 20;
      // Boosts from parsed intent
      if (intentFood && (lname.includes(intentFood) || lcat.includes(intentFood))) score += 40;
      if (intentMeal && (lname.includes(intentMeal) || lcat.includes(intentMeal))) score += 30;
      if (intentMood === 'work-friendly' && (lcat.includes('cafe') || lname.includes('coffee'))) score += 25;
      if (intentOccasion === 'family' && (lcat.includes('family') || lname.includes('family') || lname.includes('canteen') || laddr.includes('family'))) score += 30;
      if (intentBudget === 'budget' && (lname.includes('dhaba') || lname.includes('canteen') || laddr.includes('cheap') || laddr.includes('budget'))) score += 20;
      if (intentTime === 'late-night' && (lname.includes('late') || lname.includes('night') || laddr.includes('late') || laddr.includes('night'))) score += 25;
      // Fallback simple intent boosts
      if (q.includes('dinner')) score += 15;
      if (q.includes('family')) score += 15;
      if (q.includes('best') || q.includes('top') || q.includes('highly')) score += 10;
      // Rating boosts
      if (rating) score += rating * 10;
      // Closer places score higher (simple distance decay)
      if (Number.isFinite(distanceMeters)) score += Math.max(0, 50 - distanceMeters / 100);

      return {
        feature,
        prop,
        name,
        address,
        category,
        rating,
        lat: typeof lat === 'number' ? lat : null,
        lon: typeof lon === 'number' ? lon : null,
        distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null,
        score,
        // include raw text fields for tagging later
        lname,
        lcat,
        laddr: (address || '').toLowerCase(),
      };
    })
    .filter(Boolean) as Array<any>;

  // Deduplicate by normalized name + rounded coordinates, keep highest score
  const seen = new Map<string, any>();
  for (const e of entries) {
    const nameKey = e.name.toLowerCase().replace(/\s+/g, ' ').trim();
    const latKey = e.lat ? Math.round(e.lat * 10000) : 0;
    const lonKey = e.lon ? Math.round(e.lon * 10000) : 0;
    const key = `${nameKey}|${latKey}|${lonKey}`;
    const existing = seen.get(key);
    if (!existing || e.score > existing.score) seen.set(key, e);
  }

  const deduped = Array.from(seen.values());

  // Sort by score desc, then rating desc, then distance asc
  deduped.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    const da = a.distanceMeters ?? Number.POSITIVE_INFINITY;
    const db = b.distanceMeters ?? Number.POSITIVE_INFINITY;
    return da - db;
  });

  const limited = deduped.slice(0, 20);

  // Map to PlaceResult shape
  return limited.map((e: any) => {
    // Deterministic tag generation using name, category, vicinity and query intent
    const tags: string[] = [];
    const push = (t: string) => { if (tags.length < 3 && !tags.includes(t)) tags.push(t); };
    const q = normalizedQuery.toLowerCase();

    // Priority order: Shawarma, Cafe, Family, Late Night, Budget, Date Night
    // Shawarma
    if (e.lname.includes('shawarma') || e.lcat.includes('shawarma') || e.laddr.includes('shawarma')) push('Shawarma');
    // Biryani
    if (e.lname.includes('biryani') || e.lcat.includes('biryani') || e.laddr.includes('biryani')) push('Biryani');
    // Cafe-related -> Coffee & Work
    if ((e.lcat.includes('cafe') || e.lname.includes('coffee') || e.laddr.includes('cafe') || e.lname.includes('coffee'))) push('Coffee & Work');
    // Family-friendly cues
    if (e.lcat.includes('family') || e.lname.includes('family') || e.laddr.includes('family') || e.lname.includes('canteen') || e.laddr.includes('canteen') || e.lname.includes('banquet') || e.laddr.includes('banquet')) push('Family Friendly');
    // Late night cues (also consider query intent)
    if (e.lname.includes('late') || e.laddr.includes('late') || e.lname.includes('night') || e.laddr.includes('night') || e.lname.includes('24') || q.includes('late') || q.includes('night')) push('Late Night');
    // Budget cues
    if (e.lname.includes('budget') || e.laddr.includes('budget') || e.lname.includes('cheap') || e.laddr.includes('cheap') || e.lname.includes('dhaba') || e.laddr.includes('dhaba') || e.lname.includes('canteen') || e.laddr.includes('canteen')) push('Budget Friendly');
    // Fine dining / romantic
    if (e.lname.includes('fine') || e.lcat.includes('fine') || e.lname.includes('rooftop') || e.laddr.includes('rooftop') || e.lname.includes('romantic') || e.lname.includes('date') || q.includes('date') || q.includes('date night')) push('Date Night');

    // Ensure tags from parsed intent are present (deterministic)
    if (intent.food === 'coffee' || intent.mood === 'work-friendly' || q.includes('coffee') || q.includes('work')) { if (!tags.includes('Coffee & Work')) push('Coffee & Work'); }
    if (intent.occasion === 'family' || q.includes('family') || q.includes('family dinner')) { if (!tags.includes('Family Friendly')) push('Family Friendly'); }
    if (intent.food === 'shawarma' || q.includes('shawarma')) { if (!tags.includes('Shawarma')) push('Shawarma'); }
    if (intent.food === 'biryani' || q.includes('biryani')) { if (!tags.includes('Biryani')) push('Biryani'); }

    // Determine a single concise, deterministic reason sentence based on tags/query
    let reason = '';
    if (tags.includes('Family Friendly')) reason = 'Good match for family dining based on category and search intent.';
    else if (tags.includes('Coffee & Work')) reason = 'Matches coffee and work related search intent.';
    else if (tags.includes('Late Night')) reason = 'Matches late-night food search intent.';
    else if (tags.includes('Shawarma')) reason = 'Relevant for shawarma-related searches.';
    else if (tags.includes('Biryani')) reason = 'Relevant for biryani-related searches.';
    else if (tags.includes('Budget Friendly')) reason = 'Budget-friendly option based on venue and pricing cues.';
    else if (tags.includes('Date Night')) reason = 'Suitable for date night or fine-dining occasions.';
    else if (q.includes('family')) reason = 'Good match for family dining based on search intent.';
    else if (q.includes('coffee') || q.includes('work')) reason = 'Matches coffee and work related search intent.';
    else reason = 'Relevant based on category and search intent.';

    return {
      placeId: e.prop.place_id || e.prop.osm_id || e.feature.id || String(e.prop.fsq_id ?? ''),
      name: e.name,
      rating: e.rating,
      userRatingsTotal: null,
      isOpen: null,
      businessStatus: e.category,
      vicinity: e.address || 'Nearby',
      distanceText: e.distanceMeters ? formatDistance(e.distanceMeters) : 'Unknown',
      destination: (e.lat !== null && e.lon !== null) ? `${e.lat},${e.lon}` : (e.address || String(e.prop.place_id || e.feature.id)),
      latitude: e.lat,
      longitude: e.lon,
      category: e.category,
      tags,
      reason,
    } as PlaceResult;
  });
}
