// Dynamic Expo config — reads secrets from environment variables.
// In development: copy .env.example → .env and fill in real values.
// In EAS builds:  set secrets with `eas secret:create` or the EAS dashboard.
// DO NOT hard-code real API keys here.

export default ({ config }) => ({
  ...config,

  // ── iOS ──────────────────────────────────────────────────────────────────
  ios: {
    ...config.ios,
    supportsTablet: false,
    bundleIdentifier: 'com.restaurantmatcher.app',
    buildNumber: '1',
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY ?? '',
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Restaurant Matcher shows restaurants near you so your group can vote on where to eat.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Restaurant Matcher shows restaurants near you so your group can vote on where to eat.',
      NSCalendarsUsageDescription:
        'Restaurant Matcher saves your matched restaurant as a calendar event so you never forget where you are going.',
      // iOS 17+ privacy manifest — declare which system APIs the app accesses
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePreciseLocation',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeName',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
      ],
    },
  },

  // ── Android ──────────────────────────────────────────────────────────────
  android: {
    ...config.android,
    package: 'com.restaurantmatcher.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FF6B35',
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? '',
      },
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'READ_CALENDAR',
      'WRITE_CALENDAR',
    ],
  },

  // ── OTA Updates (expo-updates) ────────────────────────────────────────────
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID ?? 'YOUR_EAS_PROJECT_ID'}`,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },

  // ── Runtime secrets exposed via Constants.expoConfig.extra ───────────────
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? 'YOUR_EAS_PROJECT_ID',
    },
    // Google Places (server-side fetch in the app — restrict by bundle ID in GCP)
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
    // Firebase Web SDK config
    firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    firebaseAppId: process.env.FIREBASE_APP_ID ?? '',
  },
});
