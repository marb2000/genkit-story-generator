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
  length: z.number().min(10, 'Length must be at least 10').max(2000, 'Length must be at most 2000').default(250),
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
       
    // Validate input with Zod 
    const validation = StoryInputSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        error: validation.error.errors[0].message 
      });
      return;
    }

    const { topic, length } = validation.data;
    //Generate the Story with Genkit
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