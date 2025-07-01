import express, { Request, Response } from 'express';
import cors from 'cors';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file like APIKEY and PORT
dotenv.config();

// Configure Genkit with Google AI getting the APIKEY from .env
const ai = genkit({
  plugins: [googleAI()]
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