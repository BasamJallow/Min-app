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
  const [notJobPost, setNotJobPost] = useState(false);

  const handleChange = (value) => {
    setText(value);
    setNotJobPost(false);
  };

  const handleAnalyze = async (force = false) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const { isJobPost, jobId, skills, questions } = await getQuestions(text, { force });
      if (!isJobPost) {
        setNotJobPost(true);
        return;
      }
      setNotJobPost(false);
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
          style={[styles.input, styles.inputJobPost]}
          multiline
          scrollEnabled
          placeholder="Indsæt teksten fra jobopslaget her…"
          placeholderTextColor={palette.MUTED}
          value={text}
          onChangeText={handleChange}
          editable={!loading}
        />

        {notJobPost && !loading && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Det ligner ikke et jobopslag</Text>
            <Text style={styles.warningText}>
              Indsæt hele opslaget med opgaver og krav, så spørgsmålene passer til stillingen.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => handleAnalyze(true)}
            >
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Fortsæt alligevel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Fast bund, så knapperne altid kan ses — uanset hvor langt opslaget er */}
      <View style={styles.footer}>
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
              onPress={() => handleAnalyze()}
            >
              <Text style={styles.buttonText}>Analysér opslag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => handleChange(EXAMPLE_JOB_POST)}
            >
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Prøv med eksempel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
