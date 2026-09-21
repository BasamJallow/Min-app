import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { evaluateFreeText } from '../questions';

export default function QuestionScreen({ route, navigation, addXp, markComplete }) {
  const { category, questions } = route.params;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const finish = (result) => {
    setFeedback(result);
    addXp(result.xp);
    markComplete(question.id);
  };

  const handleChoice = (i) => {
    if (feedback) return;
    const correct = i === question.correct;
    finish({
      label: correct ? 'Stærkt svar' : 'Kan styrkes',
      text: question.explanation,
      xp: correct ? 20 : 5,
    });
  };

  const handleNext = () => {
    if (isLast) {
      navigation.goBack();
    } else {
      setIndex(index + 1);
      setAnswer('');
      setFeedback(null);
    }
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
              style={[styles.button, answer.length < 5 && styles.buttonDisabled]}
              disabled={answer.length < 5}
              onPress={() => finish(evaluateFreeText(answer))}
            >
              <Text style={styles.buttonText}>Få feedback</Text>
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
              {isLast ? 'Tilbage til banen' : 'Næste spørgsmål'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}