export interface PlaceResult {
  placeId: string;
  name: string;
  rating: number | null;
  userRatingsTotal: number | null;
  isOpen: boolean | null;
  businessStatus: string | null;
  vicinity: string;
  distanceText: string;
  destination: string;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  reason?: string | null;
  tags?: string[];
}

export interface LocationPayload {
  latitude?: string;
  longitude?: string;
  locationText?: string;
}
