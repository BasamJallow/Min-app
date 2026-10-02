// Små hjælpefunktioner, så skærmene kun står for visning.

import { CATEGORIES } from './constants';

export function formatDate(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} · ${hh}:${mi}`;
}

export function streakFromXp(xp) {
  return Math.floor(xp / 40);
}

export function badgeFor(pct) {
  if (pct >= 80) return { emoji: '🏆', title: 'Fremragende!', sub: 'Du er klar til samtalen.' };
  if (pct >= 50) return { emoji: '💪', title: 'Godt gået', sub: 'Der er stadig plads til at skærpe et par svar.' };
  return { emoji: '📚', title: 'Godt forsøg', sub: 'Kør kategorien igen — gentagelse gør stor forskel.' };
}

// Renser en liste fra et AI-svar til ikke-tomme tekster.
export function stringList(value, max) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()).slice(0, max);
}

export function percent(score, total) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

// Én linje i opsamlingen efter et besvaret spørgsmål.
export function breakdownItem(question, result) {
  const short = question.prompt.length > 60 ? `${question.prompt.slice(0, 60)}…` : question.prompt;
  return {
    correct: !!result.correct,
    xp: result.xp,
    label: short,
    strong: result.strong || [],
    weak: result.weak || [],
  };
}

// Samler stærke og svage kompetencer på tværs af en kategori.
// En kompetence er stærk, hvis den oftere blev vist end den manglede.
export function skillSummary(breakdown) {
  const tally = {};
  for (const item of breakdown) {
    for (const s of item.strong || []) tally[s] = (tally[s] || 0) + 1;
    for (const s of item.weak || []) tally[s] = (tally[s] || 0) - 1;
  }
  const skills = Object.keys(tally);
  return {
    strong: skills.filter((s) => tally[s] > 0),
    weak: skills.filter((s) => tally[s] <= 0),
  };
}

// Vægtet gennemsnit af alle kategorier — ikke-gennemførte tæller som 0 %.
export function readiness(perCategory) {
  let sum = 0;
  let weights = 0;
  for (const c of CATEGORIES) {
    sum += (perCategory[c.key]?.pct || 0) * c.weight;
    weights += c.weight;
  }
  return weights > 0 ? Math.round(sum / weights) : 0;
}

// Samler en gennemført kategori til det objekt, storageService gemmer.
export function buildSession({ jobId, category, categoryKey, jobPreview, breakdown, total }) {
  const now = Date.now();
  return {
    id: now,
    date: now,
    jobId,
    category,
    categoryKey,
    jobPreview,
    score: breakdown.filter((b) => b.correct).length,
    total,
    xp: breakdown.reduce((sum, b) => sum + (b.xp || 0), 0),
    ...skillSummary(breakdown),
  };
}

// I React Navigation 7 åbner navigate() en NY skærm, hvis den ikke er den aktuelle.
// goTo går i stedet tilbage til skærmen, hvis den allerede ligger i stakken, og bevarer dens data.
export function goTo(navigation, name, params) {
  const inStack = navigation.getState().routes.some((r) => r.name === name);
  if (inStack) navigation.popTo(name, params, { merge: true });
  else navigation.navigate(name, params);
}

// Tilbage til den åbne bane — eller til "Mine opslag", hvis der ikke er nogen.
export function goToBoard(navigation) {
  const hasBoard = navigation.getState().routes.some((r) => r.name === 'Categories');
  goTo(navigation, hasBoard ? 'Categories' : 'Jobs');
}
