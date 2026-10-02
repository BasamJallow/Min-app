# PrepPal

En React Native / Expo-app der hjælper brugeren med at træne jobinterviews ud fra et jobopslag.

## Links

- **GitHub:** https://github.com/BasamJallow/Min-app
- **Video-gennemgang:** https://www.loom.com/share/1c78aa8be41d49ecbb7eb69dae4815ff


## Kom i gang

Kræver [Node.js](https://nodejs.org/) og [Expo Go](https://expo.dev/client) på din telefon (eller en iOS/Android-simulator).

```bash
# 1. Installer afhængigheder
npm install

# 2. Start udviklingsserveren
npm start
```

### AI-feedback med OpenAI (valgfrit)

Uden nøgle kører appen på en lokal regelbaseret motor. Sådan slår du OpenAI til:

1. Kopiér `.env.example` til en ny fil, der hedder `.env`
2. Indsæt nøglen efter `EXPO_PUBLIC_OPENAI_API_KEY=`
3. Genstart med `npx expo start -c`

`.env` står i `.gitignore` og må aldrig committes. Tjek med `git status`, at den ikke dukker op.
Nøglen bliver bygget ind i appen, så den er kun til test — del ikke builds med nøglen i.

Scan QR-koden med Expo Go (Android) eller Kamera-appen (iOS) for at åbne appen på din telefon.

Alternativt:

```bash
npm run ios      # åbn i iOS-simulator
npm run android  # åbn i Android-emulator
npm run web      # åbn i browser
```

## Sådan bruges appen

1. Indsæt et jobopslag på forsiden og tryk **Analysér opslag**. // i forhold til test så bare indtæst en masse ord så I kan gå videre i procesen.
2. Vælg en kategori (Brain Teasers, Adfærd, Faglig, Motivation) og besvar spørgsmålene.
3. Tjek din progression og historik under 👤-fanen evt

## Obligatoriske krav — hvor de er opfyldt

| Krav | Hvor |
|---|---|
| Mindst 3 screens | 6 skærme i `/screens`: JobPost, Categories, Question, Result, History, Profile |
| Mindst 3 views | `View` bruges i alle skærme, fx kort, banner, bundmenu og feedbackboks |
| Mindst 2 knapper, mindst én navigerer | Fx "Analysér opslag" (navigerer til banen), "Prøv med eksempel", "Prøv igen", "Se resultat" og bundmenuen |
| Mindst 1 FlatList | `HistoryScreen.js` og `ProfileScreen.js` |
| Styling i separat fil | Al styling ligger i `styles.js`; ingen inline styles eller `StyleSheet` i skærmene |
