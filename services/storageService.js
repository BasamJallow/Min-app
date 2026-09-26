// Datalag for sessioner og progression.
// Nu: gemmer lokalt via AsyncStorage.
// Ved integration: skift indholdet i USE_MOCK-grenene ud med Firestore-kald
// (fx addDoc / getDocs på en 'sessions'-collection under den loggede bruger).
// Skærmene rører ikke ved dette — de kalder kun saveSession, getSessions, getProgress.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_MOCK } from '../config';

const SESSIONS_KEY = 'preppal.sessions';

async function readSessions() {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSession(session) {
  if (USE_MOCK) {
    const current = await readSessions();
    const next = [...current, session];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    return session;
  }

  // TODO: skriv til Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

export async function getSessions() {
  if (USE_MOCK) {
    const list = await readSessions();
    // Nyeste først.
    return list.slice().sort((a, b) => b.date - a.date);
  }

  // TODO: hent fra Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Samler statistik pr. kategori og totalt XP.
// Ved Firestore vil samme funktion aggregere over brugerens dokumenter.
export async function getProgress() {
  if (USE_MOCK) {
    const list = await readSessions();
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

    for (const key of Object.keys(perCategory)) {
      const b = perCategory[key];
      b.pct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
    }

    return { perCategory, xp, sessions: list.length };
  }

  // TODO: hent aggregerede tal fra Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}
