// Datalag for spørgsmål og evaluering. Skærmene kalder kun getQuestions og evaluateAnswer.
// Ved API-integration: erstat USE_MOCK-grenene med kald til AI_API fra /config.js
// og slet /questions.js. Signaturer og returformat skal bevares.

import { USE_MOCK } from '../config';
import { analyzeJobPost, generateQuestions, evaluateFreeText, skillNote } from '../questions';

// Returnerer { jobId, skills, questions }. jobId knytter sessioner til netop dette opslag.
export async function getQuestions(jobPost) {
  if (USE_MOCK) {
    const skills = analyzeJobPost(jobPost);
    const questions = generateQuestions(skills);
    return { jobId: String(Date.now()), skills, questions };
  }

  // TODO: kald AI-API her når nøglen er sat op.
  throw new Error('AI-API er ikke koblet på endnu.');
}

// Kategoriens vægt ganges på XP, så adfærd tæller mere end brain teasers.
function withWeight(result, question) {
  return { ...result, xp: Math.round(result.xp * (question.weight || 1)) };
}

// Returnerer { label, text, xp, correct }. skills er kompetencerne fundet i opslaget.
export async function evaluateAnswer(question, answer, skills = []) {
  if (USE_MOCK) {
    let result;
    if (question.type === 'free') {
      result = evaluateFreeText(answer, question, skills);
    } else {
      const correct = answer === question.correct;
      result = {
        label: correct ? 'Stærkt svar' : 'Kan styrkes',
        text: question.explanation + skillNote(question),
        xp: correct ? 20 : 5,
        correct,
      };
    }
    return withWeight(result, question);
  }

  // TODO: kald AI-API her når nøglen er sat op.
  throw new Error('AI-API er ikke koblet på endnu.');
}
