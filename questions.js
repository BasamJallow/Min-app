// Regelbaseret mock-motor: simulerer AI-analyse af jobopslaget og genererer spørgsmål.
// Bruges af services/questionService.js — det er dét lag skærmene taler med.
// Bruges når der ikke er en OpenAI-nøgle, og som reserve hvis AI-kaldet fejler.

// Kompetenceordbog. Synonymer er ordstammer på dansk og engelsk og matches fra ordets start.
const SKILLS = [
  {
    label: 'samarbejde',
    synonyms: ['samarbejd', 'teamwork', 'team', 'tværfaglig', 'sparring', 'kolleg', 'sammen med', 'gruppe', 'collaborat', 'cooperat'],
    behavior: 'Fortæl om en gang, hvor du skulle samarbejde med nogen, der arbejdede helt anderledes end dig. Hvad gjorde du?',
    professional: 'Giv et konkret eksempel på et resultat, du har skabt sammen med andre — og hvad din rolle var.',
  },
  {
    label: 'kommunikation',
    synonyms: ['kommunik', 'formidl', 'præsent', 'dialog', 'interessent', 'stakeholder', 'communicat', 'skriftlig', 'mundtlig'],
    behavior: 'Fortæl om en situation, hvor du skulle forklare noget svært for en, der ikke havde din faglige baggrund.',
    professional: 'Hvordan tilpasser du dit budskab til forskellige modtagere? Giv et konkret eksempel.',
  },
  {
    label: 'analyse',
    synonyms: ['analy', 'data', 'excel', 'sql', 'power bi', 'rapportering', 'indsigt', 'kpi', 'insight'],
    behavior: 'Fortæl om en gang, hvor en analyse eller nogle tal fik dig til at ændre en beslutning.',
    professional: 'Beskriv et konkret datasæt eller problem, du har analyseret. Hvilke værktøjer brugte du, og hvad fandt du?',
  },
  {
    label: 'ledelse',
    // Hverken "leder" eller "ledelse" alene — "Vi leder efter…" og "rapportere til ledelsen" er ikke lederroller.
    matchLabel: false,
    synonyms: ['ledelseserfaring', 'ledelsesansvar', 'og ledelse', 'ledelse og', 'lederstilling', 'driftsleder', 'butikschef', 'lederrolle', 'lederskab', 'teamleder', 'ledende', 'leadership', 'personaleansvar', 'motivere'],
    behavior: 'Fortæl om en gang, hvor du tog føringen i en gruppe uden at have fået rollen formelt.',
    professional: 'Hvordan får du en gruppe til at trække i samme retning? Giv et eksempel, hvor du gjorde det.',
  },
  {
    label: 'projektstyring',
    synonyms: ['projekt', 'project', 'koordin', 'planlæg', 'deadline', 'milepæl', 'agil', 'scrum'],
    behavior: 'Fortæl om et projekt, hvor planen skred. Hvad gjorde du for at nå i mål?',
    professional: 'Hvordan planlægger og følger du op på et projekt med flere deadlines? Brug et konkret eksempel.',
  },
  {
    label: 'kundefokus',
    synonyms: ['kunde', 'customer', 'klient', 'borger', 'service', 'client'],
    behavior: 'Fortæl om en gang, hvor du hjalp en utilfreds kunde eller bruger. Hvad gjorde du, og hvordan endte det?',
    professional: 'Hvordan finder du ud af, hvad en kunde egentlig har brug for? Giv et konkret eksempel.',
  },
  {
    label: 'problemløsning',
    synonyms: ['problemløs', 'løsningsorient', 'problem solving', 'fejlfind', 'troubleshoot', 'udfordring'],
    behavior: 'Fortæl om et problem, som ingen havde en oplagt løsning på. Hvordan greb du det an?',
    professional: 'Beskriv trin for trin, hvordan du løste et konkret fagligt problem.',
  },
  {
    label: 'selvstændighed',
    synonyms: ['selvstændig', 'initiativ', 'proaktiv', 'drive', 'independent', 'proactive', 'self-starter'],
    behavior: 'Fortæl om en gang, hvor du tog initiativ til noget, ingen havde bedt dig om.',
    professional: 'Giv et eksempel på en opgave, du løste selvstændigt fra start til slut. Hvad var resultatet?',
  },
  {
    label: 'struktur og overblik',
    synonyms: ['struktur', 'organiser', 'overblik', 'detalje', 'grundig', 'systematisk', 'structured', 'detail', 'organized'],
    behavior: 'Fortæl om en periode, hvor du havde for mange opgaver på én gang. Hvordan bevarede du overblikket?',
    professional: 'Hvilke metoder eller værktøjer bruger du til at holde styr på dine opgaver? Giv et konkret eksempel.',
  },
  {
    label: 'innovation',
    synonyms: ['innovat', 'kreativ', 'nytænk', 'idé', 'creative', 'idea'],
    behavior: 'Fortæl om en idé, du fik gennemført. Hvordan overbeviste du andre om den?',
    professional: 'Giv et eksempel på en arbejdsgang eller løsning, du har forbedret. Hvad ændrede det?',
  },
  {
    label: 'fleksibilitet',
    synonyms: ['fleksib', 'omstilling', 'forandring', 'travl', 'flexib', 'adaptab', 'change'],
    behavior: 'Fortæl om en gang, hvor forudsætningerne pludselig ændrede sig. Hvordan tilpassede du dig?',
    professional: 'Hvordan prioriterer du, når planen ændrer sig midt i en opgave? Giv et eksempel.',
  },
  {
    label: 'salg',
    synonyms: ['salg', 'sælg', 'sales', 'forhandl', 'negotiat', 'mersalg'],
    behavior: 'Fortæl om en gang, hvor du overbeviste en skeptisk kunde eller samarbejdspartner.',
    professional: 'Beskriv et salg eller en forhandling, du har gennemført. Hvad var dit mål, og hvad opnåede du?',
  },
  {
    label: 'tekniske færdigheder',
    synonyms: ['programmer', 'udvikler', 'software', 'kode', 'python', 'javascript', 'react', 'teknisk', 'technical', 'developer'],
    behavior: 'Fortæl om en teknisk fejl eller udfordring, du selv fik løst. Hvordan fandt du frem til løsningen?',
    professional: 'Hvilken teknologi fra dit studie eller job er du stærkest i? Giv et eksempel på noget, du har bygget med den.',
  },
];

const MAX_SKILLS = 5;
const SKILLS_WITH_QUESTIONS = 4;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Tæller forekomster af en ordstamme, der starter et ord.
function countStem(lower, stem) {
  const re = new RegExp(`(^|[^a-zæøå0-9])${escapeRegex(stem)}`, 'g');
  return (lower.match(re) || []).length;
}

function skillByLabel(label) {
  return SKILLS.find((s) => s.label === label);
}

function stemsFor(skill) {
  return skill.matchLabel === false ? skill.synonyms : [skill.label, ...skill.synonyms];
}

function mentionsSkill(lower, label) {
  const skill = skillByLabel(label);
  const stems = skill ? stemsFor(skill) : [label];
  return stems.some((stem) => countStem(lower, stem) > 0);
}

const JOB_WORDS = ['stilling', 'job', 'ansøg', 'søger', 'opgaver', 'kvalifikation', 'erfaring', 'ansættelse',
  'arbejdsplads', 'kollega', 'vi tilbyder', 'position', 'we are looking', 'responsibilit', 'requirements', 'apply'];

// Groft tjek af om teksten ligner et jobopslag: kompetencer fundet, eller typiske jobord.
export function looksLikeJobPost(text, skills) {
  const lower = text.toLowerCase();
  const jobWords = JOB_WORDS.filter((w) => countStem(lower, w) > 0).length;
  return skills.length > 0 || jobWords >= 2;
}

// Returnerer kompetencerne i opslaget, sorteret efter hvor tit de nævnes. Tom liste hvis ingen.
export function analyzeJobPost(text) {
  const lower = text.toLowerCase();
  return SKILLS
    .map((s) => ({
      label: s.label,
      hits: stemsFor(s).reduce((sum, stem) => sum + countStem(lower, stem), 0),
    }))
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, MAX_SKILLS)
    .map((s) => s.label);
}

// ---------- Fritekstvurdering ----------

const STAR_MARKERS = {
  situation: ['i mit', 'på mit', 'på min', 'i min', 'engang', 'en gang', 'da jeg', 'da vi', 'sidste år', 'semester',
    'studiejob', 'projekt', 'situation', 'opgave', 'skulle', 'when i', 'at my', 'during'],
  action: ['derfor', 'så jeg', 'jeg valgte', 'jeg besluttede', 'jeg foreslog', 'jeg tog', 'jeg gik', 'jeg satte',
    'jeg sørgede', 'jeg indkaldte', 'jeg kontaktede', 'i decided', 'i took', 'i organized'],
  result: ['resultat', 'det betød', 'endte med', 'lykkedes', 'førte til', 'nåede', 'fik vi', 'feedback', 'forbedre',
    'sparede', 'øgede', 'reducere', 'til tiden', 'result', 'achieved', '%'],
};

const REASONING_MARKERS = ['fordi', 'derfor', 'eksempel', 'fx', 'konkret', 'because', 'for example'];
const BRAIN_MARKERS = {
  assumptions: ['antag', 'cirka', 'ca.', 'estimer', 'gæt', 'regner med', 'lad os sige', 'assum'],
  steps: ['først', 'derefter', 'bagefter', 'til sidst', 'gange', 'divider', 'per ', 'pr.', 'dernæst', 'first', 'then'],
};

function hasAny(lower, markers) {
  return markers.some((m) => lower.includes(m));
}

function joinDa(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} og ${list[list.length - 1]}`;
}

function detectStar(lower) {
  return {
    situation: hasAny(lower, STAR_MARKERS.situation),
    // Datid ved "jeg" tæller også som handling — både "jeg lavede" og omvendt ordstilling "lavede jeg".
    action: hasAny(lower, STAR_MARKERS.action)
      || /(^|\s)jeg \S+(ede|te|de)\b/.test(lower)
      || /\S+(ede|te|de) jeg\b/.test(lower),
    result: hasAny(lower, STAR_MARKERS.result) || /\d/.test(lower),
  };
}

function rate(points) {
  if (points >= 70) return { label: 'Stærkt svar', xp: 20, correct: true };
  if (points >= 45) return { label: 'Godt forsøg', xp: 12, correct: true };
  return { label: 'Kan styrkes', xp: 5, correct: false };
}

function lengthPoints(words) {
  if (words >= 40) return 20;
  if (words >= 20) return 12;
  return 0;
}

function evaluateBrain(lower, words) {
  const assumptions = hasAny(lower, BRAIN_MARKERS.assumptions);
  const steps = hasAny(lower, BRAIN_MARKERS.steps);
  const numbers = /\d/.test(lower);
  const points = (assumptions ? 30 : 0) + (steps ? 30 : 0) + (numbers ? 20 : 0) + lengthPoints(words);

  const lines = [];
  lines.push(assumptions
    ? 'Godt, at du siger dine antagelser højt.'
    : 'Sig dine antagelser højt, fx "Jeg antager, at…" — det er dem, intervieweren vurderer.');
  if (!steps) lines.push('Bryd problemet ned i trin: først, derefter, til sidst.');
  if (!numbers) lines.push('Sæt tal på undervejs, også selvom de er grove skøn.');
  return { ...rate(points), text: lines.join(' '), strong: [], weak: [] };
}

// Vurderer kompetencedækning og (for adfærd) STAR. skills er opslagets kompetencer.
function evaluateAgainstPost(lower, words, question, skills) {
  const covered = skills.filter((l) => mentionsSkill(lower, l));
  const missing = skills.filter((l) => !covered.includes(l));
  const target = question.skill;
  const lines = [];
  let points = 0;

  if (skills.length === 0) {
    points += 30;
    lines.push('Opslaget nævner ingen tydelige kompetencer, så vurderingen bygger på struktur og konkrethed.');
  } else if (target) {
    const hitTarget = covered.includes(target);
    points += hitTarget ? 40 : 0;
    points += Math.min(covered.filter((l) => l !== target).length * 10, 20);
    if (hitTarget) {
      lines.push(`Godt, at du kobler svaret til ${joinDa(covered.slice(0, 2))}, som opslaget efterspørger.`);
    } else {
      lines.push(`Du nævner ikke ${target}, som opslaget lægger vægt på.`);
      if (covered.length > 0) lines.push(`Du viser dog ${joinDa(covered.slice(0, 2))}.`);
    }
  } else {
    points += covered.length > 0 ? 40 : 0;
    points += Math.min(Math.max(covered.length - 1, 0) * 10, 20);
    if (covered.length > 0) {
      lines.push(`Godt, at du kobler svaret til ${joinDa(covered.slice(0, 2))}, som opslaget efterspørger.`);
    } else {
      lines.push(`Du nævner ikke ${joinDa(missing.slice(0, 2))}, som opslaget lægger vægt på.`);
    }
  }

  if (question.star) {
    const star = detectStar(lower);
    points += (star.situation ? 12 : 0) + (star.action ? 14 : 0) + (star.result ? 14 : 0);
    if (star.situation && star.action && star.result) {
      lines.push('Alle tre STAR-dele er med: situation, handling og resultat.');
    } else {
      if (!star.situation) lines.push('Start med kort at beskrive situationen.');
      if (!star.action) lines.push('Fortæl hvad du selv gjorde — brug "jeg", ikke kun "vi".');
      if (!star.result) lines.push('Dit svar mangler et resultat. Hvad kom der ud af det?');
    }
  } else {
    const concrete = /\d/.test(lower) || hasAny(lower, REASONING_MARKERS);
    points += concrete ? 40 : 0;
    if (!concrete) lines.push('Gør svaret konkret med et eksempel, tal eller en begrundelse.');
  }

  points += lengthPoints(words);
  if (words < 15) lines.push('Svaret er meget kort — uddyb det.');

  // Svag = spørgsmålets kompetence mangler, eller svaret rammer ingen af opslagets.
  let weak = [];
  if (target && !covered.includes(target)) weak = [target];
  else if (!target && covered.length === 0) weak = missing.slice(0, 2);

  return { ...rate(points), text: lines.join(' '), strong: covered, weak };
}

export function evaluateFreeText(answer, question, skills = []) {
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (question.category === 'brain') return evaluateBrain(lower, words);
  return evaluateAgainstPost(lower, words, question, skills);
}

// Tilføjer en linje, der binder et multiple choice-svar til opslagets kompetence.
export function skillNote(question) {
  return question.skill
    ? ` Til denne stilling: vis ${question.skill} med et konkret eksempel.`
    : '';
}

// Skabelon til "Se et stærkt svar" uden AI. Pladsholdere i [ ] udfyldes af brugeren.
export function strongAnswerTemplate(question, answer, skills = []) {
  const skill = question.skill || skills[0] || 'dine faglige styrker';
  const lower = answer.toLowerCase();

  if (question.category === 'brain') {
    return {
      text: 'Jeg antager, at [din antagelse]. Først regner jeg [trin 1]. Derefter [trin 2]. '
        + 'Det giver cirka [dit tal]. Det mest usikre er [antagelse], så den ville jeg tjekke først.',
      changes: [
        'Antagelserne siges højt fra start',
        'Problemet er brudt ned i trin',
        'Svaret slutter med et tal og en usikkerhed',
      ],
    };
  }

  if (question.category === 'motivation') {
    return {
      text: 'Det, der gør, at jeg søger netop her, er [noget specifikt ved virksomheden]. '
        + `Det hænger sammen med, at jeg [din erfaring], og jeg glæder mig til at bruge mine styrker inden for ${skill} `
        + 'i [en konkret opgave fra opslaget].',
      changes: [
        'Nævner noget specifikt ved virksomheden',
        `Kobler motivationen til ${skill} fra opslaget`,
      ],
    };
  }

  if (question.star) {
    const star = detectStar(lower);
    const changes = [];
    if (!star.situation) changes.push('Tilføjet en kort situation');
    if (!star.action) changes.push('Tydeligt hvad du selv gjorde');
    if (!star.result) changes.push('Tilføjet et målbart resultat');
    if (!mentionsSkill(lower, skill)) changes.push(`Nævner ${skill}, som opslaget lægger vægt på`);
    if (changes.length === 0) changes.push('Samme STAR-opbygning — gør hvert led mere konkret');
    return {
      text: 'I mit [studiejob/projekt] skulle vi [situation og opgave]. '
        + `Jeg tog ansvar for at [din handling], og her kom ${skill} i spil, da jeg [hvordan]. `
        + 'Det betød, at [målbart resultat, fx et tal]. Bagefter tog jeg med mig, at [din læring].',
      changes,
    };
  }

  return {
    text: 'Et konkret eksempel er, da jeg [situation]. '
      + `Her brugte jeg ${skill} til at [din handling], fordi [begrundelse]. `
      + 'Resultatet var [tal eller effekt], og det kan jeg tage med til jer.',
    changes: [
      'Bygget op om ét konkret eksempel',
      `Nævner ${skill}, som opslaget lægger vægt på`,
      'Slutter med et resultat',
    ],
  };
}

// ---------- Spørgsmål ----------

function skillQuestions(skills) {
  const used = skills.slice(0, SKILLS_WITH_QUESTIONS).map(skillByLabel).filter(Boolean);
  return {
    behavior: used.map((s, i) => ({
      id: `a-skill-${i}`, type: 'free', star: true, skill: s.label,
      prompt: s.behavior,
      hint: `Brug STAR: situation, handling, resultat — og vis ${s.label}.`,
    })),
    professional: used.map((s, i) => ({
      id: `f-skill-${i}`, type: 'free', skill: s.label,
      prompt: `Opslaget lægger vægt på ${s.label}. ${s.professional}`,
      hint: 'Vær konkret: hvad gjorde du, og hvad kom der ud af det?',
    })),
  };
}

export function generateQuestions(skills) {
  const skill = skills[0];
  const perSkill = skillQuestions(skills);
  const hasSkills = perSkill.behavior.length > 0;

  const bank = {
    brain: [
      {
        id: 'b1', type: 'free',
        prompt: 'Hvor mange kaffekopper drikkes der på et kontor i København på en uge? Forklar din fremgangsmåde.',
        hint: 'Vi vurderer din tankeproces, ikke tallet.',
      },
      {
        id: 'b2', type: 'free',
        prompt: 'Hvad ville du tage i pris for at vaske alle vinduer i København?',
        hint: 'Bryd det ned: antal bygninger, tid per vindue, timeløn.',
      },
      {
        id: 'b3', type: 'free',
        prompt: 'Vores omsætning er faldet 15% på tre måneder. Hvordan ville du finde ud af hvorfor?',
        hint: 'Tænk i hypoteser, ikke gæt.',
      },
      {
        id: 'b4', type: 'choice',
        prompt: 'Du bliver bedt om at estimere markedet for elcykler i Danmark. Hvor starter du bedst?',
        options: [
          'Slår tal op på Google og tager det første, jeg finder.',
          'Starter med befolkningstal og et rimeligt estimat på ejerandel.',
          'Siger at det er umuligt at gætte uden data.',
        ],
        correct: 1,
        explanation: 'Interviewerne leder efter en top-down-tilgang, hvor du bygger tallet op fra en kendt base.',
      },
      {
        id: 'b5', type: 'choice',
        prompt: 'Hvad er vigtigst i et brain-teaser-svar?',
        options: [
          'At tallet er præcist.',
          'At du deler dine antagelser undervejs.',
          'At du svarer hurtigt.',
        ],
        correct: 1,
        explanation: 'Antagelser gør dine tanker sporbare, og de kan udfordres — det er dét intervieweren vurderer.',
      },
      {
        id: 'b6', type: 'free',
        prompt: 'Hvor mange cykler holder der parkeret ved Nørreport Station en hverdag kl. 9? Tænk højt.',
        hint: 'Start med antal pendlere, og hvor stor en andel der cykler.',
      },
    ],
    behavior: [
      ...perSkill.behavior,
      {
        id: 'a1', type: 'choice',
        prompt: 'Du får spørgsmålet: "Fortæl om en gang du håndterede en konflikt." Hvilket svar følger STAR-metoden bedst?',
        options: [
          'Jeg er god til at håndtere konflikter og bevarer roen.',
          'I mit studiejob opstod der uenighed om en deadline (S/T). Jeg indkaldte til et møde og fordelte opgaverne om (A). Vi afleverede til tiden (R).',
          'Konflikter opstår tit, men det plejer at løse sig selv.',
        ],
        correct: 1,
        explanation: 'STAR kræver Situation, Task, Action og Result. Kun svar 2 har alle fire dele med konkrete detaljer.',
      },
      {
        id: 'a2', type: 'choice',
        prompt: '"Fortæl om en fejl du har begået." Hvad er den bedste strategi?',
        options: [
          'Nævn en fejl, og fortæl hvad du konkret ændrede bagefter.',
          'Sig at du ikke kan komme i tanke om nogen.',
          'Vælg en "fejl" der egentlig er en styrke, fx at du er perfektionist.',
        ],
        correct: 0,
        explanation: 'Interviewere leder efter selvindsigt og læring. Den klassiske "perfektionist"-undvigelse gennemskues med det samme.',
      },
      {
        id: 'a3', type: 'choice',
        prompt: 'Hvor lang bør et STAR-svar typisk være?',
        options: ['15-20 sekunder', '1-2 minutter', '5 minutter med alle detaljer'],
        correct: 1,
        explanation: 'Omkring halvandet minut giver plads til alle fire STAR-dele uden at intervieweren mister tråden.',
      },
      ...(hasSkills ? [] : [{
        id: 'a4', type: 'free', star: true,
        prompt: 'Fortæl kort om en gang du har arbejdet i et team, hvor tingene ikke gik som planlagt.',
        hint: 'Brug STAR: Situation, Task, Action, Result.',
      }]),
      {
        id: 'a5', type: 'choice',
        prompt: 'Intervieweren spørger til en svaghed. Hvad er stærkest?',
        options: [
          'Sig noget der lyder som en styrke.',
          'Nævn en reel svaghed og forklar, hvordan du arbejder på den.',
          'Undgå spørgsmålet ved at fortælle om en styrke.',
        ],
        correct: 1,
        explanation: 'Interviewere kigger efter selvindsigt og udvikling — ikke en tilslebet PR-version.',
      },
    ],
    professional: [
      {
        id: 'f1', type: 'choice', skill,
        prompt: skill
          ? `Opslaget lægger vægt på "${skill}". Hvordan viser du bedst den kompetence til samtalen?`
          : 'Hvordan viser du bedst en kompetence fra opslaget til samtalen?',
        options: [
          'Sige at jeg har erfaring med det.',
          'Give et konkret eksempel med tal eller resultater.',
          'Henvise til at det står på mit CV.',
        ],
        correct: 1,
        explanation: 'Konkrete eksempler med målbare resultater er langt mere overbevisende end selvbeskrivelser.',
      },
      ...perSkill.professional,
      {
        id: 'f2', type: 'choice',
        prompt: 'Du bliver spurgt om et værktøj, du ikke kender. Hvad gør du?',
        options: [
          'Siger at du kender det udmærket.',
          'Siger det direkte, og fortæller hvordan du tidligere har lært noget lignende hurtigt.',
          'Skifter emne.',
        ],
        correct: 1,
        explanation: 'Ærlighed kombineret med dokumenteret læringsevne er langt stærkere end en bluff, der falder fra hinanden.',
      },
      ...(hasSkills ? [] : [{
        id: 'f3', type: 'free',
        prompt: 'Giv et eksempel fra dit studie eller studiejob, hvor du har brugt en af dine faglige styrker.',
        hint: 'Sæt scene, forklar din rolle, og afslut med et resultat.',
      }]),
      {
        id: 'f4', type: 'choice',
        prompt: 'Hvordan viser du bedst faglig nysgerrighed?',
        options: [
          'Fortæl at du læser meget.',
          'Nævn et konkret kursus eller projekt, du selv har startet.',
          'Sig at du elsker faget.',
        ],
        correct: 1,
        explanation: 'Konkret handling slår hensigter. Selvstartede projekter viser drive uden at du behøver sige ordet.',
      },
    ],
    motivation: [
      {
        id: 'm1', type: 'choice',
        prompt: 'Hvorfor vil du gerne arbejde her? Hvilket svar er stærkest?',
        options: [
          'Fordi det er en spændende virksomhed med et godt ry.',
          'Fordi jeg har brug for et job efter studiet.',
          'Fordi jeres arbejde med bæredygtig logistik matcher det projekt, jeg skrev bachelor om.',
        ],
        correct: 2,
        explanation: 'Stærke motivationssvar kobler noget specifikt ved virksomheden til din egen erfaring.',
      },
      {
        id: 'm2', type: 'choice',
        prompt: 'Til sidst spørger de: "Har du spørgsmål til os?" Hvad gør du?',
        options: [
          'Siger nej tak, det hele er blevet dækket.',
          'Spørger om løn og ferie.',
          'Stiller et spørgsmål om teamet eller de første 3 måneder i rollen.',
        ],
        correct: 2,
        explanation: 'Spørgsmålet er en del af vurderingen. Et gennemtænkt spørgsmål viser reel interesse i rollen.',
      },
      {
        id: 'm3', type: 'free',
        prompt: 'Hvad er den ene ting ved denne virksomhed, der gør, at du specifikt søger her?',
        hint: 'Vær konkret, og kobl det til det, opslaget lægger vægt på.',
      },
      {
        id: 'm4', type: 'choice',
        prompt: 'Hvor ser du dig selv om fem år?',
        options: [
          'Præcist samme stilling.',
          'I en rolle hvor jeg har fået mere ansvar og fordybelse inden for feltet.',
          'Aner det ikke — livet skal bare gå fremad.',
        ],
        correct: 1,
        explanation: 'Interviewerne vil se retning og modenhed — ikke en detaljeret karriereplan.',
      },
      {
        id: 'm5', type: 'free', skill,
        prompt: skill
          ? `Hvorfor motiverer det dig at arbejde med ${skill}, som opslaget lægger vægt på?`
          : 'Hvilken del af jobbet glæder du dig mest til, og hvorfor?',
        hint: 'Kobl det til noget, du konkret har gjort eller lært.',
      },
      {
        id: 'm6', type: 'choice',
        prompt: 'Du bliver spurgt om din lønforventning. Hvad er stærkest?',
        options: [
          'Siger at du tager, hvad de tilbyder.',
          'Nævner et realistisk spænd baseret på fx din fagforenings lønstatistik.',
          'Nævner et meget højt tal for at have noget at forhandle med.',
        ],
        correct: 1,
        explanation: 'Et begrundet spænd viser, at du har undersøgt markedet, og giver plads til forhandling.',
      },
    ],
  };

  return bank;
}

// ---------- Interview-simulator (lokal motor) ----------

const INTERVIEW_FALLBACK = [
  'Fortæl kort om dig selv, og hvorfor du søger denne stilling.',
  'Fortæl om en situation, hvor du stod over for en svær opgave. Hvad gjorde du?',
  'Hvad er din største faglige styrke, og hvordan har du brugt den?',
  'Fortæl om en gang, hvor noget ikke gik som planlagt. Hvad lærte du?',
  'Hvorfor skal vi vælge dig frem for de andre kandidater?',
];

// Vælger hovedspørgsmål: skiftevis adfærd, faglig og motivation, kun fritekst.
export function interviewPlan(bank, count) {
  const pools = ['behavior', 'professional', 'motivation']
    .map((key) => (bank?.[key] || []).filter((q) => q.type === 'free'));
  const plan = [];
  for (let i = 0; plan.length < count && i < 10; i++) {
    for (const pool of pools) {
      if (pool[i] && plan.length < count) plan.push(pool[i]);
    }
  }
  for (const prompt of INTERVIEW_FALLBACK) {
    if (plan.length >= count) break;
    plan.push({ type: 'free', category: 'behavior', star: true, prompt });
  }
  return plan;
}

// Opfølgning, når svaret er vagt. null betyder, at svaret er godt nok til at gå videre.
export function interviewFollowUp(answer, question) {
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const star = detectStar(lower);
  if (words < 20) return 'Kan du uddybe det med et konkret eksempel?';
  // Motivation handler om "hvorfor" — der giver handling og resultat ikke mening.
  if (question?.category === 'motivation') return null;
  if (!star.action) return 'Hvad gjorde du helt konkret selv — ikke teamet, men dig?';
  if (!star.result) return 'Hvad blev resultatet? Kan du sætte tal på?';
  return null;
}

// Tæller manglende STAR-dele på tværs af svar — bruges i den lokale samlede vurdering.
export function starGaps(answers) {
  const gaps = { situation: 0, action: 0, result: 0 };
  for (const a of answers) {
    const star = detectStar(a.toLowerCase());
    for (const key of Object.keys(gaps)) if (!star[key]) gaps[key] += 1;
  }
  return gaps;
}
