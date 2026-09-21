import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles';

function streakFromXp(xp) {
  return Math.floor(xp / 40);
}

function formatDate(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} · ${hh}:${mi}`;
}

export default function ProfileScreen({ navigation, xp, completed, jobPosts }) {
  const streak = streakFromXp(xp);
  const done = completed.length;
  const applied = jobPosts.length;

  const history = jobPosts.slice().reverse();

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
          <Text style={styles.statValue}>{done}</Text>
          <Text style={styles.statLabel}>Øvelser</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{applied}</Text>
          <Text style={styles.statLabel}>Opslag</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Analyserede jobopslag</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>
        Du har ikke analyseret et opslag endnu. Gå tilbage og indsæt dit første jobopslag.
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyDate}>{formatDate(item.id)}</Text>
      <Text style={styles.historyPreview} numberOfLines={2}>
        {item.preview}
      </Text>
      <Text style={styles.historySkills}>Nøgleord: {item.skills.join(', ')}</Text>
    </View>
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
        data={history}
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
          <Text style={styles.bottomNavIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={styles.bottomNavIcon}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Text style={[styles.bottomNavIcon, styles.bottomNavIconActive]}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
