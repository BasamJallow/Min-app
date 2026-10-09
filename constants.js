// Faste data som flere skærme deler.
// weight: adfærd og situationsspørgsmål vægtes højest, brain teasers lavest.

export const CATEGORIES = [
  { key: 'behavior', name: 'Adfærd', desc: 'Træn STAR-metoden', icon: '💬', weight: 1.5 },
  { key: 'professional', name: 'Faglig', desc: 'Kompetencer fra opslaget', icon: '💼', weight: 1.25 },
  { key: 'motivation', name: 'Motivation', desc: 'Hvorfor lige dem?', icon: '💡', weight: 1 },
  { key: 'brain', name: 'Brain Teasers', desc: 'Vis din tankeproces', icon: '🧠', weight: 0.75 },
];

// Interview-simulatoren: antal hovedspørgsmål og opfølgninger pr. spørgsmål.
export const INTERVIEW = {
  mainQuestions: 4,
  maxFollowUps: 1,
  xpPerPoint: 0.8,
};

// Svag-punkt-træning: antal spørgsmål i alt, heraf nye fra AI, og vægt som adfærd.
export const WEAKNESS = {
  questions: 5,
  aiQuestions: 3,
  weight: 1.5,
};

// Taletid for et godt mundtligt svar (sekunder).
export const SPEAKING = {
  minSeconds: 30,
  maxSeconds: 150,
};

// "Tal frit" i jobsamtalen: hvornår en pause betyder, at kandidaten er færdig.
// silenceDb kan justeres, hvis telefonen opfanger for meget eller for lidt baggrundsstøj.
export const VOICE_TURN = {
  silenceDb: -45,
  silenceMs: 1800,
  minSpeechMs: 700,
  maxAnswerSeconds: 180,
  startDelayMs: 300,
};

// PrepPal Pro (test med Stripe). Prisen skal matche produktet i Stripe Dashboard.
export const PRO = {
  name: 'PrepPal Pro',
  price: '49 kr. / måned',
  benefits: [
    'Ubegrænsede jobsamtaler med AI-interviewer',
    'Tal frit med naturlig AI-stemme',
    'Forberedelsesark målrettet hvert opslag',
    'Træning af dine svage punkter',
  ],
};

// Stripes testkort — virker kun i sandkassen.
export const STRIPE_TEST_CARDS = [
  { number: '4242 4242 4242 4242', result: 'Betalingen lykkes' },
  { number: '4000 0000 0000 0002', result: 'Kortet bliver afvist' },
  { number: '4000 0025 0000 3155', result: 'Kræver godkendelse (3D Secure)' },
];

// Afstand til navigationsbaren på iOS, så tastaturet ikke dækker tekstfelter.
export const KEYBOARD_OFFSET = 90;

// Fiktivt, men realistisk opslag til "Prøv med eksempel".
export const EXAMPLE_JOB_POST = `Junior dataanalytiker til Nordlys Logistik A/S

Vil du bruge data til at gøre dansk logistik grønnere? Vi søger en junior dataanalytiker til vores analyseteam i Aarhus.

Dine opgaver:
- Analysere leverings- og rutedata i SQL og Excel og finde mønstre, der kan spare kørsel og CO2
- Bygge og vedligeholde dashboards i Power BI til ledelsen og vores driftsteams
- Formidle dine resultater klart til kolleger uden teknisk baggrund
- Samarbejde tværfagligt med drift, økonomi og IT om forbedringsprojekter

Vi forventer, at du:
- Har en relevant uddannelse, fx inden for økonomi, statistik eller datalogi
- Er struktureret og har overblik, også når der er travlt
- Er nysgerrig, tager initiativ og trives med at arbejde selvstændigt
- Kommunikerer godt på dansk og engelsk

Vi tilbyder et uformelt miljø med sparring fra erfarne kolleger, fleksible arbejdstider og mulighed for efteruddannelse.`;
