import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles';

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

export default function CategoriesScreen({ route, navigation, xp, completed }) {
  const { skills, questions } = route.params;

  const progress = CATEGORIES.map((c) => {
    const list = questions[c.key];
    const done = list.filter((q) => completed.includes(q.id)).length;
    return { ...c, list, done, total: list.length, allDone: done === list.length };
  });

  const currentIndex = progress.findIndex((p) => !p.allDone);
  const activeIndex = currentIndex === -1 ? progress.length - 1 : currentIndex;
  const activeCategory = progress[activeIndex];

  return (
    <SafeAreaView style={styles.boardRoot} edges={['top', 'left', 'right']}>
      <View style={styles.hud}>
        <Text style={styles.hudLogo}>🎯 PrepPal</Text>
        <View style={styles.hudStats}>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>🔥</Text>
            <Text style={[styles.hudStatText, styles.hudFlameText]}>{streakFromXp(xp)}</Text>
          </View>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>⭐</Text>
            <Text style={[styles.hudStatText, styles.hudXpText]}>{xp}</Text>
          </View>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>SEKTION 1 · {activeCategory.name.toUpperCase()}</Text>
        <Text style={styles.bannerTitle}>Træn dit jobinterview</Text>
        <Text style={styles.bannerSub}>Nøgleord: {skills.join(', ')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.path}>
        {progress.map((cat, i) => {
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
                      questions: cat.list,
                    })
                  }
                  style={[styles.node, cat.allDone && styles.nodeDone]}
                >
                  <Text style={styles.nodeIcon}>
                    {cat.allDone ? '⭐' : cat.icon}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.nodeLabel}>{cat.name}</Text>
                <Text style={[styles.nodeProgress, cat.allDone && styles.nodeProgressDone]}>
                  {cat.done}/{cat.total}
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
        <TouchableOpacity style={styles.bottomNavItem}>
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
