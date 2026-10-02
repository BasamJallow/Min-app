// Interview-simulator: styrer samtalens forløb med hovedspørgsmål og opfølgninger.
// Med en OpenAI-nøgle formulerer AI'en interviewerens replikker; ellers bruges den lokale motor.
// Reglerne for samtalens længde ligger her, så AI'en aldrig kan trække den ud.
// Ved Firebase-integration: uændret — kun aiService skal pege på en Cloud Function.

import { USE_MOCK_AI } from '../config';
import { INTERVIEW } from '../constants';
import { interviewPlan, interviewFollowUp, evaluateFreeText, starGaps } from '../questions';
import { interviewTurnWithAI, interviewSummaryWithAI } from './aiService';
import { buildSession, stringList } from '../utils';

const LABEL_SCORE = { 'Stærkt svar': 90, 'Godt forsøg': 65, 'Kan styrkes': 35 };

// context: { title, text, skills, questions }
export function createInterview(context) {
  return {
    context,
    plan: interviewPlan(context.questions, INTERVIEW.mainQuestions),
    messages: [],
    mainAsked: 0,
    followUps: 0,
    done: false,
  };
}

function addMessage(state, role, text, kind) {
  const message = { id: String(state.messages.length), role, text, kind, main: state.mainAsked };
  return { ...state, messages: [...state.messages, message] };
}

// Hvad intervieweren må gøre i næste replik.
function allowedMoves(state) {
  if (state.mainAsked === 0) return ['question'];
  const canFollow = state.followUps < INTERVIEW.maxFollowUps;
  const canAsk = state.mainAsked < INTERVIEW.mainQuestions;
  if (canAsk) return canFollow ? ['followup', 'question'] : ['question'];
  return canFollow ? ['followup', 'closing'] : ['closing'];
}

function lastAnswer(state) {
  const answers = state.messages.filter((m) => m.role === 'candidate');
  return answers.length > 0 ? answers[answers.length - 1].text : '';
}

function mockTurn(state, moves) {
  const current = state.plan[state.mainAsked - 1];
  if (moves.includes('followup')) {
    const followUp = interviewFollowUp(lastAnswer(state), current);
    if (followUp) return { type: 'followup', message: followUp };
  }
  if (moves.includes('question')) {
    const next = state.plan[state.mainAsked];
    const intro = state.mainAsked === 0
      ? `Velkommen, og tak fordi du kom. ${state.context.title ? `Vi skal tale om stillingen: ${state.context.title}. ` : ''}Lad os gå i gang. `
      : 'Tak. ';
    return { type: 'question', message: intro + next.prompt };
  }
  return { type: 'closing', message: 'Tak for i dag. Det var mine spørgsmål — du hører fra os.' };
}

async function aiTurn(state, moves) {
  const data = await interviewTurnWithAI(state.context, state.messages, moves);
  if (typeof data.message !== 'string' || !data.message.trim()) throw new Error('Tom replik fra AI');
  // Vælger AI'en noget, den ikke må, retter vi det til et tilladt træk.
  const type = moves.includes(data.type) ? data.type : moves[moves.length - 1];
  return { type, message: data.message.trim() };
}

// Interviewerens næste replik. Returnerer en ny state.
export async function interviewerTurn(state) {
  const moves = allowedMoves(state);
  let turn = null;
  if (!USE_MOCK_AI) {
    try {
      turn = await aiTurn(state, moves);
    } catch (e) {
      console.warn('AI-interviewer fejlede, bruger lokal motor:', e.message);
    }
  }
  if (!turn) turn = mockTurn(state, moves);

  let next = addMessage(state, 'interviewer', turn.message, turn.type);
  if (turn.type === 'question') next = { ...next, mainAsked: next.mainAsked + 1, followUps: 0 };
  if (turn.type === 'followup') next = { ...next, followUps: next.followUps + 1 };
  if (turn.type === 'closing') next = { ...next, done: true };
  return next;
}

export function addAnswer(state, text) {
  return addMessage(state, 'candidate', text.trim(), 'answer');
}

export function endInterview(state) {
  return { ...state, done: true };
}

// Hvor langt samtalen er, til "Spørgsmål 2 af 4".
export function interviewProgress(state) {
  return { current: Math.max(state.mainAsked, 1), total: INTERVIEW.mainQuestions };
}

// Samler kandidatens svar pr. hovedspørgsmål.
function rounds(state) {
  const result = [];
  for (const m of state.messages) {
    if (m.role !== 'candidate' || m.main < 1) continue;
    const round = result.find((r) => r.main === m.main);
    if (round) round.answers.push(m.text);
    else result.push({ main: m.main, answers: [m.text] });
  }
  return result;
}

function scoreLabel(score) {
  if (score >= 75) return 'Klar til samtalen';
  if (score >= 50) return 'Godt på vej';
  return 'Træn mere';
}

function mockSummary(state, local, allAnswers) {
  const score = Math.round(local.reduce((sum, r) => sum + LABEL_SCORE[r.label], 0) / local.length);
  const strong = [...new Set(local.flatMap((r) => r.strong || []))];
  const weak = [...new Set(local.flatMap((r) => r.weak || []))].filter((s) => !strong.includes(s));
  const gaps = starGaps(allAnswers);

  const strengths = strong.map((s) => `Du viser ${s} med dine eksempler`);
  if (gaps.action === 0) strengths.push('Du fortæller tydeligt, hvad du selv gjorde');
  if (strengths.length === 0) strengths.push('Du gennemførte hele samtalen');

  const improvements = weak.slice(0, 2).map((s) => `Vis ${s} med et konkret eksempel`);
  if (gaps.result > 0) improvements.push('Afslut dine eksempler med et målbart resultat');
  if (gaps.situation > 0) improvements.push('Start med kort at beskrive situationen');

  let summary = 'Dine svar var ofte for korte eller generelle. Brug konkrete eksempler fra studie eller job.';
  if (score >= 75) summary = 'Dine svar var konkrete og koblet til opslagets kompetencer.';
  else if (score >= 50) summary = 'Flere svar var gode, men nogle manglede konkrete detaljer eller et resultat.';

  return { score, summary, strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3), strong, weak };
}

// Samlet vurdering: { score, label, summary, strengths, improvements, strong, weak, xp, breakdown }.
export async function summarizeInterview(state) {
  const { skills } = state.context;
  const answered = rounds(state);
  if (answered.length === 0) {
    return {
      score: 0, label: 'Ingen svar', summary: 'Samtalen blev afsluttet, før du nåede at svare.',
      strengths: [], improvements: [], strong: [], weak: [], xp: 0, breakdown: [],
    };
  }

  // Lokal vurdering af hvert hovedspørgsmål — bruges til historikken og som reserve.
  const local = answered.map((r) => {
    const question = state.plan[r.main - 1] || { category: 'behavior', star: true, prompt: '' };
    return evaluateFreeText(r.answers.join(' '), { ...question, star: question.category !== 'motivation' }, skills);
  });
  const breakdown = local.map((r, i) => ({
    correct: r.correct, xp: 0, label: `Spørgsmål ${answered[i].main}`, strong: r.strong || [], weak: r.weak || [],
  }));

  let result = null;
  if (!USE_MOCK_AI) {
    try {
      const data = await interviewSummaryWithAI(state.context, state.messages);
      const score = Math.round(Number(data.score));
      if (!Number.isFinite(score) || typeof data.summary !== 'string') throw new Error('Ugyldig vurdering fra AI');
      result = {
        score: Math.min(100, Math.max(0, score)),
        summary: data.summary.trim(),
        strengths: stringList(data.strengths, 3),
        improvements: stringList(data.improvements, 3),
        strong: stringList(data.strong, 5),
        weak: stringList(data.weak, 5),
      };
    } catch (e) {
      console.warn('AI-vurdering af samtalen fejlede, bruger lokal motor:', e.message);
    }
  }
  if (!result) result = mockSummary(state, local, answered.map((r) => r.answers.join(' ')));

  return {
    ...result,
    label: scoreLabel(result.score),
    xp: Math.round(result.score * INTERVIEW.xpPerPoint),
    breakdown,
  };
}

// Samtalen som session til historikken. Kategorien 'interview' påvirker ikke banens parathed.
export function interviewSession(summary, { jobId, jobPreview }) {
  return {
    ...buildSession({
      jobId,
      category: 'Interview-simulator',
      categoryKey: 'interview',
      jobPreview,
      breakdown: summary.breakdown,
      total: summary.breakdown.length,
    }),
    xp: summary.xp,
    strong: summary.strong,
    weak: summary.weak,
  };
}
