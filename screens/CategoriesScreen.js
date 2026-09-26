import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import { getProgress } from '../services/storageService';

const CATEGORIES = [
  { key: 'brain', name: 'Brain Teasers', desc: 'Vis din tankeproces', icon: '🧠' },
  { key: 'behavior', name: 'Adfærd', desc: 'Træn STAR-metoden', icon: '💬' },
  { key: 'professional', name: 'Faglig', desc: 'Kompetencer fra opslaget', icon: '💼' },
  { key: 'motivation', name: 'Motivation', desc: 'Hvorfor lige dem?', icon: '💡' },
];

const OFFSETS = [0, -70, 70, -40];

function streakFromXp(xp) {
  return Math.floor(xp / 40);
}

export default function CategoriesScreen({ route, navigation }) {
  const { skills, questions, jobPreview } = route.params;
  const [progress, setProgress] = useState({ perCategory: {}, xp: 0, sessions: 0 });

  useFocusEffect(useCallback(() => {
    let alive = true;
    getProgress().then((p) => { if (alive) setProgress(p); });
    return () => { alive = false; };
  }, []));

  const view = CATEGORIES.map((c) => {
    const stat = progress.perCategory[c.key];
    const pct = stat ? stat.pct : 0;
    const done = stat && stat.sessions > 0;
    return { ...c, list: questions[c.key], pct, done };
  });

  const nextIndex = view.findIndex((c) => !c.done);
  const activeIndex = nextIndex === -1 ? 0 : nextIndex;
  const activeCategory = view[activeIndex];

  return (
    <SafeAreaView style={styles.boardRoot} edges={['top', 'left', 'right']}>
      <View style={styles.hud}>
        <Text style={styles.hudLogo}>🎯 PrepPal</Text>
        <View style={styles.hudStats}>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>🔥</Text>
            <Text style={[styles.hudStatText, styles.hudFlameText]}>{streakFromXp(progress.xp)}</Text>
          </View>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>⭐</Text>
            <Text style={[styles.hudStatText, styles.hudXpText]}>{progress.xp}</Text>
          </View>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>SEKTION 1 · {activeCategory.name.toUpperCase()}</Text>
        <Text style={styles.bannerTitle}>Træn dit jobinterview</Text>
        <Text style={styles.bannerSub}>Nøgleord: {skills.join(', ')}</Text>
      </View>

      {/* Kompetenceoversigt — procent pr. kategori på tværs af tidligere sessioner */}
      <View style={styles.competenceRow}>
        {view.map((c) => (
          <View key={c.key} style={styles.competenceCard}>
            <Text style={styles.competenceIcon}>{c.icon}</Text>
            <Text style={[styles.competencePct, c.pct === 0 && styles.competencePctEmpty]}>
              {c.pct}%
            </Text>
            <Text style={styles.competenceLabel}>{c.name.split(' ')[0]}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.path}>
        {view.map((cat, i) => {
          const isActive = i === activeIndex;
          const offset = OFFSETS[i % OFFSETS.length];

          return (
            <View key={cat.key} style={[styles.pathRow, { transform: [{ translateX: offset }] }]}>
              <View style={styles.nodeWrap}>
                {isActive && (
                  <View style={styles.startPill}>
                    <Text style={styles.startPillText}>START</Text>
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('Question', {
                      category: cat.name,
                      categoryKey: cat.key,
                      questions: cat.list,
                      jobPreview,
                    })
                  }
                  style={[styles.node, cat.done && styles.nodeDone]}
                >
                  <Text style={styles.nodeIcon}>
                    {cat.done ? '⭐' : cat.icon}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.nodeLabel}>{cat.name}</Text>
                <Text style={[styles.nodeProgress, cat.done && styles.nodeProgressDone]}>
                  {cat.pct}%
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('JobPost')}>
          <Text style={[styles.bottomNavIcon, styles.bottomNavIconActive]}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('History')}>
          <Text style={styles.bottomNavIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={styles.bottomNavIcon}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.bottomNavIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
