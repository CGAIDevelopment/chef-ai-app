import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Environment configuration for the Chef AI mobile app
const ENV = {
  dev: {
    apiBaseUrl: 'https://api.chefai.app',
    openaiApiKey: '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', // Your API key
  },
  prod: {
    apiBaseUrl: 'https://api.chefai.app',
    openaiApiKey: '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', // Should be securely provided in production
  }
};

// Determine which environment we're running in
const getEnvVars = () => {
  const environment = Constants.expoConfig?.extra?.env || 'dev';
  
  // You could also use process.env if you're using a .env file with expo-dotenv
  if (environment === 'prod') {
    return ENV.prod;
  }
  
  return ENV.dev;
};

export default getEnvVars(); 