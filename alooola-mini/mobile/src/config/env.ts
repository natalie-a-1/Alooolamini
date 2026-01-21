/**
 * Environment configuration for the mobile app.
 */

import Constants from 'expo-constants';

function getDevHost(): string | null {
  // Prefer Expo's dev host info when running via Expo Go / dev server.
  // Examples:
  // - hostUri: "192.168.1.79:8081"
  // - debuggerHost: "192.168.1.79:8081"
  const hostUri = Constants.expoConfig?.hostUri;
  const debuggerHost =
    // Expo Go config (recommended path in newer SDKs)
    (Constants.expoConfig as any)?.extra?.expoGo?.debuggerHost ??
    // Fallbacks for older/alternate manifest shapes
    (Constants as any)?.expoGoConfig?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;

  const source: string | undefined = hostUri ?? debuggerHost;
  if (!source) return null;

  // Strip port if present
  return source.split(':')[0] ?? null;
}

function getLocalApiBaseUrl() {
  // Physical device cannot reach your laptop via "localhost".
  // Derive the dev machine's IP from the Expo dev server URL.
  const host = getDevHost() ?? 'localhost';
  return `http://${host}:4000/api/v1`;
}

export const config = {
  // Optional override:
  //   EXPO_PUBLIC_API_BASE_URL="https://alooola-mini-api.onrender.com/api/v1" npm run dev:mobile
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    (__DEV__ ? getLocalApiBaseUrl() : 'https://alooola-mini-api.onrender.com/api/v1'),
};
