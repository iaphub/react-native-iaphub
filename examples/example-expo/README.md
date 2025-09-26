# Expo Sample App (SDK 54)

This is a minimal one-page React Native app created with Expo SDK 54.

## Quickstart

```bash
# Install dependencies
npm install

# Start the Metro bundler
npm run start

# Or launch directly to a platform
npm run ios
npm run android
npm run web
```

When the bundler starts, use the on-screen instructions to open the app in iOS Simulator, Android Emulator, or a device.

## What’s included
- Single screen with a title, subtitle, and a button
- Tapping the button logs a message and shows a native alert

## IAPHUB setup (optional)
1. Install the SDK (already done):
   ```bash
   npm install react-native-iaphub
   ```
2. Initialize in `App.js` with your credentials:
   ```js
   import Iaphub from 'react-native-iaphub';
   Iaphub.start({
     appId: 'YOUR_IAPHUB_APP_ID',
     apiKey: 'YOUR_IAPHUB_API_KEY',
     enableStorekitV2: true,
     lang: 'en',
   });
   ```
3. Replace placeholders with values from the IAPHUB dashboard.

## File of interest
- `App.js`: main UI (single screen)

