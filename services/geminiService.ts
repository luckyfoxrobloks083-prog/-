import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AppConfig, Message, Sender } from "../types";

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const streamResponse = async (
  history: Message[],
  newMessage: string,
  config: AppConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getClient();
  
  // Convert internal message format to API format
  // We filter out the very last message if it was optimistically added to UI state already
  // or we can just send the history as context.
  // The SDK chat helper manages history, but since we allow "editing everything" in Admin mode,
  // we rebuild the chat context on every turn to ensure the AI sees the *exact* current state.
  
  const historyForApi = history.map(msg => ({
    role: msg.sender === Sender.USER ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const chat: Chat = ai.chats.create({
    model: config.modelName,
    history: historyForApi,
    config: {
      systemInstruction: config.systemInstruction,
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
    },
  });

  let fullResponse = "";
  
  try {
    const resultStream = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullResponse += c.text;
        onChunk(fullResponse);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }

  return fullResponse;
};