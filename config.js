// Central konfiguration. Nøgler læses fra .env (se .env.example) og står aldrig i koden.
// USE_MOCK slår automatisk fra, når der er en OpenAI-nøgle i .env.

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Expo indsætter kun EXPO_PUBLIC_-variabler, og kun når de skrives helt ud som her.
export const AI_API = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
};

export const USE_MOCK = !AI_API.apiKey;
