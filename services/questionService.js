// Datalag for spørgsmål og evaluering. Skærmene kalder kun getQuestions og evaluateAnswer.
// Ved API-integration: erstat USE_MOCK-grenene med kald til AI_API fra /config.js
// og slet /questions.js. Signaturer og returformat skal bevares.

import { USE_MOCK } from '../config';
import { analyzeJobPost, generateQuestions, evaluateFreeText } from '../questions';

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

// Returnerer { label, text, xp, correct }. skills er kompetencerne fundet i opslaget.
export async function evaluateAnswer(question, answer, skills = []) {
  if (USE_MOCK) {
    if (question.type === 'free') {
      return evaluateFreeText(answer, skills);
    }
    const correct = answer === question.correct;
    return {
      label: correct ? 'Stærkt svar' : 'Kan styrkes',
      text: question.explanation,
      xp: correct ? 20 : 5,
      correct,
    };
  }

  // TODO: kald AI-API her når nøglen er sat op.
  throw new Error('AI-API er ikke koblet på endnu.');
}
