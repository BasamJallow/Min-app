// Central konfiguration.
// Nøgler bliver liggende tomme her — udfyldes ved deploy eller via miljøvariabler.
// Skift USE_MOCK til false når Firebase/API er sat op.

export const USE_MOCK = true;

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Nøgle til det AI-API der senere skal evaluere fritekstsvar.
export const AI_API = {
  endpoint: '',
  apiKey: '',
};
