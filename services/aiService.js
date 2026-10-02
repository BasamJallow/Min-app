// OpenAI-kald for analyse af opslag og vurdering af fritekstsvar.
// Bruges kun af questionService. Nøgle og model kommer fra .env via /config.js.
// Ved Firebase-integration: flyt fetch-kaldet til en Cloud Function, så nøglen ikke ligger i appen.

import { AI_API } from '../config';

const TIMEOUT_MS = 45000;

// Sender en prompt og returnerer modellens svar som et JSON-objekt.
async function chatJson(system, user) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(AI_API.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_API.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI svarede ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } finally {
    clearTimeout(timer);
  }
}

const ANALYZE_SYSTEM = `Du er en dansk karriererådgiver, der forbereder en kandidat til en jobsamtale.
Du får et jobopslag og svarer KUN med JSON i dette format:
{
  "skills": ["kompetence", ...],
  "questions": {
    "behavior": [ ... ],
    "professional": [ ... ],
    "motivation": [ ... ],
    "brain": [ ... ]
  }
}
Regler:
- "skills": de 3-5 vigtigste kompetencer i opslaget, som korte danske navneord med lille forbogstav (fx "samarbejde", "dataanalyse"). Tom liste hvis opslaget ikke nævner nogen.
- Hvert spørgsmål er enten
  {"type":"free","prompt":"...","hint":"...","skill":"<en af skills eller null>"}
  eller
  {"type":"choice","prompt":"...","options":["...","...","..."],"correct":<index 0-2>,"explanation":"...","skill":"<en af skills eller null>"}
- behavior: 6-8 spørgsmål. Mindst ét fritekstspørgsmål (STAR) per kompetence, plus multiple choice om STAR-metoden og typiske adfærdsspørgsmål.
- professional: 6-7 spørgsmål. Mindst ét fritekstspørgsmål per kompetence, der beder om et konkret eksempel.
- motivation: 5-6 spørgsmål om hvorfor lige denne stilling og virksomhed.
- brain: 5-6 estimerings- og problemløsningsopgaver, hvor tankeprocessen vurderes.
- Bland fritekst og multiple choice i alle kategorier. Skriv alt på dansk.`;

export async function analyzeWithAI(jobPost) {
  return chatJson(ANALYZE_SYSTEM, `Jobopslag:\n"""\n${jobPost}\n"""`);
}

const EVALUATE_SYSTEM = `Du er en dansk interviewcoach. Du vurderer kandidatens svar på et øvelsesspørgsmål.
Feedbacken skal være bundet til jobopslagets kompetencer: nævn konkret hvilke kompetencer svaret viser,
og hvilke det mangler, fx "Du nævner ikke samarbejde, som opslaget lægger vægt på".
- Kategori "behavior": tjek om svaret har STAR-elementer (situation, handling, resultat) og sig hvad der mangler.
- Kategori "brain": vurder tankeprocessen (antagelser, trin, tal) — ikke kompetencerne.
- Vurder indhold, ikke kun længde.
Svar KUN med JSON:
{"label":"Stærkt svar" | "Godt forsøg" | "Kan styrkes","text":"højst 3 korte sætninger på dansk, henvendt til kandidaten med 'du'","strong":["kompetencer svaret viser"],"weak":["kompetencer fra opslaget svaret mangler"]}`;

export async function evaluateWithAI(question, answer, skills) {
  const user = JSON.stringify({
    kategori: question.category,
    spoergsmaal: question.prompt,
    spoergsmaalets_kompetence: question.skill || null,
    opslagets_kompetencer: skills,
    svar: answer,
  });
  return chatJson(EVALUATE_SYSTEM, user);
}
