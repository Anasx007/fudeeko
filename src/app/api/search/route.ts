import { NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/geoapify';
import { parseIntent } from '@/lib/intent-parser';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const latitude = url.searchParams.get('lat') ?? undefined;
  const longitude = url.searchParams.get('lng') ?? undefined;
  const locationText = url.searchParams.get('loc') ?? undefined;

  try {
    const data = await searchPlaces(query, locationText, latitude, longitude);
    const intent = parseIntent(query || '');
    return NextResponse.json({ results: data, intent });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Search API] Geoapify search failed', {
      query,
      locationText,
      latitude,
      longitude,
      error: message,
    });
    return NextResponse.json({ error: message || 'Search failed' }, { status: 500 });
  }
}
