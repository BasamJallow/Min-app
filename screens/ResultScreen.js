import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { styles } from '../styles';
import { badgeFor, percent, skillSummary, goToBoard } from '../utils';

export default function ResultScreen({ navigation }) {
  const {
    jobId, skills, category, categoryKey, jobPreview, score, total, xp, breakdown, questions,
  } = useRoute().params;
  const pct = percent(score, total);
  const badge = badgeFor(pct);
  const summary = skillSummary(breakdown);
  const hasSkills = summary.strong.length + summary.weak.length > 0;

  const retry = () => {
    navigation.replace('Question', {
      jobId, skills, category, categoryKey, questions, jobPreview,
    });
  };

  const backToBoard = () => {
    goToBoard(navigation);
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

        <Text style={styles.categoryTag}>Kompetencer fra opslaget</Text>
        {hasSkills ? (
          <>
            {summary.strong.map((s) => (
              <View key={`s-${s}`} style={styles.resultBreakdownItem}>
                <Text style={styles.resultBreakdownIcon}>✅</Text>
                <Text style={styles.resultBreakdownText}>Stærk: {s}</Text>
              </View>
            ))}
            {summary.weak.map((s) => (
              <View key={`w-${s}`} style={styles.resultBreakdownItem}>
                <Text style={styles.resultBreakdownIcon}>⚠️</Text>
                <Text style={styles.resultBreakdownText}>Skal styrkes: {s}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={[styles.emptyCard, styles.resultEmpty]}>
            <Text style={styles.emptyText}>Ingen kompetencer blev vurderet i denne kategori.</Text>
          </View>
        )}

        <Text style={[styles.categoryTag, styles.resultSectionGap]}>{category} · opsamling</Text>

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
