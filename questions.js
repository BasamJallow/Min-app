// Mock-motor: simulerer AI-analyse af jobopslaget.
// Kan senere udskiftes med et rigtigt API-kald.

const KEYWORDS = ['analyse', 'data', 'kunde', 'projekt', 'salg', 'udvikling', 'strategi'];

export function analyzeJobPost(text) {
  const lower = text.toLowerCase();
  const found = KEYWORDS.filter((k) => lower.includes(k));
  return found.length > 0 ? found : ['samarbejde', 'ansvar'];
}

export function generateQuestions(skills) {
    const skill = skills[0];
  
    return {
      brain: [
        {
          id: 'b1', type: 'free',
          prompt: 'Hvor mange kaffekopper drikkes der på et kontor i København på en uge? Forklar din fremgangsmåde.',
          hint: 'Vi vurderer din tankeproces, ikke tallet.',
        },
        {
          id: 'b2', type: 'free',
          prompt: 'Hvor meget ville du tage i pris for at vaske alle vinduer i København?',
          hint: 'Bryd det ned: antal bygninger, tid per vindue, timeløn.',
        },
        {
          id: 'b3', type: 'free',
          prompt: 'Vores omsætning er faldet 15% på tre måneder. Hvordan ville du finde ud af hvorfor?',
          hint: 'Tænk i hypoteser, ikke gæt.',
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
      ],
    };
  }