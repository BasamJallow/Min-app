import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  ActivityIndicator, Alert, Keyboard, Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { styles, palette } from '../styles';
import {
  createInterview, interviewerTurn, addAnswer, endInterview, interviewProgress,
  summarizeInterview, interviewSession,
} from '../services/interviewService';
import {
  RECORDING_PRESET, CAN_TRANSCRIBE, CAN_USE_AI_VOICE,
  startRecording, stopRecording, transcribe, speak, stopSpeaking,
  createSilenceDetector, meterLevel,
} from '../services/voiceService';
import { getJob, saveSession } from '../services/storageService';
import { goToBoard, formatSeconds } from '../utils';
import { KEYBOARD_OFFSET, VOICE_TURN } from '../constants';

const METER_BARS = [1, 2, 3, 4, 5];

// Tekst under interviewer-cirklen i "Tal frit".
const PHASE_TEXT = {
  speaking: 'Intervieweren taler…',
  listening: 'Din tur — tal nu',
  transcribing: 'Skriver dit svar ned…',
  thinking: 'Intervieweren tænker…',
  paused: 'På pause',
};

export default function InterviewScreen({ navigation }) {
  const { jobId, skills, questions, jobPreview } = useRoute().params;
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(true);
  const [summary, setSummary] = useState(null);
  // "Tal frit" er standard, når tale til tekst er muligt; ellers chat.
  const [talkMode, setTalkMode] = useState(CAN_TRANSCRIBE);
  const [soundOn, setSoundOn] = useState(true);
  const [aiVoice, setAiVoice] = useState(CAN_TRANSCRIBE);
  const [showTranscript, setShowTranscript] = useState(false);
  const [phase, setPhase] = useState('thinking');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const listRef = useRef(null);
  const detectorRef = useRef(null);
  const finishingRef = useRef(false);
  const pausedRef = useRef(false);

  const recorder = useAudioRecorder(RECORDING_PRESET);
  const recorderState = useAudioRecorderState(recorder, 200);

  const start = async () => {
    setBusy(true);
    setSummary(null);
    setAnswer('');
    setPhase('thinking');
    pausedRef.current = false;
    const job = jobId ? await getJob(jobId) : null;
    const fresh = createInterview({
      title: job?.title, text: job?.text || job?.preview || jobPreview || '', skills, questions,
    });
    setInterview(await interviewerTurn(fresh));
    setBusy(false);
  };

  useEffect(() => {
    start();
    return () => {
      pausedRef.current = true;
      stopSpeaking();
      // Optageren frigives af hooket; et stop kan fejle, hvis det allerede er sket.
      try { recorder.stop().catch(() => {}); } catch { /* allerede frigivet */ }
    };
  }, []);

  const finish = async (state) => {
    stopSpeaking();
    setInterview(state);
    setBusy(true);
    const result = await summarizeInterview(state);
    if (result.breakdown.length > 0) await saveSession(interviewSession(result, { jobId, jobPreview }));
    setSummary(result);
    setBusy(false);
  };

  // Sender et svar, skrevet eller talt. seconds er sat, når svaret blev talt ind.
  const sendAnswer = async (text, seconds) => {
    if (text.trim().length < 3) return;
    Keyboard.dismiss();
    const withAnswer = addAnswer(interview, text, seconds);
    setInterview(withAnswer);
    setAnswer('');
    setBusy(true);
    setPhase('thinking');
    const next = await interviewerTurn(withAnswer);
    if (next.done) {
      await finish(next);
    } else {
      setInterview(next);
      setBusy(false);
    }
  };

  // ---------- "Tal frit": intervieweren taler, derefter lytter appen automatisk ----------

  const startListening = async () => {
    if (pausedRef.current) return;
    const ok = await startRecording(recorder);
    if (!ok) {
      Alert.alert('Ingen adgang til mikrofonen', 'Giv PrepPal adgang i telefonens indstillinger, eller skift til chat.');
      setTalkMode(false);
      return;
    }
    detectorRef.current = createSilenceDetector();
    finishingRef.current = false;
    setRecording(true);
    setPhase('listening');
  };

  // Afslutter kandidatens tur: stop optagelse, tale til tekst og send.
  const finishTurn = async () => {
    if (finishingRef.current || !recording) return;
    finishingRef.current = true;
    setRecording(false);
    setTranscribing(true);
    setPhase('transcribing');
    try {
      const { uri, seconds } = await stopRecording(recorder);
      const text = await transcribe(uri);
      if (text.length < 3) {
        setTranscribing(false);
        if (talkMode) {
          await speak('Undskyld, det fangede jeg ikke. Vil du sige det igen?', { aiVoice });
          await startListening();
        } else {
          Alert.alert('Vi hørte ikke noget', 'Prøv igen, og tal tydeligt tæt på telefonen.');
        }
        return;
      }
      setTranscribing(false);
      await sendAnswer(text, seconds);
    } catch (e) {
      console.warn('Tale til tekst fejlede:', e.message);
      setTranscribing(false);
      if (talkMode) {
        setPhase('paused');
        pausedRef.current = true;
        Alert.alert('Det gik ikke at omsætte din tale', 'Tryk "Fortsæt" for at prøve igen, eller skift til chat.');
      } else {
        Alert.alert('Det gik ikke at omsætte din tale', 'Prøv igen, eller skriv dit svar i stedet.');
      }
    }
  };

  // Ny replik fra intervieweren: læs op, og lyt bagefter i "Tal frit".
  const lastMessage = interview?.messages[interview.messages.length - 1];
  useEffect(() => {
    if (!lastMessage || lastMessage.role !== 'interviewer') return;
    if (!talkMode) {
      if (soundOn) speak(lastMessage.text, { aiVoice });
      return;
    }
    let cancelled = false;
    (async () => {
      setPhase('speaking');
      await speak(lastMessage.text, { aiVoice });
      if (cancelled || interview?.done || pausedRef.current) return;
      // Lille pause, så mikrofonen ikke fanger slutningen af interviewerens stemme.
      await new Promise((r) => setTimeout(r, VOICE_TURN.startDelayMs));
      if (!cancelled) await startListening();
    })();
    return () => { cancelled = true; };
  }, [lastMessage?.id]);

  // Lyt efter pause i talen, mens der optages.
  useEffect(() => {
    if (!talkMode || !recording || !detectorRef.current) return;
    const state = detectorRef.current.update(recorderState.metering, Date.now());
    const tooLong = recorderState.durationMillis / 1000 >= VOICE_TURN.maxAnswerSeconds;
    if (state === 'done' || tooLong) finishTurn();
  }, [recorderState.durationMillis]);

  const togglePause = async () => {
    if (!pausedRef.current) {
      pausedRef.current = true;
      stopSpeaking();
      if (recording) {
        setRecording(false);
        await stopRecording(recorder);
      }
      setPhase('paused');
      return;
    }
    pausedRef.current = false;
    await startListening();
  };

  const switchMode = async () => {
    stopSpeaking();
    if (recording) {
      setRecording(false);
      await stopRecording(recorder);
    }
    pausedRef.current = false;
    setTalkMode(!talkMode);
    if (!talkMode) await startListening();
  };

  // ---------- Chat: tryk for at tale eller skriv ----------

  const toggleChatRecording = async () => {
    if (!recording) {
      const ok = await startRecording(recorder);
      if (!ok) {
        Alert.alert('Ingen adgang til mikrofonen', 'Giv PrepPal adgang til mikrofonen i telefonens indstillinger.');
        return;
      }
      finishingRef.current = false;
      setRecording(true);
      return;
    }
    await finishTurn();
  };

  const toggleSound = () => {
    if (soundOn) stopSpeaking();
    setSoundOn(!soundOn);
  };

  const confirmEnd = () => {
    Alert.alert('Afslut samtalen?', 'Du får en vurdering af de svar, du har givet indtil nu.', [
      { text: 'Fortsæt samtalen', style: 'cancel' },
      {
        text: 'Afslut',
        style: 'destructive',
        onPress: async () => {
          pausedRef.current = true;
          if (recording) {
            setRecording(false);
            await stopRecording(recorder);
          }
          finish(endInterview(interview));
        },
      },
    ]);
  };

  const progress = interview ? interviewProgress(interview) : null;
  const done = interview?.done;
  const locked = busy || transcribing;
  const seconds = Math.round(recorderState.durationMillis / 1000);
  const level = recording ? meterLevel(recorderState.metering) : 0;

  const renderMessage = ({ item }) => {
    const mine = item.role === 'candidate';
    return (
      <View style={[styles.bubble, mine ? styles.bubbleCandidate : styles.bubbleInterviewer]}>
        {!mine && <Text style={styles.bubbleLabel}>Interviewer</Text>}
        <Text style={[styles.bubbleText, mine && styles.bubbleTextCandidate]}>{item.text}</Text>
        {mine && item.seconds ? (
          <Text style={styles.bubbleMeta}>🎙️ {formatSeconds(item.seconds)}</Text>
        ) : null}
      </View>
    );
  };

  const renderSummary = () => (
    <View style={styles.feedbackBox}>
      <Text style={styles.feedbackLabel}>{summary.label} · {summary.score}% · +{summary.xp} XP</Text>
      <Text style={styles.feedbackText}>{summary.summary}</Text>

      {summary.strengths.map((s) => (
        <View key={`s-${s}`} style={styles.resultBreakdownItem}>
          <Text style={styles.resultBreakdownIcon}>✅</Text>
          <Text style={styles.resultBreakdownText}>{s}</Text>
        </View>
      ))}
      {summary.improvements.map((s) => (
        <View key={`i-${s}`} style={styles.resultBreakdownItem}>
          <Text style={styles.resultBreakdownIcon}>⚠️</Text>
          <Text style={styles.resultBreakdownText}>{s}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={start}>
        <Text style={styles.buttonText}>Ny samtale</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => goToBoard(navigation)}>
        <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Tilbage til banen</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (transcribing) {
      return (
        <View style={[styles.bubble, styles.bubbleCandidate]}>
          <Text style={[styles.bubbleText, styles.bubbleTextCandidate]}>Skriver dit svar ned…</Text>
        </View>
      );
    }
    if (busy && !done) {
      return (
        <View style={[styles.bubble, styles.bubbleInterviewer]}>
          <Text style={styles.bubbleLabel}>Interviewer</Text>
          <Text style={styles.bubbleText}>Skriver…</Text>
        </View>
      );
    }
    if (busy && done) {
      return (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={palette.LIME} />
          <Text style={styles.loadingTitle}>Vurderer samtalen…</Text>
        </View>
      );
    }
    return summary ? renderSummary() : null;
  };

  // Samtalevisning: cirkel for intervieweren, lydmåler og knapper i stedet for chatbobler.
  const renderTalk = () => {
    const lastInterviewer = [...(interview?.messages || [])].reverse().find((m) => m.role === 'interviewer');
    return (
      <View style={styles.talkRoot}>
        <View
          style={[
            styles.talkAvatar,
            phase === 'speaking' && styles.talkAvatarSpeaking,
            phase === 'listening' && styles.talkAvatarListening,
          ]}
        >
          <Text style={styles.talkAvatarIcon}>{phase === 'listening' ? '🎙️' : '🧑‍💼'}</Text>
        </View>
        <Text style={styles.talkPhase}>{PHASE_TEXT[phase]}</Text>

        {phase === 'listening' && (
          <>
            <View style={styles.meterRow}>
              {METER_BARS.map((bar) => (
                <View key={bar} style={[styles.meterBar, bar <= level && styles.meterBarActive]} />
              ))}
            </View>
            <Text style={styles.talkTimer}>{formatSeconds(seconds)}</Text>
          </>
        )}
        {(phase === 'thinking' || phase === 'transcribing') && (
          <ActivityIndicator size="small" color={palette.LIME} />
        )}

        {showTranscript && lastInterviewer && (
          <Text style={styles.talkCaption}>"{lastInterviewer.text}"</Text>
        )}

        <View style={styles.talkButtons}>
          {phase === 'listening' && (
            <TouchableOpacity style={styles.button} onPress={finishTurn}>
              <Text style={styles.buttonText}>Jeg er færdig</Text>
            </TouchableOpacity>
          )}
          {(phase === 'listening' || phase === 'speaking' || phase === 'paused') && (
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={togglePause}>
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
                {phase === 'paused' ? 'Fortsæt' : 'Pause'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowTranscript(!showTranscript)}>
            <Text style={styles.talkLink}>{showTranscript ? 'Skjul tekst' : 'Vis tekst'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const showChat = !talkMode || done;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_OFFSET}
    >
      <View style={styles.interviewTopBar}>
        <Text style={styles.interviewProgress}>
          {progress ? `Spørgsmål ${progress.current} af ${progress.total}` : 'Starter samtalen…'}
        </Text>
        <View style={styles.interviewControls}>
          {CAN_TRANSCRIBE && !done && (
            <TouchableOpacity style={styles.voicePill} onPress={switchMode}>
              <Text style={styles.voicePillText}>{talkMode ? '💬 Chat' : '🗣️ Tal frit'}</Text>
            </TouchableOpacity>
          )}
          {CAN_USE_AI_VOICE && (
            <TouchableOpacity style={styles.voicePill} onPress={() => setAiVoice(!aiVoice)}>
              <Text style={styles.voicePillText}>{aiVoice ? 'AI-stemme' : 'Telefonstemme'}</Text>
            </TouchableOpacity>
          )}
          {!talkMode && (
            <TouchableOpacity onPress={toggleSound}>
              <Text style={styles.interviewIcon}>{soundOn ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
          )}
          {interview && !done && (
            <TouchableOpacity onPress={confirmEnd}>
              <Text style={styles.interviewEnd}>Afslut</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showChat ? (
        <FlatList
          ref={listRef}
          data={interview ? interview.messages : []}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.chatList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      ) : renderTalk()}

      {!talkMode && !done && (
        <View style={styles.footer}>
          {CAN_TRANSCRIBE && (
            <TouchableOpacity
              style={[styles.micButton, recording && styles.micButtonActive, locked && styles.buttonDisabled]}
              disabled={locked}
              onPress={toggleChatRecording}
            >
              <Text style={[styles.micButtonText, recording && styles.micButtonTextActive]}>
                {recording ? `⏹ Stop og send · ${formatSeconds(seconds)}` : '🎙️ Tryk for at tale'}
              </Text>
            </TouchableOpacity>
          )}

          {!recording && (
            <View style={styles.chatInputRow}>
              <TextInput
                style={[styles.input, styles.chatInput]}
                multiline
                scrollEnabled
                placeholder={CAN_TRANSCRIBE ? '…eller skriv dit svar' : 'Skriv dit svar, som du ville sige det…'}
                placeholderTextColor={palette.MUTED}
                value={answer}
                onChangeText={setAnswer}
                editable={!locked}
              />
              <TouchableOpacity
                style={[styles.sendButton, (locked || answer.trim().length < 3) && styles.buttonDisabled]}
                disabled={locked || answer.trim().length < 3}
                onPress={() => sendAnswer(answer)}
              >
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
