import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Keyboard, Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { styles, palette } from '../styles';
import { evaluateAnswer, getStrongAnswer } from '../services/questionService';
import { saveSession } from '../services/storageService';
import { breakdownItem, buildSession } from '../utils';
import { KEYBOARD_OFFSET } from '../constants';

export default function QuestionScreen({ navigation }) {
  const { jobId, skills, category, categoryKey, questions, jobPreview } = useRoute().params;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [busy, setBusy] = useState(false);
  const [strongAnswer, setStrongAnswer] = useState(null);
  const [strongLoading, setStrongLoading] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const commitEvaluation = (result) => {
    setFeedback(result);
    setBreakdown((prev) => [...prev, breakdownItem(question, result)]);
  };

  const handleFree = async () => {
    if (answer.length < 5 || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    try {
      const result = await evaluateAnswer(question, answer, skills);
      commitEvaluation(result);
    } finally {
      setBusy(false);
    }
  };

  const handleChoice = async (i) => {
    if (feedback || busy) return;
    setBusy(true);
    try {
      const result = await evaluateAnswer(question, i, skills);
      commitEvaluation(result);
    } finally {
      setBusy(false);
    }
  };

  // Nyt forsøg på samme fritekstspørgsmål — kun det seneste forsøg tæller.
  const handleRetry = () => {
    setFeedback(null);
    setStrongAnswer(null);
    setBreakdown((prev) => prev.slice(0, -1));
  };

  const handleStrongAnswer = async () => {
    setStrongLoading(true);
    try {
      setStrongAnswer(await getStrongAnswer(question, answer, skills));
    } finally {
      setStrongLoading(false);
    }
  };

  const handleNext = async () => {
    if (!isLast) {
      setIndex(index + 1);
      setAnswer('');
      setFeedback(null);
      setStrongAnswer(null);
      return;
    }

    // Sidste spørgsmål — gem session og gå til Result.
    const session = buildSession({
      jobId, category, categoryKey, jobPreview, breakdown, total: questions.length,
    });
    await saveSession(session);

    navigation.replace('Result', {
      jobId,
      skills,
      category,
      categoryKey,
      jobPreview,
      score: session.score,
      total: session.total,
      xp: session.xp,
      breakdown,
      questions,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_OFFSET}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.categoryTag}>
          {category} · {index + 1} af {questions.length}
        </Text>
        <Text style={styles.question}>{question.prompt}</Text>

        {question.type === 'free' ? (
          <>
            <Text style={styles.subtitle}>{question.hint}</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Skriv dit svar…"
              placeholderTextColor={palette.MUTED}
              value={answer}
              onChangeText={setAnswer}
              editable={!feedback}
            />
            {!feedback && (
              <TouchableOpacity
                style={[styles.button, (answer.length < 5 || busy) && styles.buttonDisabled]}
                disabled={answer.length < 5 || busy}
                onPress={handleFree}
              >
                <Text style={styles.buttonText}>{busy ? 'Vurderer…' : 'Få feedback'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.option, feedback && i === question.correct && styles.optionCorrect]}
              onPress={() => handleChoice(i)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))
        )}

        {feedback && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackLabel}>{feedback.label} · +{feedback.xp} XP</Text>
            <Text style={styles.feedbackText}>{feedback.text}</Text>

            {strongAnswer && (
              <View style={styles.strongBox}>
                <Text style={styles.strongTitle}>Et stærkt svar</Text>
                <Text style={styles.strongText}>{strongAnswer.text}</Text>
                {strongAnswer.changes.map((c) => (
                  <Text key={c} style={styles.strongChange}>✓ {c}</Text>
                ))}
                <Text style={styles.strongNote}>
                  {strongAnswer.isTemplate
                    ? 'Skabelon — udfyld felterne i [ ] med dine egne erfaringer.'
                    : 'Omskrevet ud fra dit svar. Udfyld eventuelle [ ] med dine egne erfaringer.'}
                </Text>
              </View>
            )}

            {question.type === 'free' && !strongAnswer && (
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, strongLoading && styles.buttonDisabled]}
                disabled={strongLoading}
                onPress={handleStrongAnswer}
              >
                <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
                  {strongLoading ? 'Skriver et stærkt svar…' : 'Se et stærkt svar'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {isLast ? 'Se resultat' : 'Næste spørgsmål'}
              </Text>
            </TouchableOpacity>

            {question.type === 'free' && (
              <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleRetry}>
                <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Prøv igen</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
