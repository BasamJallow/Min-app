import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { evaluateAnswer } from '../services/questionService';
import { saveSession } from '../services/storageService';

export default function QuestionScreen({ route, navigation }) {
  const { category, categoryKey, questions, jobPreview } = route.params;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [busy, setBusy] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const commitEvaluation = (result) => {
    setFeedback(result);
    setBreakdown((prev) => [
      ...prev,
      {
        correct: !!result.correct,
        xp: result.xp,
        label: `${question.prompt.slice(0, 60)}${question.prompt.length > 60 ? '…' : ''}`,
      },
    ]);
  };

  const handleFree = async () => {
    if (answer.length < 5 || busy) return;
    setBusy(true);
    try {
      const result = await evaluateAnswer(question, answer);
      commitEvaluation(result);
    } finally {
      setBusy(false);
    }
  };

  const handleChoice = async (i) => {
    if (feedback || busy) return;
    setBusy(true);
    try {
      const result = await evaluateAnswer(question, i);
      commitEvaluation(result);
    } finally {
      setBusy(false);
    }
  };

  const handleNext = async () => {
    if (!isLast) {
      setIndex(index + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }

    // Sidste spørgsmål — gem session og gå til Result.
    const score = breakdown.filter((b) => b.correct).length;
    const xpEarned = breakdown.reduce((sum, b) => sum + (b.xp || 0), 0);

    const session = {
      id: Date.now(),
      date: Date.now(),
      category,
      categoryKey,
      jobPreview,
      score,
      total: questions.length,
      xp: xpEarned,
    };
    await saveSession(session);

    navigation.replace('Result', {
      category,
      categoryKey,
      score,
      total: questions.length,
      xp: xpEarned,
      breakdown,
      questions,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {isLast ? 'Se resultat' : 'Næste spørgsmål'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
