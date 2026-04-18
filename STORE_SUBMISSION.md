# Store Submission Guide — Restaurant Matcher

Complete step-by-step guide to publish Restaurant Matcher on the Apple App Store and Google Play Store.

---

## Prerequisites

| Tool | Install |
|---|---|
| Node.js 18+ | nodejs.org |
| Expo CLI | `npm install -g expo-cli` |
| EAS CLI | `npm install -g eas-cli` |
| Firebase CLI | `npm install -g firebase-tools` |

---

## Phase 1 — External Accounts (One-time setup)

### 1A. Apple Developer Account
- Enroll at https://developer.apple.com/programs/ ($99/year)
- Go to **Certificates, Identifiers & Profiles**
- Register App ID: `com.restaurantmatcher.app`
- Enable capabilities: **Associated Domains** (optional), **Push Notifications** (not required)

### 1B. Google Play Developer Account
- Register at https://play.google.com/console ($25 one-time fee)
- Accept developer agreement
- Complete payment profile

### 1C. Expo / EAS Account
```bash
eas login          # or: eas register
eas init           # links this project to your EAS account
```
Copy the `projectId` shown and paste it into `app.config.js` → `extra.eas.projectId`.

---

## Phase 2 — API Keys

### 2A. Firebase
1. Create project at https://console.firebase.google.com
2. Add a **Web app** — copy the config values
3. Enable **Cloud Firestore** (production mode)
4. Enable **Authentication → Anonymous** sign-in method
5. Deploy security rules:
```bash
firebase login
firebase use --add    # select your project
npm run deploy:rules
```

### 2B. Google Cloud
1. Go to https://console.cloud.google.com/apis/credentials
2. Create one API key (or separate ones per platform — recommended for production)
3. Enable APIs on the key:
   - **Places API** (New) or Places API
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
4. **Restrict the key** (highly recommended):
   - iOS key: restrict by **iOS bundle ID** → `com.restaurantmatcher.app`
   - Android key: restrict by **Android app + SHA-1** fingerprint
   - Places key: restrict by **API** (Places API only)

---

## Phase 3 — Configure Environment Variables

### Local development — create `.env` (never commit this file):
```bash
cp .env.example .env
# Then fill in all values in .env
```

### EAS secrets (for cloud builds):
```bash
eas secret:create --scope project --name GOOGLE_PLACES_API_KEY     --value "YOUR_VALUE"
eas secret:create --scope project --name GOOGLE_MAPS_IOS_KEY        --value "YOUR_VALUE"
eas secret:create --scope project --name GOOGLE_MAPS_ANDROID_KEY    --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_API_KEY           --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN       --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_PROJECT_ID        --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET    --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "YOUR_VALUE"
eas secret:create --scope project --name FIREBASE_APP_ID            --value "YOUR_VALUE"
eas secret:create --scope project --name EAS_PROJECT_ID             --value "YOUR_EAS_PROJECT_ID"
```

---

## Phase 4 — App Icons and Splash Screen

Place these files in `./assets/` before building:

| File | Size | Notes |
|---|---|---|
| `icon.png` | 1024×1024 px | No transparency; PNG; rounded corners done by OS |
| `splash.png` | 1284×2778 px | Safe zone 828×1792 for main content |
| `adaptive-icon.png` | 1024×1024 px | Android adaptive icon foreground |
| `favicon.png` | 48×48 px | Web only |

**Brand color**: `#FF6B35` (orange)

Recommended tool: https://expo.fyi/app-icon for auto-resizing.

---

## Phase 5 — Install Dependencies and Test Locally

```bash
npm install
npm start              # Scan QR with Expo Go to test on device
npm run ios            # iOS Simulator
npm run android        # Android Emulator
```

---

## Phase 6 — Production Builds via EAS

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Build for both platforms
```bash
# Internal preview (share with testers via link)
npm run build:preview

# Production builds for store submission
npm run build:ios
npm run build:android
```

EAS handles code signing automatically:
- **iOS**: EAS manages provisioning profiles and certificates
- **Android**: EAS manages keystore (save the generated keystore — it's needed for all future updates)

---

## Phase 7 — App Store Connect (iOS)

### 7A. Create app listing
1. Go to https://appstoreconnect.apple.com
2. **My Apps** → **+** → **New App**
   - Platform: iOS
   - Name: `Restaurant Matcher`
   - Primary Language: English
   - Bundle ID: `com.restaurantmatcher.app`
   - SKU: `restaurantmatcher001`

### 7B. App Information
- **Category**: Food & Drink (primary), Lifestyle (secondary)
- **Age Rating**: 4+
- **Price**: Free
- **Privacy Policy URL**: Host your privacy policy at a public URL (e.g., GitHub Pages, your website)

### 7C. Version metadata
**Description** (copy-paste ready):
```
Restaurant Matcher takes the stress out of deciding where to eat.

Create a session with friends, set your search radius, then swipe through nearby restaurants — left to vote YES, right to vote NO. When everyone agrees, you have a match!

KEY FEATURES:
• Real-time voting — invite friends with a 6-character code
• Powered by Google Places — photos, ratings, reviews
• Adjustable radius — from half a mile to 10 miles
• Interactive Google Maps with one-tap directions
• Add your matched restaurant directly to your calendar
• No account required — just enter your name and go

Perfect for date nights, family dinners, office lunches, and friend groups who can never agree on where to eat.
```

**Keywords** (100 chars max):
```
restaurant,food,dining,swipe,match,group,nearby,vote,google maps,places,date night,dinner
```

**What's New** (first version):
```
Initial release of Restaurant Matcher. Find where to eat together!
```

### 7D. Screenshots (required)
Required sizes:
- iPhone 6.7" (1290×2796): 3-5 screenshots
- iPhone 6.5" (1242×2688): 3-5 screenshots (or same as 6.7")
- iPad Pro 12.9" (2048×2732): if you enable iPad

Suggested screenshots:
1. Welcome screen with app name
2. Lobby with session code visible
3. Restaurant card mid-swipe with YES overlay
4. Match modal (celebration screen)
5. Google Maps view

### 7E. Submit for review
1. Build must be uploaded (EAS submit does this automatically):
```bash
npm run submit:ios
```
2. Select the build in App Store Connect
3. Answer export compliance (No encryption)
4. Submit for Review

**Review time**: typically 1-3 business days for first submission.

---

## Phase 8 — Google Play Console (Android)

### 8A. Create app
1. Go to https://play.google.com/console
2. **Create app**
   - App name: `Restaurant Matcher`
   - Default language: English
   - App/Game: App
   - Free/Paid: Free

### 8B. Store listing
- **Short description** (80 chars):
  ```
  Swipe to find where your group agrees to eat — in real time.
  ```
- **Full description**: Use the same text as the App Store description above
- **Category**: Food & Drink
- **Tags**: Restaurants, Food, Social

### 8C. Data safety section (required)
Answer the Play Console questionnaire:

| Data type | Collected | Shared | Required |
|---|---|---|---|
| Approximate location | No | No | — |
| Precise location | Yes | No (only sent to Google Places) | For core functionality |
| Name | Yes | No (session only) | For core functionality |
| User IDs | Yes (anonymous Firebase ID) | No | For core functionality |
| App interactions | No | No | — |

- **Is data encrypted in transit?** Yes
- **Can users request deletion?** Yes (by uninstalling the app)

### 8D. Content rating
Complete the content rating questionnaire:
- Violence: None
- Sexual content: None
- → Result: **Everyone (E)**

### 8E. Upload build and submit
```bash
# Create service account for automated submissions:
# Play Console → Setup → API access → Create service account
# Download JSON key → save as google-play-service-account.json (gitignored)

npm run submit:android
```

Or upload the `.aab` file manually via Play Console → Production → Create new release.

**Review time**: typically 1-7 business days for first submission.

---

## Phase 9 — Post-Launch Checklist

- [ ] Monitor Firebase Console for errors / unusual activity
- [ ] Set up Firestore budget alerts in Google Cloud Console
- [ ] Restrict all Google API keys by bundle ID / SHA-1
- [ ] Set Firestore delete sessions > 24h Cloud Function (optional cleanup)
- [ ] Set up EAS Update for instant OTA bug fixes: `eas update --branch production`
- [ ] Respond to App Store / Play Store reviews
- [ ] Update Firestore security rules from permissive → strict as usage grows

---

## OTA Updates (No Store Re-Submission Required)

For JavaScript-only bug fixes and small UI changes, use EAS Update:

```bash
eas update --branch production --message "Fix: swipe card photo loading"
```

Users receive the update automatically on next app launch. No App Review needed.
Only use full builds for native code changes (new permissions, dependencies with native modules).

---

## App Store Metadata Summary

| Field | Value |
|---|---|
| App Name | Restaurant Matcher |
| Bundle ID | com.restaurantmatcher.app |
| Category | Food & Drink |
| Age Rating | 4+ / Everyone |
| Price | Free |
| In-App Purchases | None |
| Primary Language | English (US) |
| Devices | iPhone (iOS 13+), Android 8.0+ |
| Privacy Policy | Required — host at a public URL |
