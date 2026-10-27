# 03 · Expo SDK 58 upgrade

**Date:** 26 October 2026 · **Tool:** Claude Code (Claude Opus 5.5)

## 1. The prompt

**Verbatim:**

```text
upgrade expo 

fix

[https://expo.dev/go?sdkVersion=57&platform=ios&device=false](Learn how to install Expo Go for SDK 57 in an iOS Simulator.)
iOS  ERROR  Project is incompatible with this version of Expo Go


```

- **Module/Feature:** the project's dependencies, meaning the Expo SDK version.
- **Constraints:** the app must open in the current store version of Expo Go, which only supports SDK 58.
- **Specifics:**
  - Upgrade Expo and fix the "Project is incompatible with this version of Expo Go" error.
  - Create an AI log folder.

## 2. The output

The AI upgraded Expo from 57.0.31 to 58.0.19. That brought React Native 0.88, React 19.3, Expo Router 58 and matching versions of Reanimated, Screens, SVG, Maps, Jest and the ESLint config. The new types caused one compile error, in the driver request list (`src/features/driver/DriverHome.tsx`), which the AI fixed. It also changed the SDK version mentioned in the README and the report. The dependency list after the upgrade:

```json
{
  "dependencies": {
    "@rn-primitives/avatar": "^1.5.2",
    "@rn-primitives/label": "^1.5.2",
    "@rn-primitives/portal": "^1.5.3",
    "@rn-primitives/separator": "^1.5.2",
    "@rn-primitives/slot": "^1.5.2",
    "@rn-primitives/switch": "^1.5.2",
    "@supabase/supabase-js": "^2.118.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "expo": "^58.0.0",
    "expo-constants": "~58.0.13",
    "expo-linking": "~58.0.14",
    "expo-location": "~58.0.19",
    "expo-router": "~58.0.26",
    "expo-sqlite": "~58.0.14",
    "expo-status-bar": "~58.0.4",
    "lucide-react-native": "^1.61.0",
    "nativewind": "4.2.7",
    "react": "19.3.0",
    "react-native": "0.88.0",
    "react-native-maps": "1.29.11",
    "react-native-reanimated": "4.7.1",
    "react-native-safe-area-context": "~5.10.1",
    "react-native-screens": "~4.30.0",
    "react-native-svg": "15.16.0",
    "react-native-worklets": "0.13.0",
    "tailwind-merge": "^3.7.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/jest": "30.0.0",
    "@types/react": "~19.3.0",
    "docx": "^9.5.0",
    "eslint": "^9.39.0",
    "eslint-config-expo": "~58.0.4",
    "jest": "~30.5.2",
    "jest-expo": "~58.0.12",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.17",
    "typescript": "~6.0.3"
  }
}
```

Entry 05 later removed the packages it no longer used (Reusables, Supabase, maps, location, SQLite, docx) and added `@react-native-community/datetimepicker` 9.2.1.

The same prompt asked for an AI log folder. This log replaces that folder and follows the course's documentation guidelines.

## 3. Critical analysis and adaptation

**Changes:** we made no edits. The AI kept NativeWind on its 4.2.7 stable release.

**Verification**

- Typecheck, lint and all 26 Jest tests passed, and `expo-doctor` passed all 20 checks.
- The app opened in Expo Go 58.0.7 on the iPhone 16 Pro simulator, so the incompatibility error was gone. Sign-in, rider home, active ride, driver home, driver trip and trip history all rendered with no runtime errors.

## 4. Rationale

An SDK upgrade moves about twenty Expo packages to matching versions at once, which is error-prone by hand. The AI moved every package to its SDK 58 version and fixed the one compile error that caused. We judged it by one clear result: the app had to open in the current Expo Go.
