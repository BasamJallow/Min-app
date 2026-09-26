// Regelbaseret mock-motor: simulerer AI-analyse af jobopslaget og genererer spørgsmål.
// Bruges af services/questionService.js — det er dét lag skærmene taler med.
// Når et rigtigt API kobles på, kan denne fil fjernes uden at røre skærmene.

const KEYWORDS = [
  'analyse', 'data', 'kunde', 'projekt', 'salg',
  'udvikling', 'strategi', 'ledelse', 'kommunikation', 'design',
];

export function analyzeJobPost(text) {
  const lower = text.toLowerCase();
  const found = KEYWORDS.filter((k) => lower.includes(k));
  return found.length > 0 ? found : ['samarbejde', 'ansvar'];
}

// Fritekst-evaluering: kigger på længde og bestemte nøgleord.
// Er bevidst simpel — det rigtige tjek skal komme fra et sprogmodel-API.
export function evaluateFreeText(answer) {
  const words = answer.trim().split(/\s+/).length;
  const lower = answer.toLowerCase();
  const structureHints = ['fordi', 'derfor', 'jeg', 'situation', 'resultat', 'eksempel'];
  const hits = structureHints.filter((h) => lower.includes(h)).length;

  if (words < 20) {
    return {
      label: 'Kan styrkes',
      text: 'Uddyb dit svar med konkrete eksempler og et resultat. Kort er ikke altid stærkt.',
      xp: 5,
      correct: false,
    };
  }
  if (hits >= 2) {
    return {
      label: 'Stærkt svar',
      text: 'Godt struktureret — du kobler situation og handling. Prøv også at pege på et målbart resultat.',
      xp: 20,
      correct: true,
    };
  }
  return {
    label: 'Godt forsøg',
    text: 'Godt gået at komme i gang. Prøv at bygge svaret op om situation, handling og resultat.',
    xp: 12,
    correct: true,
  };
}

export function generateQuestions(skills) {
  const skill = skills[0];
  const skill2 = skills[1] || skill;

  return {
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
    ],
    behavior: [
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
      {
        id: 'a4', type: 'free',
        prompt: 'Fortæl kort om en gang du har arbejdet i et team, hvor tingene ikke gik som planlagt.',
        hint: 'Brug STAR: Situation, Task, Action, Result.',
      },
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
        id: 'f1', type: 'choice',
        prompt: `Opslaget lægger vægt på "${skill}". Hvordan viser du bedst den kompetence til samtalen?`,
        options: [
          'Sige at jeg har erfaring med det.',
          'Give et konkret eksempel med tal eller resultater.',
          'Henvise til at det står på mit CV.',
        ],
        correct: 1,
        explanation: 'Konkrete eksempler med målbare resultater er langt mere overbevisende end selvbeskrivelser.',
      },
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
      {
        id: 'f3', type: 'free',
        prompt: `Giv et eksempel fra dit studie eller studiejob, hvor du har arbejdet konkret med "${skill2}".`,
        hint: 'Sæt scene, forklar din rolle, og afslut med et resultat.',
      },
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
        hint: 'Vær konkret. Undgå at nævne størrelse eller ry alene.',
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
    ],
  };
}
