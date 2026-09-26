// Datalag for spørgsmål og evaluering.
// Nu: bruger den regelbaserede motor i /questions.js.
// Ved integration: skift indholdet i USE_MOCK-grenene ud med et rigtigt API-kald
// (fx OpenAI/Anthropic via AI_API-konfigurationen i /config.js).
// Skærmene rører ikke ved dette — de kalder kun getQuestions og evaluateAnswer.

import { USE_MOCK } from '../config';
import { analyzeJobPost, generateQuestions, evaluateFreeText } from '../questions';

export async function getQuestions(jobPost) {
  if (USE_MOCK) {
    const skills = analyzeJobPost(jobPost);
    const questions = generateQuestions(skills);
    return { skills, questions };
  }

  // TODO: kald AI-API her når nøglen er sat op.
  throw new Error('AI-API er ikke koblet på endnu.');
}

export async function evaluateAnswer(question, answer) {
  if (USE_MOCK) {
    if (question.type === 'free') {
      return evaluateFreeText(answer);
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
