# Genkit Story Generator Example

The Genkit Story Generator is an AI-powered web application that allows users to generate  stories based on a given topic and desired length. It features a simple  user interface built with Next.js on the frontend, and a backend using Node.js, TypeScript, Express, and Genkit (for accesss Gemini) for story generation.

## 📁 Project Structure
```
genkit-story-generator/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   └── prompts/
│   │   └── story-generator.prompt
└── frontend/
   └── src/
       └──app/
         ├── layout.tsx
         ├── page.tsx
         └── globals.css
```
## 🛠️ Getting Started

Follow these steps to get your development environment set up.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/marb2000/genkit-story-generator.git](https://github.com/marb2000/genkit-story-generator.git)
    cd genkit-story-generator
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install # or yarn install
    cd ..
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd frontend
    npm install # or yarn install
    cd ..
    ```

4.  **Configure Environment Variables (Backend):**
    Create a `.env` file in the `backend` directory with your Google AI API key:
    ```
    GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
    PORT=3001
    ```
    Replace `YOUR_GEMINI_API_KEY` with your actual API key from Google AI Studio.

### Running the Application

1.  **Start the Backend Server (with Genkit UI Debugger):**
    Open a new terminal, navigate to the `backend` directory, and run:
    ```bash
    cd backend
    npm run genkit:dev
    ```
    This command will start the backend server, typically on `http://localhost:3001`, and also launch the Genkit Developer UI in development mode. You should see console messages indicating both are running, including the URL for the Genkit Developer UI (typically `http://localhost:4000`).

2.  **Start the Frontend Development Server:**
    Open another terminal, navigate to the `frontend` directory, and run:
    ```bash
    cd frontend
    npm run dev
    ```
    This will start the Next.js development server, usually on `http://localhost:3000`.

3.  **Access the Application:**
    Open your web browser and go to `http://localhost:3000`.

## 🧪 How to Test the Solution

To test the story generator, follow these steps:

1.  Ensure both the backend and frontend servers are running as described in the "Running the Application" section.
2.  Navigate to `http://localhost:3000` in your web browser.
3.  In the "What's your story about?" input field, type a topic for your story (e.g., "A futuristic city under the sea").
4.  Adjust the "Story length" slider to your desired word count (between 10 and 2000).
5.  You can also click on one of the "Sample Topics" buttons to quickly populate the topic field.
6.  Click the "Generate Story" button.

### Expected Behavior:

* The button will change to "Generating your story..." with a spinner.
* After a short period (depending on the story length and API response time), the generated story will appear in the "Your Story" section below the form.
* If there are any issues (e.g., backend not running, invalid input), an error message will be displayed in red below the "Generate Story" button.
* The Genkit Developer UI (typically at `http://localhost:4000`) will show the traces of the `generateStory` flow executions, allowing you to inspect the inputs, outputs, and model calls.

This allows you to verify that both the frontend and backend are communicating correctly and that the Genkit AI flow is successfully generating stories.
