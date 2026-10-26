import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../styles';
import { getJobs, deleteJob } from '../services/storageService';
import { formatDate, readiness, goTo } from '../utils';

export default function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);

  const load = useCallback(async () => {
    setJobs(await getJobs());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Spørgsmålene er gemt, så banen åbnes uden nyt AI-kald.
  const openJob = (job) => {
    navigation.navigate('Categories', {
      jobId: job.jobId,
      skills: job.skills,
      questions: job.questions,
      jobPreview: job.preview,
    });
  };

  const confirmDelete = (job) => {
    Alert.alert('Slet opslag?', `"${job.title}" fjernes fra listen. Din historik bevares.`, [
      { text: 'Annullér', style: 'cancel' },
      {
        text: 'Slet',
        style: 'destructive',
        onPress: async () => {
          await deleteJob(job.jobId);
          load();
        },
      },
    ]);
  };

  const renderHeader = () => (
    <Text style={styles.subtitle}>
      Tryk for at fortsætte træningen. Hold fingeren på et opslag for at slette det.
    </Text>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>
        Ingen gemte opslag endnu. Analysér et jobopslag, så dukker det op her.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => goTo(navigation, 'JobPost')}>
        <Text style={styles.buttonText}>Indsæt et jobopslag</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyCard}
      activeOpacity={0.7}
      onPress={() => openJob(item)}
      onLongPress={() => confirmDelete(item)}
    >
      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
      <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.historySkills} numberOfLines={1}>
        {item.skills.length > 0 ? item.skills.join(' · ') : 'Ingen specifikke kompetencer'}
      </Text>
      <View style={styles.historyScorePill}>
        <Text style={styles.historyScoreText}>
          Parathed {readiness(item.progress.perCategory)}% · {item.progress.sessions} sessioner
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.boardRoot}
      data={jobs}
      keyExtractor={(item) => item.jobId}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.profileScroll}
    />
  );
}
