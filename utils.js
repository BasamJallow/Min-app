// Små hjælpefunktioner, så skærmene kun står for visning.

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

export function percent(score, total) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

// Én linje i opsamlingen efter et besvaret spørgsmål.
export function breakdownItem(question, result) {
  const short = question.prompt.length > 60 ? `${question.prompt.slice(0, 60)}…` : question.prompt;
  return { correct: !!result.correct, xp: result.xp, label: short };
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
  };
}
