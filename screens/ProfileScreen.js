import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import { getSessions, getProgress } from '../services/storageService';
import { formatDate, streakFromXp } from '../utils';

export default function ProfileScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState({ perCategory: {}, xp: 0, sessions: 0 });

  useFocusEffect(useCallback(() => {
    let alive = true;
    Promise.all([getSessions(), getProgress()]).then(([s, p]) => {
      if (!alive) return;
      setSessions(s);
      setProgress(p);
    });
    return () => { alive = false; };
  }, []));

  const xp = progress.xp;
  const streak = streakFromXp(xp);
  const recent = sessions.slice(0, 5);

  const renderHeader = () => (
    <>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>👤</Text>
        </View>
        <Text style={styles.profileName}>Din profil</Text>
        <Text style={styles.profileSub}>Din progression og historik</Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progress.sessions}</Text>
          <Text style={styles.statLabel}>Sessioner</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Object.keys(progress.perCategory).length}</Text>
          <Text style={styles.statLabel}>Kategorier</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Seneste sessioner</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>
        Ingen sessioner endnu. Indsæt et jobopslag og gennemfør en kategori for at komme i gang.
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
      <Text style={styles.historyCategory}>{item.category}</Text>
      <Text style={styles.historyPreview} numberOfLines={2}>
        {item.jobPreview || 'Uden jobopslag'}
      </Text>
      <View style={styles.historyScorePill}>
        <Text style={styles.historyScoreText}>
          {item.score}/{item.total} rigtige · +{item.xp} XP
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    sessions.length > recent.length ? (
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.buttonText}>Se al historik</Text>
      </TouchableOpacity>
    ) : null
  );

  return (
    <SafeAreaView style={styles.boardRoot} edges={['top', 'left', 'right']}>
      <View style={styles.hud}>
        <Text style={styles.hudLogo}>🎯 PrepPal</Text>
        <View style={styles.hudStats}>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>🔥</Text>
            <Text style={[styles.hudStatText, styles.hudFlameText]}>{streak}</Text>
          </View>
          <View style={styles.hudStat}>
            <Text style={styles.hudStatIcon}>⭐</Text>
            <Text style={[styles.hudStatText, styles.hudXpText]}>{xp}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.profileScroll}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('JobPost')}>
          <Text style={styles.bottomNavIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('History')}>
          <Text style={styles.bottomNavIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.bottomNavIcon}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={[styles.bottomNavIcon, styles.bottomNavIconActive]}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
