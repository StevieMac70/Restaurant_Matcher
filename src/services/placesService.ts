import { Restaurant, PlaceReview, Coordinates } from '../types';
import { GOOGLE_PLACES_API_KEY, PLACES_BASE_URL, PHOTO_BASE_URL } from '../config/keys';

interface NearbySearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now: boolean };
  geometry: { location: { lat: number; lng: number } };
  types: string[];
}

interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{ photo_reference: string }>;
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    profile_photo_url?: string;
    rating: number;
    text: string;
    time: number;
  }>;
  opening_hours?: { open_now: boolean };
  geometry: { location: { lat: number; lng: number } };
  types: string[];
}

export function buildPhotoUrl(photoReference: string, maxWidth = 800): string {
  return `${PHOTO_BASE_URL}?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
}

export async function fetchNearbyRestaurants(
  location: Coordinates,
  radiusMeters: number,
): Promise<string[]> {
  const url =
    `${PLACES_BASE_URL}/nearbysearch/json` +
    `?location=${location.latitude},${location.longitude}` +
    `&radius=${radiusMeters}` +
    `&type=restaurant` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Places nearby search failed: ${response.status}`);

  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status} — ${data.error_message ?? ''}`);
  }

  return (data.results as NearbySearchResult[]).map((r) => r.place_id);
}

export async function fetchRestaurantDetails(placeId: string): Promise<Restaurant> {
  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'price_level',
    'photos',
    'reviews',
    'opening_hours',
    'geometry',
    'types',
    'vicinity',
  ].join(',');

  const url =
    `${PLACES_BASE_URL}/details/json` +
    `?place_id=${placeId}` +
    `&fields=${fields}` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Place details fetch failed: ${response.status}`);

  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(`Places Details API error: ${data.status}`);
  }

  const r: PlaceDetailsResult = data.result;

  const photos = (r.photos ?? []).slice(0, 5).map((p) => buildPhotoUrl(p.photo_reference));

  const reviews: PlaceReview[] = (r.reviews ?? []).slice(0, 5).map((rv) => ({
    authorName: rv.author_name,
    authorPhoto: rv.profile_photo_url,
    rating: rv.rating,
    text: rv.text,
    time: rv.time,
  }));

  return {
    placeId: r.place_id,
    name: r.name,
    address: r.formatted_address,
    rating: r.rating ?? 0,
    userRatingsTotal: r.user_ratings_total ?? 0,
    priceLevel: r.price_level,
    photos,
    reviews,
    phoneNumber: r.formatted_phone_number,
    website: r.website,
    openNow: r.opening_hours?.open_now,
    coordinates: {
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
    },
    types: r.types,
  };
}

export async function fetchMultipleRestaurants(placeIds: string[]): Promise<Restaurant[]> {
  const results = await Promise.allSettled(placeIds.map((id) => fetchRestaurantDetails(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Restaurant> => r.status === 'fulfilled')
    .map((r) => r.value);
}
