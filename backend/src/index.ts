import express, { Request, Response } from 'express';
import cors from 'cors';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';
import * as dotenv from 'dotenv';
import { firebaseAILogic } from 'genkitx-firebase-ai-logic';


// Load environment variables from .env file like APIKEY and PORT
dotenv.config(); //TODO: Firebase AI Logic doesn't do this

// Validate required environment variables
function validateEnvVars() {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Validate environment variables
validateEnvVars();

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

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors()); // Allow cross-origin requests e.g. calls fron the fronted site
app.use(express.json()); // Parse JSON bodies

// API endpoint for story generation
app.post('/api/generate-story', async (req: Request, res: Response): Promise<void> => {
  try {

    // Zod schemas for validation
    const StoryInputSchema = z.object({
      topic: z.string().min(3, "Topic must be at least 3 characters long."),
      length: z.number().min(10, 'Length must be at least 10').max(2000, 'Length must be at most 2000').default(250),
    });
    // Validate input with Zod 
    const validation = StoryInputSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: validation.error.errors[0].message
      });
      return;
    }

    const { topic, length } = validation.data;
    //Generate the Story with Genkit Flow
    const story = await generateStoryFlow({
      topic: topic.trim(),
      length: Number(length)
    });

    res.json({ story });

  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({
      error: 'Failed to generate story. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response): void => {
  res.json({
    status: 'OK',
    message: 'Backend is running'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Genkit Developer UI: http://localhost:4000`);
});