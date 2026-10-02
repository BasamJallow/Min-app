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
} from '../services/voiceService';
import { getJob, saveSession } from '../services/storageService';
import { goToBoard, formatSeconds } from '../utils';
import { KEYBOARD_OFFSET } from '../constants';

export default function InterviewScreen({ navigation }) {
  const { jobId, skills, questions, jobPreview } = useRoute().params;
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(true);
  const [summary, setSummary] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [aiVoice, setAiVoice] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const listRef = useRef(null);

  const recorder = useAudioRecorder(RECORDING_PRESET);
  const recorderState = useAudioRecorderState(recorder);

  const start = async () => {
    setBusy(true);
    setSummary(null);
    setAnswer('');
    const job = jobId ? await getJob(jobId) : null;
    const fresh = createInterview({
      title: job?.title, text: job?.text || job?.preview || jobPreview || '', skills, questions,
    });
    setInterview(await interviewerTurn(fresh));
    setBusy(false);
  };

  useEffect(() => {
    start();
    return () => { stopSpeaking(); };
  }, []);

  // Læs interviewerens nyeste replik op.
  const lastMessage = interview?.messages[interview.messages.length - 1];
  useEffect(() => {
    if (soundOn && lastMessage?.role === 'interviewer') speak(lastMessage.text, { aiVoice });
  }, [lastMessage?.id]);

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
    if (text.trim().length < 3 || busy) return;
    Keyboard.dismiss();
    const withAnswer = addAnswer(interview, text, seconds);
    setInterview(withAnswer);
    setAnswer('');
    setBusy(true);
    const next = await interviewerTurn(withAnswer);
    if (next.done) {
      await finish(next);
    } else {
      setInterview(next);
      setBusy(false);
    }
  };

  const toggleRecording = async () => {
    if (!recording) {
      const ok = await startRecording(recorder);
      if (!ok) {
        Alert.alert('Ingen adgang til mikrofonen', 'Giv PrepPal adgang til mikrofonen i telefonens indstillinger.');
        return;
      }
      setRecording(true);
      return;
    }
    setRecording(false);
    setTranscribing(true);
    try {
      const { uri, seconds } = await stopRecording(recorder);
      const text = await transcribe(uri);
      if (text.length < 3) {
        Alert.alert('Vi hørte ikke noget', 'Prøv igen, og tal tydeligt tæt på telefonen.');
        return;
      }
      await sendAnswer(text, seconds);
    } catch (e) {
      console.warn('Tale til tekst fejlede:', e.message);
      Alert.alert('Det gik ikke at omsætte din tale', 'Prøv igen, eller skriv dit svar i stedet.');
    } finally {
      setTranscribing(false);
    }
  };

  const toggleSound = () => {
    if (soundOn) stopSpeaking();
    setSoundOn(!soundOn);
  };

  const confirmEnd = () => {
    Alert.alert('Afslut samtalen?', 'Du får en vurdering af de svar, du har givet indtil nu.', [
      { text: 'Fortsæt samtalen', style: 'cancel' },
      { text: 'Afslut', style: 'destructive', onPress: () => finish(endInterview(interview)) },
    ]);
  };

  const progress = interview ? interviewProgress(interview) : null;
  const done = interview?.done;
  const locked = busy || transcribing;

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
    if (!summary) return null;
    return (
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
  };

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
          {CAN_USE_AI_VOICE && soundOn && (
            <TouchableOpacity style={styles.voicePill} onPress={() => setAiVoice(!aiVoice)}>
              <Text style={styles.voicePillText}>{aiVoice ? 'AI-stemme' : 'Telefonstemme'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggleSound}>
            <Text style={styles.interviewIcon}>{soundOn ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
          {interview && !done && (
            <TouchableOpacity onPress={confirmEnd}>
              <Text style={styles.interviewEnd}>Afslut</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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

      {!done && (
        <View style={styles.footer}>
          {CAN_TRANSCRIBE && (
            <TouchableOpacity
              style={[styles.micButton, recording && styles.micButtonActive, locked && styles.buttonDisabled]}
              disabled={locked}
              onPress={toggleRecording}
            >
              <Text style={[styles.micButtonText, recording && styles.micButtonTextActive]}>
                {recording
                  ? `⏹ Stop og send · ${formatSeconds(Math.round(recorderState.durationMillis / 1000))}`
                  : '🎙️ Tryk for at tale'}
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
