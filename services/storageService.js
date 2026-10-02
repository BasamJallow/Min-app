// Datalag for sessioner og progression. Skærmene kalder kun saveSession, getSessions, getProgress.
// Ved Firebase-integration: udfyld firebaseConfig i /config.js og erstat USE_LOCAL_STORAGE-grenene
// med Firestore-kald på en 'sessions'-collection under den loggede bruger (addDoc, getDocs, where('jobId', '==', …)).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_LOCAL_STORAGE } from '../config';

const SESSIONS_KEY = 'preppal.sessions';

async function readSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSession(session) {
  if (USE_LOCAL_STORAGE) {
    const current = await readSessions();
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify([...current, session]));
    } catch {
      // Gemning fejlede — brugeren kan stadig se sit resultat.
    }
    return session;
  }

  // TODO: skriv til Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Nyeste først.
export async function getSessions() {
  if (USE_LOCAL_STORAGE) {
    const list = await readSessions();
    return list.slice().sort((a, b) => b.date - a.date);
  }

  // TODO: hent fra Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Statistik pr. kategori og samlet XP. Med jobId tælles kun det opslags sessioner.
export async function getProgress(jobId) {
  if (USE_LOCAL_STORAGE) {
    const all = await readSessions();
    const list = jobId ? all.filter((s) => s.jobId === jobId) : all;
    const perCategory = {};
    let xp = 0;

    for (const s of list) {
      xp += s.xp || 0;
      const bucket = perCategory[s.categoryKey] || { correct: 0, total: 0, sessions: 0 };
      bucket.correct += s.score || 0;
      bucket.total += s.total || 0;
      bucket.sessions += 1;
      perCategory[s.categoryKey] = bucket;
    }

    for (const b of Object.values(perCategory)) {
      b.pct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
    }

    return { perCategory, xp, sessions: list.length };
  }

  // TODO: hent aggregerede tal fra Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}
