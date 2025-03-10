// App configuration for environment variables and app settings
export default {
  name: "Chef AI",
  slug: "chef-ai-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#4A7856"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.chefai.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#4A7856"
    },
    package: "com.chefai.mobile"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    // Environment variables - in a real app, these would be securely stored
    // and not checked into version control. This is for demonstration only.
    apiBaseUrl: process.env.API_BASE_URL || "https://api.chefai.app",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    env: process.env.ENV || "dev"
  },
  plugins: [
    "expo-image-picker"
  ]
}; 