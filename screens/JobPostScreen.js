import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { getQuestions } from '../services/questionService';

export default function JobPostScreen({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { skills, questions } = await getQuestions(text);
      navigation.navigate('Categories', {
        skills,
        questions,
        jobPreview: text.trim().slice(0, 100),
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = text.length < 20 || loading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Indsæt jobopslag</Text>
      <Text style={styles.subtitle}>
        PrepPal analyserer opslaget og laver øvelsesspørgsmål til dig.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Indsæt teksten fra jobopslaget her…"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled}
        onPress={handleAnalyze}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Analyserer…' : 'Analysér opslag'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
