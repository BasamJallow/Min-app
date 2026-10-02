// Tale i jobsamtalen: optagelse, tale til tekst (OpenAI) og oplæsning af intervieweren.
// Oplæsning bruger telefonens stemme som standard og OpenAIs stemme, når brugeren vælger det.
// Ved Firebase-integration: flyt kaldene til tale til tekst og AI-stemme til en Cloud Function.

import * as Speech from 'expo-speech';
import {
  createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { AI_API, USE_MOCK_AI } from '../config';

export const RECORDING_PRESET = RecordingPresets.HIGH_QUALITY;

// Tale til tekst kræver OpenAI — uden nøgle skjules mikrofonen.
export const CAN_TRANSCRIBE = !USE_MOCK_AI;
export const CAN_USE_AI_VOICE = !USE_MOCK_AI;

let recordingStartedAt = 0;
let player = null;
let lastSpeechFile = null;

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

async function speakWithOpenAI(text) {
  const res = await postWithModelFallback([AI_API.speechModel, 'tts-1'], (model) => fetch(AI_API.speechEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API.apiKey}` },
    body: JSON.stringify({ model, voice: AI_API.voice, input: text, response_format: 'mp3' }),
  }));
  const bytes = new Uint8Array(await res.arrayBuffer());
  const file = new File(Paths.cache, `interviewer-${Date.now()}.mp3`);
  file.write(bytes);
  console.log('OpenAI (AI-stemme): replik læst op');

  // Den forrige replik er spillet færdig eller stoppet — ryd op i den.
  if (lastSpeechFile) {
    try { lastSpeechFile.delete(); } catch { /* findes ikke længere */ }
  }
  lastSpeechFile = file;
  player = createAudioPlayer(file.uri);
  player.play();
}

// Læser en replik op. aiVoice: brug OpenAIs stemme i stedet for telefonens.
export async function speak(text, { aiVoice = false } = {}) {
  await stopSpeaking();
  if (aiVoice && CAN_USE_AI_VOICE) {
    try {
      await speakWithOpenAI(text);
      return;
    } catch (e) {
      console.warn('AI-stemme fejlede, bruger telefonens stemme:', e.message);
    }
  }
  Speech.speak(text, { language: 'da-DK' });
}

export async function stopSpeaking() {
  Speech.stop();
  if (player) {
    player.pause();
    player.remove();
    player = null;
  }
}
