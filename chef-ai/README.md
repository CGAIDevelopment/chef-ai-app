# Chef AI - Your Personal AI-Powered Cooking Assistant

Chef AI is a next-generation cooking companion that leverages artificial intelligence to transform your cooking experience. The application helps you discover, generate, customize, and plan meals based on your personal preferences, available ingredients, and dietary requirements.

![Chef AI Logo](https://placeholder.com/logo.png)

## 🌟 Features

### 🧠 AI-Powered Recipe Generation
- **Custom Recipe Creation**: Generate personalized recipes based on ingredients, preferences, and dietary restrictions
- **Recipe Visualization**: AI-generated images of completed dishes
- **Real-time Recipe Adjustments**: Ask follow-up questions to modify recipes (e.g., "How can I make this vegan?")
- **Step-by-step Generation Process**: Track the AI's progress as it analyzes ingredients, crafts recipes, creates visualizations, and adds nutritional information

### 👤 User Profiles & Preferences
- **Customizable User Preferences**:
  - Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
  - Cooking skill level
  - Kitchen equipment inventory
  - Serving size preferences
  - Flavor preferences
  - Cuisine preferences
  - Food allergies
- **Profile Completeness Tracking**: Visual indicators of profile completion for better personalization
- **Personalized Recommendations**: AI-generated recipe suggestions based on user profile and previously generated recipes

### 📋 Recipe Management
- **Comprehensive Recipe Collections**:
  - All Recipes
  - To Try List
  - Private Recipes
  - Archived Recipes
  - Trash (for deleted recipes)
- **Recipe Details**: Ingredients, instructions, nutritional information, and serving sizes
- **Recipe Rating System**: Rate and comment on recipes
- **AI Recipe Modifications**: Generate variations of existing recipes

### 🗓️ Meal Planning
- **Weekly Meal Planner**: Organize your meals throughout the week
- **Calendar Integration**: View and manage your meal schedule
- **Flexible Planning**: Easily move recipes between days

### 📊 Dashboard & Analytics
- **Cooking Activity Overview**: View your cooking statistics at a glance
- **Recipe Collection Breakdown**: Visual representation of your recipe categories
- **Nutritional Insights**: Average calories and cooking time for your recipes

### 🔍 Search & Discovery
- **Advanced Recipe Search**: Find recipes by ingredients, cuisine type, or dietary restrictions
- **Quick Access Shortcuts**: Easily navigate to important features
- **Tag-based Filtering**: Filter recipes by tags like "Quick meals" or "Vegetarian"

### 🔐 User Authentication
- **Secure User Accounts**: Register, login, and manage your profile
- **Demo Account Option**: Try the app features without registration
- **Profile Management**: Update preferences and settings

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Dark/Light Mode Support**: Choose your preferred theme
- **Intuitive Navigation**: User-friendly sidebar and navigation structure
- **Interactive Components**: Drag-and-drop interfaces, toggles, and sliders for better user experience

## 🛠️ Technology Stack

- **Frontend**:
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS (for styling)
  - Radix UI (for accessible UI components)
  - Lucide React (for icons)
  - Zustand (for state management)
  - Sonner (for toast notifications)

- **Backend** (API Routes):
  - Next.js API Routes
  - OpenAI API integration for:
    - Recipe generation
    - Recipe image generation
    - Recipe modifications and suggestions
  - Data persistence with local storage (and API-ready structure)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/chef-ai.git
   cd chef-ai
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📱 Application Structure

```
chef-ai/
├── app/                 # Next.js app directory
│   ├── api/             # API routes for backend functionality
│   ├── dashboard/       # Dashboard page
│   ├── generate-recipes/# Recipe generation page
│   ├── meal-plan/       # Meal planning page
│   ├── user/            # User-related pages (login, profile, preferences)
│   └── ...              # Other pages (to-try, archive, etc.)
├── components/          # Reusable UI components
│   ├── ui/              # UI library components
│   └── ...              # App-specific components
├── lib/                 # Core application logic
│   ├── store.ts         # Recipe state management
│   ├── userStore.ts     # User state management
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## 🧩 Key Features in Detail

### AI Recipe Generation

The recipe generation process follows these steps:
1. **Analysis**: The AI analyzes user input ingredients and requirements
2. **Recipe Creation**: Crafts a personalized recipe with measurements and instructions
3. **Visualization**: Generates an image of the completed dish using AI
4. **Finishing Touches**: Adds nutritional information and final details

### User Preferences System

User preferences are stored in a comprehensive profile that includes:
- Dietary restrictions and allergies
- Cooking skill level
- Available kitchen equipment
- Serving size preference
- Flavor and cuisine preferences

These preferences influence recipe recommendations, generation, and modifications.

### Recipe Interaction

Users can:
- View detailed recipe information
- Ask follow-up questions about recipes
- Generate variations of recipes
- Rate and save recipes
- Organize recipes into collections

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for the AI capabilities
- [Next.js](https://nextjs.org/) for the application framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Zustand](https://github.com/pmndrs/zustand) for state management
