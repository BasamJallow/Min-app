# PrepPal

PrepPal er en React Native / Expo-app, der forbereder brugeren til en jobsamtale ud fra et konkret jobopslag. Brugeren indsætter opslaget, appen finder de vigtigste kompetencer og laver øvelsesspørgsmål i fire kategorier (adfærd/STAR, faglig, motivation og brain teasers) med feedback, XP og progression. I anden iteration er appen udvidet med bl.a. en AI-interviewer, man kan tale med, træning af svage punkter og et forberedelsesark.

## Links

- **GitHub:** https://github.com/BasamJallow/Min-app
- **Demovideo – godkendelsesopgave 2:** https://www.loom.com/share/5311e7aaf16d409d873ad2b76aa0e1fb
- Demovideo – godkendelsesopgave 1: https://www.loom.com/share/1c78aa8be41d49ecbb7eb69dae4815ff

## Hvem har kodet hvad

Appen er udviklet af Basam Jallow. Claude Code er brugt som kodeassistent undervejs.

## Nyt i iteration 2

Ændringerne bygger på feedbacken fra godkendelsesopgave 1 og brugerinterviews. Den vigtigste indsigt var, at feedback kun føltes troværdig, når den var bundet til jobopslaget.

| Funktion | Hvad den gør |
|---|---|
| Feedback bundet til opslaget | Kompetencer findes i opslaget (dansk/engelsk ordbog eller OpenAI), og feedback på fritekst tjekker, om svaret viser dem, og om adfærdssvar har STAR (situation, handling, resultat) |
| Generativ AI (OpenAI) | Analyse af opslag, spørgsmål, feedback, "Se et stærkt svar", forberedelsesark og interviewer — med lokal regelbaseret motor som reserve |
| Jobsamtale | Realistisk samtale med en AI-interviewer, der stiller opfølgende spørgsmål. "Tal frit": brugeren taler, og appen opdager pauser og sender svaret selv (mikrofon, tale til tekst og oplæsning) |
| Svage punkter | Kort session med spørgsmål om de kompetencer, brugeren har klaret dårligst |
| Forberedelsesark | Det vigtigste at fremhæve, spørgsmål til virksomheden og en tjekliste — kan deles |
| Mine opslag | Alle analyserede opslag gemmes, så man kan fortsætte træningen senere |
| Resultat og progression | Stærke/svage kompetencer efter hver kategori, samlet parathed og frisk bane for hvert nyt opslag |
| PrepPal Pro (test) | Testbetaling med Stripe Payment Link i sandkassen |

## Krav fra opgaven — hvor de er opfyldt

| Krav | Hvor |
|---|---|
| 1-2 nye knapper | Fx "Jobsamtale", "Svage punkter", "Forberedelsesark", "Se et stærkt svar", "Prøv igen" og "Prøv med eksempel" |
| Ny screen | Nye skærme i iteration 2: `JobsScreen`, `InterviewScreen`, `PrepScreen`, `ProScreen` (10 skærme i alt i `/screens`) |
| Navigation | Stack-navigation sat op med `createNativeStackNavigator` i `App.js` |
| Ny funktionalitet | Generativ AI (OpenAI) og mikrofon/tale i jobsamtalen |
| Gemmer og henter data | AsyncStorage i `services/storageService.js`: sessioner, jobopslag, progression og abonnement huskes, når appen lukkes. `services/cacheService.js` gemmer AI-analyser |
| Styling i separat fil | Al styling ligger i `styles.js` — ingen inline styles eller `StyleSheet` i skærmene |
| README og demovideo | Denne fil og linket ovenfor |

## Kom i gang

Kræver [Node.js](https://nodejs.org/) og [Expo Go](https://expo.dev/client) på telefonen (eller en iOS-/Android-simulator).

```bash
npm install
npm start
```

Scan QR-koden med Expo Go (Android) eller Kamera-appen (iOS).

**Appen virker uden nøgler** — så bruges den lokale, regelbaserede motor. For at slå AI og betaling til:

1. Kopiér `.env.example` til en ny fil, der hedder `.env`
2. Udfyld `EXPO_PUBLIC_OPENAI_API_KEY` (og evt. `EXPO_PUBLIC_STRIPE_PAYMENT_LINK`)
3. Genstart med `npx expo start -c`

`.env` står i `.gitignore` og bliver aldrig committet. OpenAI-nøglen bygges ind i appen, så den er kun til test — del ikke builds med nøglen i.

## Sådan bruges appen

1. Indsæt et jobopslag (eller tryk **Prøv med eksempel**) og tryk **Analysér opslag**
2. Vælg en kategori på banen og besvar spørgsmålene — fritekstsvar får feedback, og du kan trykke **Prøv igen** eller **Se et stærkt svar**
3. Prøv **Jobsamtale** og tal frit med intervieweren
4. Brug **Svage punkter** og **Forberedelsesark** inden samtalen
5. Se historik og progression via bundmenuen

**Stripe (test):** "PrepPal Pro" på profilen åbner et Payment Link fra Stripes sandkasse. Betal med testkortet `4242 4242 4242 4242`, en fremtidig udløbsdato og en vilkårlig CVC.

## Projektstruktur

```
App.js            Navigation (stack)
styles.js         Al styling og farvepalet
config.js         Nøgler og links fra .env
constants.js      Faste data: kategorier, vægte, grænser
utils.js          Små hjælpefunktioner
questions.js      Lokal regelbaseret motor (bruges uden OpenAI og som reserve)
screens/          Én fil pr. skærm
services/         Datalag — skærmene kalder aldrig en datakilde direkte
  questionService   Spørgsmål og vurdering
  interviewService  Jobsamtalens forløb
  voiceService      Optagelse, tale til tekst og oplæsning
  prepService       Forberedelsesark
  paymentService    Stripe Payment Link
  storageService    AsyncStorage (klar til Firestore)
  cacheService      Cache af AI-analyser
  aiService         Kald til OpenAI
```
