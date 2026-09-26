import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles';

function badgeFor(pct) {
  if (pct >= 80) return { emoji: '🏆', title: 'Fremragende!', sub: 'Du er klar til samtalen.' };
  if (pct >= 50) return { emoji: '💪', title: 'Godt gået', sub: 'Der er stadig plads til at skærpe et par svar.' };
  return { emoji: '📚', title: 'Godt forsøg', sub: 'Kør kategorien igen — gentagelse gør stor forskel.' };
}

export default function ResultScreen({ route, navigation }) {
  const { category, categoryKey, score, total, xp, breakdown, questions } = route.params;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const badge = badgeFor(pct);

  const retry = () => {
    navigation.replace('Question', { category, categoryKey, questions });
  };

  const backToBoard = () => {
    // Navigate falder tilbage til den eksisterende Categories-instans,
    // så vi bevarer skills/questions/jobPreview fra route-params.
    navigation.navigate('Categories');
  };

  return (
    <SafeAreaView style={styles.boardRoot} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.resultHero}>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeEmoji}>{badge.emoji}</Text>
          </View>
          <Text style={styles.resultTitle}>{badge.title}</Text>
          <Text style={styles.resultSub}>{badge.sub}</Text>
        </View>

        <View style={styles.resultStatRow}>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>{score}/{total}</Text>
            <Text style={styles.resultStatLabel}>Rigtige</Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>{pct}%</Text>
            <Text style={styles.resultStatLabel}>Score</Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>+{xp}</Text>
            <Text style={styles.resultStatLabel}>XP</Text>
          </View>
        </View>

        <Text style={styles.categoryTag}>{category} · opsamling</Text>

        {breakdown.map((item, i) => (
          <View key={i} style={styles.resultBreakdownItem}>
            <Text style={styles.resultBreakdownIcon}>{item.correct ? '✅' : '⚠️'}</Text>
            <Text style={styles.resultBreakdownText}>{item.label}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Prøv kategorien igen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={backToBoard}>
          <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Tilbage til banen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
