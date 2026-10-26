// Tale i jobsamtalen: optagelse, tale til tekst (OpenAI) og oplæsning af intervieweren.
// Oplæsning bruger telefonens stemme som standard og OpenAIs stemme, når brugeren vælger det.
// Ved Firebase-integration: flyt kaldene til tale til tekst og AI-stemme til en Cloud Function.

import * as Speech from 'expo-speech';
import {
  createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { AI_API, USE_MOCK_AI } from '../config';
import { VOICE_TURN } from '../constants';

// Metering giver lydniveauet under optagelsen, så vi kan opdage, når kandidaten holder pause.
export const RECORDING_PRESET = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

// Tale til tekst kræver OpenAI — uden nøgle skjules mikrofonen.
export const CAN_TRANSCRIBE = !USE_MOCK_AI;
export const CAN_USE_AI_VOICE = !USE_MOCK_AI;

let recordingStartedAt = 0;
let player = null;
let lastSpeechFile = null;
let finishSpeaking = null;
let speechId = 0;

// Starter en optagelse. Returnerer false, hvis brugeren ikke giver adgang til mikrofonen.
export async function startRecording(recorder) {
  const permission = await requestRecordingPermissionsAsync();
  if (!permission.granted) return false;
  await stopSpeaking();
  await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  await recorder.prepareToRecordAsync();
  recorder.record();
  recordingStartedAt = Date.now();
  return true;
}

// Stopper optagelsen og returnerer { uri, seconds }.
export async function stopRecording(recorder) {
  await recorder.stop();
  // Tilbage til afspilning via højttaleren — ellers spiller iOS gennem øresneglen.
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  return { uri: recorder.uri, seconds: Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000)) };
}

// Prøver den valgte model først og falder tilbage til en ældre, hvis modellen ikke findes.
async function postWithModelFallback(models, send) {
  let lastError = null;
  for (const model of [...new Set(models)]) {
    const res = await send(model);
    if (res.ok) return res;
    const body = await res.text();
    lastError = new Error(`OpenAI svarede ${res.status}: ${body.slice(0, 200)}`);
    // Kun "ukendt model" og lignende giver mening at prøve igen med en anden model.
    if (res.status !== 400 && res.status !== 404) break;
  }
  throw lastError;
}

// Lydfil → tekst på dansk.
export async function transcribe(uri) {
  const res = await postWithModelFallback([AI_API.transcribeModel, 'whisper-1'], (model) => {
    const form = new FormData();
    form.append('file', { uri, name: 'svar.m4a', type: 'audio/m4a' });
    form.append('model', model);
    form.append('language', 'da');
    return fetch(AI_API.transcribeEndpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${AI_API.apiKey}` },
      body: form,
    });
  });
  const data = await res.json();
  console.log('OpenAI (tale til tekst): svar omsat til tekst');
  return typeof data.text === 'string' ? data.text.trim() : '';
}

// Kaldes, når en replik er læst færdig eller stoppet — løser det ventende speak-løfte.
// Med id ignoreres sene beskeder fra en tidligere replik, der allerede er afløst.
function speechEnded(id) {
  if (id !== undefined && id !== speechId) return;
  const done = finishSpeaking;
  finishSpeaking = null;
  if (done) done();
}

async function speakWithOpenAI(text, id) {
  const res = await postWithModelFallback([AI_API.speechModel, 'tts-1'], (model) => fetch(AI_API.speechEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API.apiKey}` },
    body: JSON.stringify({ model, voice: AI_API.voice, input: text, response_format: 'mp3' }),
  }));
  const bytes = new Uint8Array(await res.arrayBuffer());
  // Er oplæsningen stoppet, mens stemmen blev hentet, skal den ikke spilles alligevel.
  if (id !== speechId) return;
  const file = new File(Paths.cache, `interviewer-${Date.now()}.mp3`);
  file.write(bytes);
  console.log('OpenAI (AI-stemme): replik læst op');

  // Den forrige replik er spillet færdig eller stoppet — ryd op i den.
  if (lastSpeechFile) {
    try { lastSpeechFile.delete(); } catch { /* findes ikke længere */ }
  }
  lastSpeechFile = file;
  player = createAudioPlayer(file.uri);
  player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) speechEnded(id);
  });
  player.play();
}

// Læser en replik op og venter, til den er færdig (eller stoppet).
// aiVoice: brug OpenAIs stemme i stedet for telefonens.
export async function speak(text, { aiVoice = false } = {}) {
  await stopSpeaking();
  speechId += 1;
  const id = speechId;
  const ended = new Promise((resolve) => { finishSpeaking = resolve; });

  let usedAi = false;
  if (aiVoice && CAN_USE_AI_VOICE) {
    try {
      await speakWithOpenAI(text, id);
      usedAi = true;
    } catch (e) {
      console.warn('AI-stemme fejlede, bruger telefonens stemme:', e.message);
    }
  }
  if (!usedAi) {
    const end = () => speechEnded(id);
    Speech.speak(text, { language: 'da-DK', onDone: end, onStopped: end, onError: end });
  }
  // Sikkerhedsnet, hvis telefonen aldrig melder færdig: ca. 0,5 sek. pr. ord plus lidt luft.
  const words = text.split(/\s+/).length;
  const timer = setTimeout(() => speechEnded(id), Math.max(5000, words * 500 + 4000));
  await ended;
  clearTimeout(timer);
}

export async function stopSpeaking() {
  speechId += 1;
  Speech.stop();
  if (player) {
    player.pause();
    player.remove();
    player = null;
  }
  speechEnded();
}

// Holder øje med lydniveauet under en optagelse og afgør, hvornår kandidaten er færdig:
// først når der er talt i et stykke tid, og derefter har været stille i silenceMs.
export function createSilenceDetector(options = VOICE_TURN) {
  let spokeFor = 0;
  let quietSince = null;
  let lastAt = null;
  return {
    // metering i dB (0 = højest, -160 = stille). Returnerer 'waiting', 'speaking' eller 'done'.
    update(metering, now) {
      const step = lastAt === null ? 0 : now - lastAt;
      lastAt = now;
      const loud = typeof metering === 'number' && metering > options.silenceDb;
      if (loud) {
        spokeFor += step;
        quietSince = null;
        return 'speaking';
      }
      if (spokeFor < options.minSpeechMs) return 'waiting';
      if (quietSince === null) quietSince = now;
      return now - quietSince >= options.silenceMs ? 'done' : 'speaking';
    },
    heardSpeech() {
      return spokeFor >= options.minSpeechMs;
    },
  };
}

// Lydniveau 0–5 til en simpel lydmåler.
export function meterLevel(metering) {
  if (typeof metering !== 'number') return 0;
  const normalized = (metering + 60) / 60;
  return Math.max(0, Math.min(5, Math.round(normalized * 5)));
}
