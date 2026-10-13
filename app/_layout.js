// 📁 FILE LOCATION: app/_layout.js  (from your Notify project root)
import { Stack } from 'expo-router';
import '../firebaseConfig';
import { AuthProvider } from '../context/AuthContext';
import { PostsProvider } from '../context/PostsContext';
import { CoursesProvider } from '../context/CoursesContext';
import NewAnnouncementPopup from '../components/components/NewAnnouncementPopup';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CoursesProvider>
        <PostsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(admin)" />
          </Stack>
          <NewAnnouncementPopup />
        </PostsProvider>
      </CoursesProvider>
    </AuthProvider>
  );
}