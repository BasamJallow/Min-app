// Datalag for spørgsmål og evaluering. Skærmene kalder kun getQuestions, evaluateAnswer og getStrongAnswer.
// Med en OpenAI-nøgle i .env bruges services/aiService.js; ellers den regelbaserede motor i /questions.js.
// Fejler AI-kaldet, falder vi tilbage til motoren, så appen altid virker.
// Ved Firebase-integration: behold signaturerne — kun aiService skal pege på en Cloud Function.

import { USE_MOCK_AI, AI_API } from '../config';
import { CATEGORIES } from '../constants';
import {
  analyzeJobPost, generateQuestions, evaluateFreeText, skillNote, looksLikeJobPost, strongAnswerTemplate,
} from '../questions';
import { analyzeWithAI, evaluateWithAI, strongAnswerWithAI } from './aiService';
import { analysisKey, getCachedAnalysis, saveCachedAnalysis } from './cacheService';

const LABEL_XP = { 'Stærkt svar': 20, 'Godt forsøg': 12, 'Kan styrkes': 5 };
const MIN_PER_CATEGORY = 3;

function stringList(value, max) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()).slice(0, max);
}

// Sorterer ugyldige spørgsmål fra, så skærmene altid får det format, de forventer.
function cleanQuestion(q, categoryKey, skills) {
  if (!q || typeof q.prompt !== 'string' || !q.prompt.trim()) return null;
  const skill = skills.includes(q.skill) ? q.skill : undefined;

  if (q.type === 'choice') {
    const options = stringList(q.options, 4);
    const correct = Number(q.correct);
    if (options.length < 2 || !Number.isInteger(correct) || correct < 0 || correct >= options.length) return null;
    return {
      type: 'choice', prompt: q.prompt.trim(), options, correct,
      explanation: typeof q.explanation === 'string' ? q.explanation : '', skill,
    };
  }
  if (q.type === 'free') {
    return {
      type: 'free', prompt: q.prompt.trim(),
      hint: typeof q.hint === 'string' ? q.hint : '', skill,
      star: categoryKey === 'behavior',
    };
  }
  return null;
}

// Hvert spørgsmål får id, kategori og kategoriens vægt med.
function withCategoryMeta(bank) {
  const result = {};
  for (const c of CATEGORIES) {
    result[c.key] = bank[c.key].map((q, i) => ({
      ...q, id: q.id || `${c.key}-${i}`, category: c.key, weight: c.weight,
    }));
  }
  return result;
}

function mockQuestions(jobPost) {
  const skills = analyzeJobPost(jobPost);
  return { isJobPost: looksLikeJobPost(jobPost, skills), skills, bank: generateQuestions(skills) };
}

async function aiQuestions(jobPost) {
  // Samme opslag analyseres kun én gang — derefter hentes det fra cachen uden tokenforbrug.
  const key = analysisKey(jobPost, AI_API.model);
  const cached = await getCachedAnalysis(key);
  if (cached) {
    console.log('OpenAI (analyse): hentet fra cache, 0 tokens');
    return cached;
  }
  const result = await analyzeAndClean(jobPost);
  await saveCachedAnalysis(key, result);
  return result;
}

async function analyzeAndClean(jobPost) {
  const data = await analyzeWithAI(jobPost);
  // Ikke et jobopslag — gemmes i cachen, så samme tekst ikke koster tokens igen.
  if (data.isJobPost === false) return { isJobPost: false };
  const skills = stringList(data.skills, 5).map((s) => s.toLowerCase());
  const fallback = generateQuestions(skills);
  const bank = {};
  for (const c of CATEGORIES) {
    const raw = Array.isArray(data.questions?.[c.key]) ? data.questions[c.key] : [];
    const clean = raw.map((q) => cleanQuestion(q, c.key, skills)).filter(Boolean);
    // For få brugbare spørgsmål fra AI — brug motorens i den kategori.
    bank[c.key] = clean.length >= MIN_PER_CATEGORY ? clean : fallback[c.key];
  }
  return { isJobPost: true, skills, bank };
}

// Returnerer { isJobPost, jobId, skills, questions }. jobId knytter sessioner til netop dette opslag.
// Ligner teksten ikke et jobopslag, returneres kun { isJobPost: false } — medmindre force er sat,
// så brugeren kan fortsætte med generelle spørgsmål.
export async function getQuestions(jobPost, { force = false } = {}) {
  let result;
  if (USE_MOCK_AI) {
    result = mockQuestions(jobPost);
  } else {
    try {
      result = await aiQuestions(jobPost);
    } catch (e) {
      console.warn('AI-analyse fejlede, bruger lokal motor:', e.message);
      result = mockQuestions(jobPost);
    }
  }

  // Ældre cache-poster har ikke feltet og regnes som jobopslag.
  if (result.isJobPost === false) {
    if (!force) return { isJobPost: false };
    // AI sendte ingen spørgsmål for en tekst, der ikke er et opslag — brug motorens generelle.
    if (!result.bank) result = mockQuestions(jobPost);
  }
  return {
    isJobPost: true,
    jobId: String(Date.now()),
    skills: result.skills,
    questions: withCategoryMeta(result.bank),
  };
}

// Kategoriens vægt ganges på XP, så adfærd tæller mere end brain teasers.
function withWeight(result, question) {
  return { ...result, xp: Math.round(result.xp * (question.weight || 1)) };
}

async function aiFreeText(question, answer, skills) {
  const data = await evaluateWithAI(question, answer, skills);
  const label = LABEL_XP[data.label] ? data.label : 'Godt forsøg';
  if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Tomt svar fra AI');
  return {
    label,
    text: data.text.trim(),
    xp: LABEL_XP[label],
    correct: label !== 'Kan styrkes',
    strong: stringList(data.strong, 5),
    weak: stringList(data.weak, 5),
  };
}

// Returnerer { label, text, xp, correct, strong, weak }. skills er kompetencerne fundet i opslaget.
export async function evaluateAnswer(question, answer, skills = []) {
  let result;
  if (question.type === 'choice') {
    // Multiple choice har et fast facit og kræver ikke AI.
    const correct = answer === question.correct;
    result = {
      label: correct ? 'Stærkt svar' : 'Kan styrkes',
      text: question.explanation + skillNote(question),
      xp: correct ? 20 : 5,
      correct,
      strong: question.skill && correct ? [question.skill] : [],
      weak: question.skill && !correct ? [question.skill] : [],
    };
  } else if (USE_MOCK_AI) {
    result = evaluateFreeText(answer, question, skills);
  } else {
    try {
      result = await aiFreeText(question, answer, skills);
    } catch (e) {
      console.warn('AI-vurdering fejlede, bruger lokal motor:', e.message);
      result = evaluateFreeText(answer, question, skills);
    }
  }
  return withWeight(result, question);
}

// Returnerer { text, changes, isTemplate }. Hentes først, når brugeren beder om det, så det ikke koster tokens.
export async function getStrongAnswer(question, answer, skills = []) {
  if (!USE_MOCK_AI) {
    try {
      const data = await strongAnswerWithAI(question, answer, skills);
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Tomt svar fra AI');
      return { text: data.answer.trim(), changes: stringList(data.changes, 3), isTemplate: false };
    } catch (e) {
      console.warn('AI-omskrivning fejlede, bruger skabelon:', e.message);
    }
  }
  return { ...strongAnswerTemplate(question, answer, skills), isTemplate: true };
}
