import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  ActivityIndicator, Alert, Keyboard, Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { styles, palette } from '../styles';
import {
  createInterview, interviewerTurn, addAnswer, endInterview, interviewProgress,
  summarizeInterview, interviewSession,
} from '../services/interviewService';
import { getJob, saveSession } from '../services/storageService';
import { goToBoard } from '../utils';
import { KEYBOARD_OFFSET } from '../constants';

export default function InterviewScreen({ navigation }) {
  const { jobId, skills, questions, jobPreview } = useRoute().params;
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(true);
  const [summary, setSummary] = useState(null);
  const listRef = useRef(null);

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

  useEffect(() => { start(); }, []);

  const finish = async (state) => {
    setInterview(state);
    setBusy(true);
    const result = await summarizeInterview(state);
    if (result.breakdown.length > 0) await saveSession(interviewSession(result, { jobId, jobPreview }));
    setSummary(result);
    setBusy(false);
  };

  const send = async () => {
    if (answer.trim().length < 3 || busy) return;
    Keyboard.dismiss();
    const withAnswer = addAnswer(interview, answer);
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

  const confirmEnd = () => {
    Alert.alert('Afslut samtalen?', 'Du får en vurdering af de svar, du har givet indtil nu.', [
      { text: 'Fortsæt samtalen', style: 'cancel' },
      { text: 'Afslut', style: 'destructive', onPress: () => finish(endInterview(interview)) },
    ]);
  };

  const progress = interview ? interviewProgress(interview) : null;
  const done = interview?.done;

  const renderMessage = ({ item }) => {
    const mine = item.role === 'candidate';
    return (
      <View style={[styles.bubble, mine ? styles.bubbleCandidate : styles.bubbleInterviewer]}>
        {!mine && <Text style={styles.bubbleLabel}>Interviewer</Text>}
        <Text style={[styles.bubbleText, mine && styles.bubbleTextCandidate]}>{item.text}</Text>
      </View>
    );
  };

  const renderFooter = () => {
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
        {interview && !done && (
          <TouchableOpacity onPress={confirmEnd}>
            <Text style={styles.interviewEnd}>Afslut</Text>
          </TouchableOpacity>
        )}
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
          <TextInput
            style={[styles.input, styles.chatInput]}
            multiline
            scrollEnabled
            placeholder="Skriv dit svar, som du ville sige det…"
            placeholderTextColor={palette.MUTED}
            value={answer}
            onChangeText={setAnswer}
            editable={!busy}
          />
          <TouchableOpacity
            style={[styles.button, (busy || answer.trim().length < 3) && styles.buttonDisabled]}
            disabled={busy || answer.trim().length < 3}
            onPress={send}
          >
            <Text style={styles.buttonText}>Send svar</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
