import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import JobPostScreen from './screens/JobPostScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import QuestionScreen from './screens/QuestionScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import JobsScreen from './screens/JobsScreen';
import InterviewScreen from './screens/InterviewScreen';
import PrepScreen from './screens/PrepScreen';
import ProScreen from './screens/ProScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="JobPost" component={JobPostScreen} options={{ title: 'PrepPal' }} />
          <Stack.Screen name="Categories" component={CategoriesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Question" component={QuestionScreen} options={{ title: 'Øvelse' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Resultat' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Jobs" component={JobsScreen} options={{ title: 'Mine opslag' }} />
          <Stack.Screen name="Interview" component={InterviewScreen} options={{ title: 'Jobsamtale' }} />
          <Stack.Screen name="Prep" component={PrepScreen} options={{ title: 'Forberedelse' }} />
          <Stack.Screen name="Pro" component={ProScreen} options={{ title: 'PrepPal Pro' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
