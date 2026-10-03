// OpenAI-kald for analyse af opslag og vurdering af fritekstsvar.
// Bruges kun af questionService. Nøgle og model kommer fra .env via /config.js.
// Ved Firebase-integration: flyt fetch-kaldet til en Cloud Function, så nøglen ikke ligger i appen.

import { AI_API } from '../config';

const TIMEOUT_MS = 45000;

// Loft over hvor langt et svar må blive, så en fejl ikke kan bruge løs af tokens.
const MAX_TOKENS = {
  analyze: 6000, evaluate: 800, strong: 700, interviewTurn: 400, interviewSummary: 900, weakness: 1500,
  prep: 1500,
};

// Sender en prompt og returnerer modellens svar som et JSON-objekt.
async function chatJson(system, user, maxTokens, label) {
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
        max_completion_tokens: maxTokens,
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
    const { prompt_tokens: input = 0, completion_tokens: output = 0 } = data.usage || {};
    console.log(`OpenAI (${label}): ${input} ind / ${output} ud tokens`);

    const choice = data.choices[0];
    if (choice.finish_reason === 'length') {
      throw new Error(`Svaret ramte loftet på ${maxTokens} tokens`);
    }
    return JSON.parse(choice.message.content);
  } finally {
    clearTimeout(timer);
  }
}

const ANALYZE_SYSTEM = `Du er en dansk karriererådgiver, der forbereder en kandidat til en jobsamtale.
Du får en tekst, der burde være et jobopslag. Svar KUN med JSON.
Hvis teksten tydeligvis IKKE er et jobopslag, så svar kun: {"isJobPost": false}
Ellers svar i dette format:
{
  "isJobPost": true,
  "title": "kort stillingsbetegnelse og evt. virksomhed, fx 'Driftsleder hos Netto'",
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
  return chatJson(ANALYZE_SYSTEM, `Jobopslag:\n"""\n${jobPost}\n"""`, MAX_TOKENS.analyze, 'analyse');
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
  return chatJson(EVALUATE_SYSTEM, user, MAX_TOKENS.evaluate, 'feedback');
}

const STRONG_SYSTEM = `Du er en dansk interviewcoach. Omskriv kandidatens svar til et stærkt svar på samme spørgsmål.
- Bevar kandidatens egne oplysninger. Opfind ALDRIG erfaringer, tal eller arbejdspladser.
  Mangler noget, så skriv en pladsholder i kantede parenteser, fx [dit resultat med et tal].
- Kategori "behavior": brug STAR (situation, handling, resultat) i jeg-form.
- Kategori "brain": vis antagelser og trin, og slut med et tal.
- Nævn naturligt de kompetencer fra opslaget, der passer til spørgsmålet.
- Højst 120 ord, talesprog som til en samtale.
Svar KUN med JSON: {"answer":"det stærke svar","changes":["2-3 korte punkter om hvad der er ændret"]}`;

export async function strongAnswerWithAI(question, answer, skills) {
  const user = JSON.stringify({
    kategori: question.category,
    spoergsmaal: question.prompt,
    spoergsmaalets_kompetence: question.skill || null,
    opslagets_kompetencer: skills,
    svar: answer,
  });
  return chatJson(STRONG_SYSTEM, user, MAX_TOKENS.strong, 'stærkt svar');
}

// Opslagets tekst begrænses, så lange opslag ikke koster unødige tokens i hver tur.
const MAX_POST_CHARS = 3000;

const INTERVIEW_SYSTEM = `Du er en erfaren dansk interviewer hos virksomheden i jobopslaget og holder en realistisk jobsamtale.
- Du er høflig, men krævende: du nøjes ikke med vage eller generelle svar.
- Stil ét spørgsmål ad gangen, kort (1-3 sætninger), i talesprog.
- Giv ingen feedback eller ros undervejs — højst en kort, neutral kvittering som "Tak." eller "Okay."
- Opfølgning: spørg ind, når svaret mangler en konkret handling, et resultat, eller undviger spørgsmålet.
- Nye spørgsmål dækker forskellige kompetencer fra opslaget og blander adfærd, faglighed og motivation.
- Følg altid feltet "tilladt": det bestemmer, om du må følge op, stille et nyt hovedspørgsmål eller skal afslutte.
- Første replik: byd kort velkommen og stil første spørgsmål.
- Afslutning: tak for samtalen i 1-2 sætninger uden at vurdere kandidaten.
Svar KUN med JSON: {"type":"followup" | "question" | "closing","message":"din replik"}`;

function interviewInput(context, messages, extra) {
  return JSON.stringify({
    titel: context.title || null,
    opslag: (context.text || '').slice(0, MAX_POST_CHARS),
    kompetencer: context.skills,
    samtale: messages.map((m) => ({ fra: m.role === 'candidate' ? 'kandidat' : 'interviewer', tekst: m.text })),
    ...extra,
  });
}

export async function interviewTurnWithAI(context, messages, allowed) {
  const user = interviewInput(context, messages, { tilladt: allowed });
  return chatJson(INTERVIEW_SYSTEM, user, MAX_TOKENS.interviewTurn, 'interview');
}

const INTERVIEW_SUMMARY_SYSTEM = `Du er en dansk interviewcoach. Vurdér kandidatens præstation i jobsamtalen realistisk — ikke for venligt.
Vurder: konkrete eksempler, STAR (situation, handling, resultat), kobling til opslagets kompetencer og motivation.
Svar KUN med JSON:
{"score": <heltal 0-100>,
 "summary": "2-3 sætninger til kandidaten med 'du'",
 "strengths": ["2-3 konkrete styrker"],
 "improvements": ["2-3 konkrete forbedringer"],
 "strong": ["kompetencer fra opslaget kandidaten viste"],
 "weak": ["kompetencer fra opslaget kandidaten ikke viste"]}`;

export async function interviewSummaryWithAI(context, messages) {
  const user = interviewInput(context, messages, {});
  return chatJson(INTERVIEW_SUMMARY_SYSTEM, user, MAX_TOKENS.interviewSummary, 'interview-vurdering');
}

const WEAKNESS_SYSTEM = `Du er en dansk karriererådgiver. Kandidaten skal træne de kompetencer fra jobopslaget, som kandidaten har klaret dårligst.
Lav nye øvelsesspørgsmål, der kun handler om de svage kompetencer og passer til stillingen.
- Kun fritekstspørgsmål. Mest adfærd (STAR), gerne ét fagligt.
- Undgå spørgsmålene i "allerede_stillet".
- Skriv på dansk, kort og konkret.
Svar KUN med JSON:
{"questions":[{"type":"free","category":"behavior" | "professional","prompt":"...","hint":"kort tip","skill":"en af de svage kompetencer"}]}`;

export async function weaknessQuestionsWithAI(context, weakSkills, count, alreadyAsked) {
  const user = JSON.stringify({
    titel: context.title || null,
    opslag: (context.text || '').slice(0, MAX_POST_CHARS),
    svage_kompetencer: weakSkills,
    antal: count,
    allerede_stillet: alreadyAsked.slice(0, 20),
  });
  return chatJson(WEAKNESS_SYSTEM, user, MAX_TOKENS.weakness, 'svage punkter');
}

const PREP_SYSTEM = `Du er en dansk karriererådgiver. Lav et kort forberedelsesark til en jobsamtale ud fra jobopslaget.
- Vær konkret og specifik for netop denne stilling og virksomhed — undgå generelle råd.
- Skriv på dansk, korte punkter.
Svar KUN med JSON:
{"highlights":[{"skill":"kompetence","why":"én sætning om hvorfor den er vigtig her og hvad kandidaten skal vise"}],
 "askThem":["4 gode spørgsmål kandidaten kan stille"],
 "research":["3-4 ting kandidaten bør undersøge om virksomheden"],
 "expected":["3-4 spørgsmål kandidaten sandsynligvis får"]}
highlights skal have præcis 3 punkter.`;

export async function prepSheetWithAI(context) {
  const user = JSON.stringify({
    titel: context.title || null,
    opslag: (context.text || '').slice(0, MAX_POST_CHARS),
    kompetencer: context.skills,
  });
  return chatJson(PREP_SYSTEM, user, MAX_TOKENS.prep, 'forberedelsesark');
}
