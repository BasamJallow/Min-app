import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { styles, palette } from '../styles';
import { getPrepSheet, prepSheetText } from '../services/prepService';

function Section({ icon, title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.prepSection}>
      <Text style={styles.prepHeading}>{icon} {title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.prepItem}>• {item}</Text>
      ))}
    </View>
  );
}

export default function PrepScreen({ navigation }) {
  const { jobId } = useRoute().params;
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (refresh = false) => {
    setLoading(true);
    setSheet(await getPrepSheet(jobId, { refresh }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <View style={[styles.boardRoot, styles.talkRoot]}>
        <ActivityIndicator size="large" color={palette.LIME} />
        <Text style={styles.loadingTitle}>Laver dit forberedelsesark…</Text>
      </View>
    );
  }

  if (!sheet) {
    return (
      <View style={[styles.boardRoot, styles.container]}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Opslaget findes ikke længere. Analysér det igen for at få et forberedelsesark.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Tilbage</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.boardRoot} contentContainerStyle={styles.profileScroll}>
      <Text style={styles.categoryTag}>Forberedelsesark</Text>
      <Text style={styles.historyTitle}>{sheet.title || 'Din jobsamtale'}</Text>
      <Text style={styles.subtitle}>
        {sheet.isTemplate
          ? 'Skabelon ud fra opslagets kompetencer. Med OpenAI bliver arket målrettet virksomheden.'
          : 'Lavet ud fra jobopslaget — gennemgå det dagen før samtalen.'}
      </Text>

      {sheet.highlights.length > 0 && (
        <View style={styles.prepSection}>
          <Text style={styles.prepHeading}>🎯 Det vigtigste at fremhæve</Text>
          {sheet.highlights.map((h) => (
            <View key={h.skill} style={styles.prepHighlight}>
              <Text style={styles.prepHighlightSkill}>{h.skill}</Text>
              <Text style={styles.prepItem}>{h.why}</Text>
            </View>
          ))}
        </View>
      )}

      <Section icon="❓" title="Spørgsmål du kan stille dem" items={sheet.askThem} />
      <Section icon="🔍" title="Undersøg om virksomheden" items={sheet.research} />
      <Section icon="💬" title="Spørgsmål du kan forvente" items={sheet.expected} />
      <Section icon="⚠️" title="Dine svage punkter at forberede" items={sheet.weakSkills} />
      <Section icon="✅" title="Tjekliste" items={sheet.checklist} />

      <TouchableOpacity style={styles.button} onPress={() => Share.share({ message: prepSheetText(sheet) })}>
        <Text style={styles.buttonText}>Del arket</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => load(true)}>
        <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Lav et nyt ark</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
