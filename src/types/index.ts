export interface UserProfile {
  id: string;
  name: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceReview {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  time: number;
}

export interface Restaurant {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number;
  photos: string[];
  reviews: PlaceReview[];
  phoneNumber?: string;
  website?: string;
  openNow?: boolean;
  coordinates: Coordinates;
  types: string[];
  vicinity?: string;
}

export type VoteValue = 'yes' | 'no';

export interface ParticipantVotes {
  [placeId: string]: VoteValue;
}

export interface SessionVotes {
  [userId: string]: ParticipantVotes;
}

export interface SessionParticipant {
  id: string;
  name: string;
  joinedAt: number;
  isReady: boolean;
}

export interface SessionSettings {
  radius: number;
  location: Coordinates;
}

export interface Session {
  id: string;
  code: string;
  hostId: string;
  participants: { [userId: string]: SessionParticipant };
  settings: SessionSettings;
  votes: SessionVotes;
  matches: string[];
  status: 'lobby' | 'swiping' | 'matched' | 'done';
  restaurantQueue: string[];
  restaurants: { [placeId: string]: Restaurant };
  createdAt: number;
}

export interface CalendarEventDetails {
  restaurantName: string;
  address: string;
  notes: string;
  startDate: Date;
  durationMinutes: number;
}

export type RootStackParamList = {
  Welcome: undefined;
  Lobby: { sessionId: string; userId: string };
  Swipe: { sessionId: string; userId: string };
  Match: { sessionId: string; userId: string; matchedPlaceId: string };
  MapView: { restaurant: Restaurant };
};
