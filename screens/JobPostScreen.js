import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { analyzeJobPost, generateQuestions } from '../questions';

export default function JobPostScreen({ navigation, addJobPost }) {
  const [text, setText] = useState('');

  const handleAnalyze = () => {
    const skills = analyzeJobPost(text);
    const questions = generateQuestions(skills);
    addJobPost({
      id: Date.now(),
      preview: text.trim().slice(0, 100),
      skills,
    });
    navigation.navigate('Categories', { skills, questions });
  };

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
        style={[styles.button, text.length < 20 && styles.buttonDisabled]}
        disabled={text.length < 20}
        onPress={handleAnalyze}
      >
        <Text style={styles.buttonText}>Analysér opslag</Text>
      </TouchableOpacity>
    </View>
  );
}