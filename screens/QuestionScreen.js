import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { styles } from '../styles';
import { evaluateAnswer } from '../services/questionService';
import { saveSession } from '../services/storageService';
import { breakdownItem, buildSession } from '../utils';

export default function QuestionScreen({ navigation }) {
  const { jobId, skills, category, categoryKey, questions, jobPreview } = useRoute().params;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [busy, setBusy] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const commitEvaluation = (result) => {
    setFeedback(result);
    setBreakdown((prev) => [...prev, breakdownItem(question, result)]);
  };

  const handleFree = async () => {
    if (answer.length < 5 || busy) return;
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
    setBreakdown((prev) => prev.slice(0, -1));
  };

  const handleNext = async () => {
    if (!isLast) {
      setIndex(index + 1);
      setAnswer('');
      setFeedback(null);
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

          {question.type === 'free' && (
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleRetry}>
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Prøv igen</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
