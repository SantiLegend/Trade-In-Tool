// This file should be placed in the `api` directory of your project.
// It's a serverless function that acts as a secure proxy for chat functionality.
// It assumes a Vercel-like hosting environment.

import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set on the server");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The Gemini API requires a specific format for conversation history.
// It must alternate between 'user' and 'model' roles, starting with 'user'.
// This function ensures the history is correctly formatted.
const formatChatHistoryForApi = (history: ChatMessage[]): Content[] => {
    // Find the first user message to start the sequence
    const firstUserIndex = history.findIndex(m => m.role === 'user');
    if (firstUserIndex === -1) {
        // If no user messages, just send the last model message if it exists
        const lastMessage = history[history.length - 1];
        return lastMessage ? [{ role: lastMessage.role, parts: [{ text: lastMessage.text }] }] : [];
    }
    
    const relevantHistory = history.slice(firstUserIndex);
    return relevantHistory.map(message => ({
        role: message.role,
        parts: [{ text: message.text }]
    }));
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    const { systemInstruction, history } = req.body as { systemInstruction: string; history: ChatMessage[] };

    if (!systemInstruction || !history || history.length === 0) {
        return res.status(400).json({ error: "Missing systemInstruction or history in request" });
    }
    
    // Fix: Use the new `ai.chats.create` API to start a chat session.
    // This replaces the deprecated `getGenerativeModel` and `startChat` methods.
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formatChatHistoryForApi(history.slice(0, -1)), // History up to the last message
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    const lastMessage = history[history.length - 1];
    
    // Fix: Use the new `sendMessage` format which takes an object, and directly get the response.
    const response: GenerateContentResponse = await chat.sendMessage({ message: lastMessage.text });
    // Fix: Extract text using the `.text` property as per the new API.
    const text = response.text;

    res.status(200).json({ text });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    res.status(500).json({ error: message });
  }
}
