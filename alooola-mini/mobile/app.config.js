/**
 * Expo configuration for the Alooola Mini mobile app.
 */
export default {
  expo: {
    name: 'Alooola Mini',
    slug: 'alooola-mini',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#f5f5f0',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.alooola.mini',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#f5f5f0',
      },
      package: 'com.alooola.mini',
    },
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
    },
    scheme: 'alooolamini',
  },
};
