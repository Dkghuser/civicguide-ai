import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { getDeadlinesForLocation } from './.agents/skills/voter-verify/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment. AI features will fail.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const civicModel = "gemini-3.1-flash-lite-preview";

// Fact-Checker + Lead Agent for Roadmap
app.post('/api/roadmap', async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  
  const { location, age } = req.body;
  if (!location || !age) {
    return res.status(400).json({ error: "Location and age are required" });
  }

  // FACT-CHECKER AGENT: Get real deadlines
  const deadlines = getDeadlinesForLocation(location);

  const prompt = `
    Generate a step-by-step 'Voter Roadmap' for a user based on the following:
    Location: ${location}
    Age: ${age}

    The current date is ${new Date().toLocaleDateString()}.
    
    IMPORTANT: Use the following official deadlines provided by the Fact-Checker Agent:
    - Registration Deadline: ${deadlines.registration}
    - Verification Deadline: ${deadlines.verification}
    - Polling Day: ${deadlines.pollingDay}
    
    The response should be in JSON format with the following structure:
    {
      "steps": [
        {
          "title": "Short title",
          "description": "Clear explanation using a simple analogy",
          "deadline": "Specific date or time range",
          "status": "pending"
        }
      ],
      "advice": "General friendly advice"
    }

    Include at least 4 steps: Registration, Verification, Research, and Polling Day.
    Ensure the deadlines match the provided official dates.
    Ensure the tone is friendly, non-partisan, and extremely clear.
  `;

  try {
    const response = await ai.models.generateContent({
      model: civicModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

// Lead Agent for Chat (Streaming)
app.post('/api/chat/stream', async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const formattedContents = history ? history.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  })) : [{ role: 'user', parts: [{ text: message }] }];

  const systemInstruction = `
    You are 'CivicGuide AI', a comprehensive and friendly non-partisan election assistant.
    Your goal is to provide a complete overview of the election procedure for the user's selected region, including step-by-step process flows, registration links (if applicable), and polling day preparations.
    
    GUIDELINES:
    1. Comprehensive Overviews: When a user selects a region or asks about the process, outline the full journey (Registration -> Verification -> Polling Day -> Results).
    2. Fact-Checking & Doubt Clearing: Proactively address common doubts and questions. 
    3. Misinformation Correction: If a user asks a question that touches on an 'Election Myth' (e.g., 'Can I vote without a physical ID?', 'Does voting by mail lead to fraud?'), gently correct it with factual procedures based on standard democratic norms.
    4. Regional Context: You have access to the conversation history. Always frame your advice based on the user's specific location and age.
    5. Always remain strictly non-partisan and encouraging.
  `;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await ai.models.generateContentStream({
      model: civicModel,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Error in chat stream:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to process chat stream" })}\n\n`);
    res.end();
  }
});

// Route to update roadmap progress
app.post('/api/roadmap/update', async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  
  const { history, roadmap } = req.body;
  if (!history || !roadmap) return res.status(400).json({ error: "Missing parameters" });

  const prompt = `
    Given the following conversation history and the current voter roadmap, determine if the user has completed any steps, or if the current step should change.
    Return the updated roadmap steps exactly matching the input structure, but with updated 'status' fields ('completed', 'current', or 'pending').

    Conversation History:
    ${JSON.stringify(history.slice(-4))}

    Current Roadmap:
    ${JSON.stringify(roadmap)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: civicModel,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

// Production: Serve Vite build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
