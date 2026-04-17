# 🍽️ Restaurant Matcher

A cross-platform iOS & Android app where two or more people link together, browse nearby restaurants, swipe to vote, match on mutual favorites, and book a calendar appointment — all in real time.

---

## Features

| Feature | Details |
|---|---|
| **Real-time sessions** | Friends join with a 6-character code; votes sync instantly via Firebase Firestore |
| **Nearby restaurants** | Google Places API pulls restaurants within a selectable radius (0.5–10 mi) |
| **Swipe voting** | ← Swipe LEFT = ✓ YES (like) · Swipe RIGHT = ✗ NO (skip) |
| **Match detection** | A match fires when **all** participants vote YES on the same restaurant |
| **Google Maps** | Custom marker, callout with rating, one-tap directions or Google Maps deep-link |
| **Calendar booking** | Expo Calendar creates an event with location, custom time, duration, and two alarms |
| **Google Reviews** | Up to 5 real Google reviews shown on each restaurant card |

---

## Tech Stack

- **React Native + Expo** (SDK 50) — iOS & Android from one codebase
- **Firebase Firestore** — real-time vote syncing
- **Google Places API** — restaurant discovery & details
- **react-native-maps** — interactive Google Maps with custom markers
- **react-native-reanimated + react-native-gesture-handler** — smooth swipe physics
- **expo-calendar** — native calendar event creation
- **expo-location** — GPS location permissions

---

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd Restaurant_Matcher
npm install
```

### 2. Firebase Setup

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** to the project
3. Enable **Cloud Firestore** (start in test mode for development)
4. Copy your config into `src/config/firebase.ts`:

```ts
const firebaseConfig = {
  apiKey: 'YOUR_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

**Firestore Security Rules (development)**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Google Cloud API Keys

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an API key and enable:
   - **Places API**
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
3. Update `src/config/keys.ts`:
```ts
export const GOOGLE_PLACES_API_KEY = 'YOUR_KEY_HERE';
```
4. Update `app.json` with your map keys:
```json
"ios": { "config": { "googleMapsApiKey": "YOUR_IOS_KEY" } }
"android": { "config": { "googleMaps": { "apiKey": "YOUR_ANDROID_KEY" } } }
```

### 4. Run

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

---

## App Flow

```
WelcomeScreen
    |
    +-- Create Session --> LobbyScreen (host)
    |       |  Share 6-char code with friends
    |       |  Set search radius (0.5 to 10 mi)
    |       |  Wait for everyone to mark Ready
    |       |  Host taps "Start Matching!"
    |
    +-- Join with Code --> LobbyScreen (guest)
            |  Enter name + 6-char code
            |  Mark Ready when set
            |
            v
        SwipeScreen  ---- left swipe = YES
            |         ---- right swipe = NO
            |
    [all vote YES on same place]
            |
            v
        MatchModal (celebration overlay)
            |
            +-- View on Map --> MapViewScreen (Google Maps)
            +-- Add to Calendar --> CalendarModal
            +-- Keep Swiping --> back to SwipeScreen
```

---

## Project Structure

```
src/
+-- types/index.ts           TypeScript interfaces
+-- config/
|   +-- firebase.ts          Firebase init (add your credentials here)
|   +-- keys.ts              Google Places API key (add yours here)
+-- services/
|   +-- placesService.ts     Google Places API (nearby search + details)
|   +-- sessionService.ts    Firestore CRUD + real-time listener
|   +-- calendarService.ts   expo-calendar event creation
+-- hooks/
|   +-- useLocation.ts       GPS permissions + current position
|   +-- useSession.ts        Firestore session subscription
|   +-- useUserProfile.ts    AsyncStorage user persistence
+-- contexts/AppContext.tsx  Global state provider
+-- components/
|   +-- SwipeCard.tsx         Animated gesture card (Reanimated 2)
|   +-- RestaurantCard.tsx    Photo carousel + details + reviews
|   +-- MatchModal.tsx        Celebration modal on match
|   +-- CalendarModal.tsx     Date/time picker to calendar event
|   +-- RadiusSelector.tsx    Radius chip selector
|   +-- StarRating.tsx        Star rating display
+-- screens/
|   +-- WelcomeScreen.tsx    Create or join session
|   +-- LobbyScreen.tsx      Pre-game lobby + session code sharing
|   +-- SwipeScreen.tsx      Main swipe interface
|   +-- MatchScreen.tsx      Full match details page
|   +-- MapViewScreen.tsx    Google Maps + directions
+-- navigation/AppNavigator.tsx
```

---

## Swipe Logic

| Gesture | Meaning | Firebase vote |
|---|---|---|
| Swipe Left  | YES - I want to eat here | 'yes' |
| Swipe Right | NO - Skip this place     | 'no'  |
| Tap green checkmark button | YES | 'yes' |
| Tap red X button           | NO  | 'no'  |

A **match** triggers when every participant has cast a 'yes' vote for the same restaurant.

---

## Firestore Data Model

```
sessions/{sessionId}
  +-- code: string              (6-char join code)
  +-- hostId: string
  +-- status: lobby|swiping|matched|done
  +-- settings/
  |     +-- radius: number      (meters)
  |     +-- location: {lat, lng}
  +-- participants/{userId}
  |     +-- name, joinedAt, isReady
  +-- restaurants/{placeId}     (full Place details cached)
  +-- restaurantQueue: string[] (ordered placeId list)
  +-- votes/{userId}/{placeId}: 'yes'|'no'
  +-- matches: string[]         (placeIds everyone liked)

sessionCodes/{code}
  +-- sessionId: string         (lookup by join code)
```
