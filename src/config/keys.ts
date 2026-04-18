import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const GOOGLE_PLACES_API_KEY: string = extra.googlePlacesApiKey || '';

export const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
export const PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';
