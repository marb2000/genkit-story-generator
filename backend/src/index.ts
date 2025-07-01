import express, { Request, Response } from 'express';
import cors from 'cors';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file like APIKEY and PORT
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests e.g. calls fron the fronted site
app.use(express.json()); // Parse JSON bodies

// Configure Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()]
});

// Zod schemas for validation
const StoryInputSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  length: z.number().min(10).max(2000).default(250),
});
const StoryOutputSchema = z.string();

// Load the story generation prompt from file
/*const storyPrompt = ai.prompt('story-generator');
 // Generate the story using the prompt file with system instructions
    const result = await storyPrompt({
      input: {
        topic: topic,
        length: length
      }
    });
    return result.text;
    */

// Define the AI story generation flow using Genkit
const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStory',
    inputSchema: StoryInputSchema,
    outputSchema: StoryOutputSchema,
  },
  async (input) => {
    const { topic, length } = input;

    // Load the prompt from the external file
    const storyPrompt = `You are a creative and engaging storyteller. 
    Write a short story about the given topic with the approximate length specified. 
    Topic: ${input.topic} and Length: ${input.length} words.`;

    // Generate the story using the Gemini Pro model
    const result  = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: storyPrompt,
      config: {
        temperature: 0.9 // High creativity for stories
      },
    });
    return result.text;
  }
);

// API endpoint for story generation
app.post('/api/generate-story', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, length } = req.body;
    
    // Validate input
    if (!topic || !length) {
      res.status(400).json({ 
        error: 'Topic and length are required' 
      });
      return;
    }

    // Additional validation
    if (typeof topic !== 'string' || topic.trim().length === 0) {
      res.status(400).json({ 
        error: 'Topic must be a non-empty string' 
      });
      return;
    }

    if (typeof length !== 'number' || length < 10 || length > 2000) {
      res.status(400).json({ 
        error: 'Length must be a number between 10 and 2000' 
      });
      return;
    }

    // Generate the story using the Genkit flow with system instructions
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