# Using Firebase AI Logic Plugin with Genkit

This guide shows how to integrate the Firebase AI Logic plugin with your Genkit project for secure, client-side AI applications.

## Getting the Plugin

Since the plugin is not yet published to NPM, you can get it from the GitHub repository:

**Repository**: https://github.com/marb2000/genkitx-firebase-ai-logic

## Local NPM Link Setup (Development)

### 1. Link the Plugin

```bash
# Clone and prepare the plugin
git clone https://github.com/marb2000/genkitx-firebase-ai-logic.git
cd genkitx-firebase-ai-logic

# Build and link the plugin
npm install
npm run build
npm link

# In your target project directory
npm link genkitx-firebase-ai-logic
```

### 2. Install Dependencies

```bash
# In your project directory
npm install genkit firebase dotenv
npm install -D typescript @types/node
```

## Configuration

### 1. Environment Setup

Create a `.env` file in your project root:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Initialize the Plugin

```typescript
import 'dotenv/config';
import { genkit } from 'genkit';
import { firebaseAILogic } from 'genkitx-firebase-ai-logic';

// Load Firebase configuration from environment variables
const TEST_FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize AI instance
const ai = genkit({
  plugins: [
    firebaseAILogic({
      firebaseConfig: TEST_FIREBASE_CONFIG,
      backend: 'vertexAI',
      vertexAIRegion: 'us-central1'
    })
  ]
});
```

## Usage

### In Code Without Dotprompt

```typescript
// Generate content using the plugin
const { text } = await ai.generate({
  model: firebaseAILogic.model('gemini-2.5-flash'),
  prompt: 'Write a haiku about coding'
});

console.log(text);
```

### In dotPrompt Files

When using dotPrompt files, specify the model using the Genkit protocol format:

```yaml
---
model: firebase-ai-logic/gemini-2.5-flash
config:
  temperature: 0.7
  maxOutputTokens: 1000
---

Write a {{type}} about {{topic}}.
```


```typescript
// Define the AI story generation flow using Genkit
const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStory',
  },
  async (input) => {
    // Load the story generation prompt from file
    const storyPrompt = ai.prompt('story-generator');
    const { output } = await storyPrompt({
      topic: input.topic,
      length: input.length
    });
    return output.story;
  }
);
```

## Backend Options

### Vertex AI 

```typescript
backend: 'vertexAI',
vertexAIRegion: 'us-central1'
```

### Google AI (Developer API)

```typescript
backend: 'googleAI'
```


## Troubleshooting

**Plugin not found**: Make sure you ran `npm link` in both directories  
**Environment variables missing**: Check your `.env` file has all required Firebase config  
**Backend errors**: Verify your Firebase project has the correct backend enabled and billing configured

