// Forberedelsesark til jobsamtalen: det vigtigste at fremhæve, spørgsmål til dem og hvad man skal undersøge.
// Arket gemmes på opslaget, så det kun koster tokens første gang (eller når brugeren beder om et nyt).
// Ved Firebase-integration: uændret — arket følger med opslaget i 'jobs'-collectionen.

import { USE_MOCK_AI } from '../config';
import { prepSheetTemplate, PREP_CHECKLIST } from '../questions';
import { prepSheetWithAI } from './aiService';
import { getJob, saveJob, getWeakSkills } from './storageService';
import { stringList } from '../utils';

async function buildSheet(job) {
  if (!USE_MOCK_AI) {
    try {
      const data = await prepSheetWithAI(job);
      const highlights = (Array.isArray(data.highlights) ? data.highlights : [])
        .filter((h) => h && typeof h.skill === 'string' && typeof h.why === 'string')
        .slice(0, 3)
        .map((h) => ({ skill: h.skill.trim(), why: h.why.trim() }));
      const sheet = {
        highlights,
        askThem: stringList(data.askThem, 5),
        research: stringList(data.research, 4),
        expected: stringList(data.expected, 4),
      };
      if (sheet.highlights.length > 0 && sheet.askThem.length > 0) return { ...sheet, isTemplate: false };
      throw new Error('Ufuldstændigt ark fra AI');
    } catch (e) {
      console.warn('AI-forberedelsesark fejlede, bruger skabelon:', e.message);
    }
  }
  return { ...prepSheetTemplate(job.skills || [], job.questions), isTemplate: true };
}

// Returnerer arket for et opslag. refresh: lav et nyt i stedet for det gemte.
// Svage punkter og tjekliste lægges på hver gang, så de altid er opdaterede.
export async function getPrepSheet(jobId, { refresh = false } = {}) {
  const job = await getJob(jobId);
  if (!job) return null;

  let sheet = !refresh && job.prepSheet ? job.prepSheet : null;
  if (!sheet) {
    sheet = { ...(await buildSheet(job)), createdAt: Date.now() };
    await saveJob({ ...job, prepSheet: sheet });
  }

  const { weak } = await getWeakSkills(jobId);
  return { ...sheet, title: job.title, weakSkills: weak, checklist: PREP_CHECKLIST };
}

// Arket som ren tekst, så det kan deles til fx Noter eller mail.
export function prepSheetText(sheet) {
  const lines = [`Forberedelse: ${sheet.title || 'Jobsamtale'}`, ''];
  const section = (heading, items) => {
    if (!items || items.length === 0) return;
    lines.push(heading, ...items.map((i) => `• ${i}`), '');
  };
  section('Det vigtigste at fremhæve', sheet.highlights.map((h) => `${h.skill}: ${h.why}`));
  section('Spørgsmål til dem', sheet.askThem);
  section('Undersøg om virksomheden', sheet.research);
  section('Spørgsmål du kan forvente', sheet.expected);
  section('Dine svage punkter at forberede', sheet.weakSkills);
  section('Tjekliste', sheet.checklist);
  return lines.join('\n').trim();
}
