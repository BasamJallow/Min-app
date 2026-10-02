import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, ActivityIndicator, Keyboard, Platform,
} from 'react-native';
import { styles, palette } from '../styles';
import { getQuestions } from '../services/questionService';
import { EXAMPLE_JOB_POST, KEYBOARD_OFFSET } from '../constants';

export default function JobPostScreen({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const { jobId, skills, questions } = await getQuestions(text);
      navigation.navigate('Categories', {
        jobId,
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
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_OFFSET}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Indsæt jobopslag</Text>
        <Text style={styles.subtitle}>
          PrepPal analyserer opslaget og laver øvelsesspørgsmål til dig.
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Indsæt teksten fra jobopslaget her…"
          placeholderTextColor={palette.MUTED}
          value={text}
          onChangeText={setText}
          editable={!loading}
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={palette.LIME} />
            <Text style={styles.loadingTitle}>Analyserer opslaget…</Text>
            <Text style={styles.loadingText}>Det kan tage op til 30 sekunder.</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, disabled && styles.buttonDisabled]}
              disabled={disabled}
              onPress={handleAnalyze}
            >
              <Text style={styles.buttonText}>Analysér opslag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setText(EXAMPLE_JOB_POST)}
            >
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Prøv med eksempel</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
