export enum Sender {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
}

export interface AppConfig {
  systemInstruction: string;
  modelName: string;
  temperature: number;
  topK: number;
  topP: number;
  isSystemActive: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  systemInstruction: "Ты НЕЙРОБОТ, полезный и умный искусственный интеллект.",
  modelName: "gemini-2.5-flash",
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  isSystemActive: true
};

export const ADMIN_CODE = "Loksboxfox";