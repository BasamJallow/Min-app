import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import { getSessions, getJob } from '../services/storageService';
import { formatDate, percent, goTo, goToBoard } from '../utils';

export default function HistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);

  const load = useCallback(async () => {
    const list = await getSessions();
    setSessions(list);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderHeader = () => (
    <>
      <Text style={styles.categoryTag}>Historik</Text>
      <Text style={styles.historyTitle}>Dine sessioner</Text>
      <Text style={styles.subtitle}>Alle gennemførte kategorier med score og dato.</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>
        Ingen sessioner endnu. Gennemfør en kategori for at se den dukke op her.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => goTo(navigation, 'JobPost')}>
        <Text style={styles.buttonText}>Indsæt et jobopslag</Text>
      </TouchableOpacity>
    </View>
  );

  // Åbner banen for det opslag, sessionen hører til.
  const openJob = async (session) => {
    const job = session.jobId ? await getJob(session.jobId) : null;
    if (!job) {
      Alert.alert('Opslaget findes ikke længere', 'Det er slettet eller fra før "Mine opslag" fandtes.');
      return;
    }
    navigation.navigate('Categories', {
      jobId: job.jobId, skills: job.skills, questions: job.questions, jobPreview: job.preview,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.historyCard} activeOpacity={0.7} onPress={() => openJob(item)}>
      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
      <Text style={styles.historyCategory}>{item.category}</Text>
      <Text style={styles.historyPreview} numberOfLines={2}>
        {item.jobPreview || 'Uden jobopslag'}
      </Text>
      <View style={styles.historyScorePill}>
        <Text style={styles.historyScoreText}>
          {percent(item.score, item.total)}% · {item.score}/{item.total} rigtige · +{item.xp} XP
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.boardRoot} edges={['top', 'left', 'right']}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.profileScroll}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => goTo(navigation, 'JobPost')}>
          <Text style={styles.bottomNavIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={[styles.bottomNavIcon, styles.bottomNavIconActive]}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => goToBoard(navigation)}>
          <Text style={styles.bottomNavIcon}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => goTo(navigation, 'Profile')}>
          <Text style={styles.bottomNavIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
