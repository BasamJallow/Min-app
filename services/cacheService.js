// Lokal cache af AI-analyser, så det samme opslag ikke koster tokens to gange.
// Ligger altid på telefonen (AsyncStorage) — også efter Firebase-integration.

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'preppal.analysisCache';
const MAX_ENTRIES = 20;

// Kort, stabil nøgle ud fra opslagets tekst og modellen.
export function analysisKey(jobPost, model) {
  const text = `${model}|${jobPost.trim().replace(/\s+/g, ' ').toLowerCase()}`;
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 33) ^ text.charCodeAt(i)) >>> 0;
  }
  return `${hash.toString(36)}-${text.length}`;
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getCachedAnalysis(key) {
  const entry = (await readCache()).find((e) => e.key === key);
  return entry ? entry.value : null;
}

// Nyeste først; de ældste smides ud, når cachen er fuld.
export async function saveCachedAnalysis(key, value) {
  const rest = (await readCache()).filter((e) => e.key !== key);
  const next = [{ key, value }, ...rest].slice(0, MAX_ENTRIES);
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // Cachen er kun en besparelse — appen virker også uden.
  }
}
