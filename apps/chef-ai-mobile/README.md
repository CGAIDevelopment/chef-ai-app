# Chef AI Mobile App

A mobile application for generating recipes using AI technology. This app allows users to:
- Generate custom recipes based on text prompts
- Take photos of ingredients to get recipe suggestions
- Save and organize favorite recipes
- View detailed nutritional information

## Features

- **AI-Powered Recipe Generation**: Create unique recipes based on your preferences
- **Ingredient Detection**: Upload photos of ingredients to get recipe suggestions
- **Recipe Management**: Save, categorize, and search through your recipe collection
- **Nutritional Information**: View detailed nutritional breakdown for each recipe
- **Cross-Platform**: Works on both iOS and Android devices

## OpenAI Integration

This app integrates with OpenAI's API to provide powerful AI recipe generation and image analysis capabilities. The integration includes:

1. **Recipe Generation**: Uses GPT-4 to create detailed recipes based on user prompts
2. **Image Analysis**: Uses Vision API to identify ingredients in photos
3. **Image Generation**: Creates appetizing images for recipes using DALL-E

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- Yarn or npm
- Expo CLI
- OpenAI API key

### Installation

1. Clone the repository
2. Navigate to the mobile app directory:
```bash
cd apps/chef-ai-mobile
```
3. Install dependencies:
```bash
npm install
```

### Environment Configuration

1. Create a `.env` file in the `apps/chef-ai-mobile` directory with the following contents:
```
OPENAI_API_KEY=your_openai_api_key_here
API_BASE_URL=https://api.chefai.app
ENV=dev
```

2. For development without an actual backend, the app includes mock implementations that simulate API responses.

### Using Your OpenAI API Key

To use your own OpenAI API key:

1. Sign up for an account at [OpenAI](https://openai.com)
2. Generate an API key in your account dashboard
3. Add the key to your `.env` file as shown above
4. Alternatively, you can set the key directly in `src/config/env.ts`

## Running the App

Start the Expo development server:

```bash
npm start
```

Then, you can:
- Scan the QR code with the Expo Go app on your phone
- Press 'a' to open in an Android emulator
- Press 'i' to open in an iOS simulator

## API Integration Details

The API integration is implemented in the following files:

- `src/lib/api.ts`: Main API client implementation
- `src/config/env.ts`: Environment configuration
- `app.config.js`: Expo configuration including environment variables

The API client handles:
- Recipe generation via text prompts
- Ingredient detection from images
- Recipe image generation

## Security Considerations

- The app uses secure storage for the API key
- In production, API keys should never be stored in client-side code
- For a production deployment, implement a backend service to proxy API requests to OpenAI

## Troubleshooting

### Common Issues

- **API Key Invalid**: Make sure your OpenAI API key is correctly set in the environment variables
- **Image Upload Fails**: Check camera permissions and ensure Expo Image Picker is properly installed
- **Recipe Generation Timeout**: OpenAI API may take longer to respond during high traffic periods

## License

[MIT License](LICENSE)

## Acknowledgments

- OpenAI for providing the API
- Expo for the mobile development framework
- The Chef AI team for the concept and design 