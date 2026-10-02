import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import { getSessions } from '../services/storageService';
import { formatDate, percent } from '../utils';

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
          {percent(item.score, item.total)}% · {item.score}/{item.total} rigtige · +{item.xp} XP
        </Text>
      </View>
    </View>
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
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('JobPost')}>
          <Text style={styles.bottomNavIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={[styles.bottomNavIcon, styles.bottomNavIconActive]}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.bottomNavIcon}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.bottomNavIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
