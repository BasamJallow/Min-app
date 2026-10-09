// Datalag for sessioner, jobopslag og progression.
// Ved Firebase-integration: udfyld firebaseConfig i /config.js og erstat USE_LOCAL_STORAGE-grenene
// med Firestore-kald på 'sessions'- og 'jobs'-collections under den loggede bruger
// (addDoc/setDoc, getDocs, deleteDoc, where('jobId', '==', …)). Signaturerne bevares.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_LOCAL_STORAGE } from '../config';

const SESSIONS_KEY = 'preppal.sessions';
const JOBS_KEY = 'preppal.jobs';
const SUBSCRIPTION_KEY = 'preppal.subscription';
const MAX_JOBS = 20;

async function readList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeList(key, list) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Gemning fejlede — appen kører videre med det, der er i hukommelsen.
  }
}

const readSessions = () => readList(SESSIONS_KEY);

// Samler sessioner til procent pr. kategori og samlet XP.
function aggregate(list) {
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

export async function saveSession(session) {
  if (USE_LOCAL_STORAGE) {
    const current = await readSessions();
    await writeList(SESSIONS_KEY, [...current, session]);
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
    return aggregate(list);
  }

  // TODO: hent aggregerede tal fra Firestore her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Gemmer et analyseret opslag (titel, kompetencer og spørgsmål), så det kan åbnes igen uden nyt AI-kald.
export async function saveJob(job) {
  if (USE_LOCAL_STORAGE) {
    const rest = (await readList(JOBS_KEY)).filter((j) => j.jobId !== job.jobId);
    await writeList(JOBS_KEY, [job, ...rest].slice(0, MAX_JOBS));
    return job;
  }

  // TODO: setDoc i 'jobs'-collection her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Nyeste først, hver med progression for netop det opslag.
export async function getJobs() {
  if (USE_LOCAL_STORAGE) {
    const [jobs, sessions] = await Promise.all([readList(JOBS_KEY), readSessions()]);
    return jobs
      .slice()
      .sort((a, b) => b.date - a.date)
      .map((j) => ({ ...j, progress: aggregate(sessions.filter((s) => s.jobId === j.jobId)) }));
  }

  // TODO: hent fra 'jobs'-collection her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

export async function getJob(jobId) {
  if (USE_LOCAL_STORAGE) {
    return (await readList(JOBS_KEY)).find((j) => j.jobId === jobId) || null;
  }

  // TODO: getDoc i 'jobs'-collection her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Sletter kun opslaget — sessionerne bliver i historikken.
export async function deleteJob(jobId) {
  if (USE_LOCAL_STORAGE) {
    const rest = (await readList(JOBS_KEY)).filter((j) => j.jobId !== jobId);
    await writeList(JOBS_KEY, rest);
    return;
  }

  // TODO: deleteDoc i 'jobs'-collection her.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Kompetencer for et opslag på tværs af sessioner: +1 hver gang den blev vist, −1 når den manglede.
// Returnerer { sessions, weak } — weak er de svageste kompetencer (score ≤ 0), svageste først.
export async function getWeakSkills(jobId, max = 3) {
  if (USE_LOCAL_STORAGE) {
    const sessions = (await readSessions()).filter((s) => s.jobId === jobId);
    const score = {};
    for (const s of sessions) {
      for (const skill of s.strong || []) score[skill] = (score[skill] || 0) + 1;
      for (const skill of s.weak || []) score[skill] = (score[skill] || 0) - 1;
    }
    const weak = Object.keys(score)
      .filter((skill) => score[skill] <= 0)
      .sort((a, b) => score[a] - score[b])
      .slice(0, max);
    return { sessions: sessions.length, weak };
  }

  // TODO: hent opslagets sessioner fra Firestore og tæl på samme måde.
  throw new Error('Firebase er ikke koblet på endnu.');
}

// Abonnementsstatus for PrepPal Pro: { active, test, since } eller null.
export async function getSubscription() {
  if (USE_LOCAL_STORAGE) {
    try {
      const raw = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // TODO: læs fra brugerens dokument i Firestore (sat af en Stripe-webhook i en Cloud Function).
  throw new Error('Firebase er ikke koblet på endnu.');
}

export async function saveSubscription(subscription) {
  if (USE_LOCAL_STORAGE) {
    try {
      if (subscription) await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
      else await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    } catch {
      // Gemning fejlede — status vises igen næste gang.
    }
    return subscription;
  }

  // TODO: skrives af Stripe-webhooken i en Cloud Function, ikke af appen.
  throw new Error('Firebase er ikke koblet på endnu.');
}
