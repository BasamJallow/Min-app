import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import JobPostScreen from './screens/JobPostScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import QuestionScreen from './screens/QuestionScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);

  const addXp = (amount) => setXp((prev) => prev + amount);
  const markComplete = (id) =>
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const addJobPost = (post) => setJobPosts((prev) => [...prev, post]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="JobPost" options={{ title: 'PrepPal' }}>
            {(props) => <JobPostScreen {...props} addJobPost={addJobPost} />}
          </Stack.Screen>
          <Stack.Screen name="Categories" options={{ headerShown: false }}>
            {(props) => <CategoriesScreen {...props} xp={xp} completed={completed} />}
          </Stack.Screen>
          <Stack.Screen name="Question" options={{ title: 'Øvelse' }}>
            {(props) => <QuestionScreen {...props} addXp={addXp} markComplete={markComplete} />}
          </Stack.Screen>
          <Stack.Screen name="Profile" options={{ headerShown: false }}>
            {(props) => (
              <ProfileScreen {...props} xp={xp} completed={completed} jobPosts={jobPosts} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
