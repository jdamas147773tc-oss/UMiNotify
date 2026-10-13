// 📁 FILE LOCATION: app/(student)/_layout.js  (from your Notify project root)
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const MAROON = '#7A1F2B';

export default function StudentLayout() {
  const { user } = useAuth();
  const router = useRouter();

  // Not logged in, or not a student -> back to login
  if (!user || user.role !== 'student') {
    return <Redirect href="/login" />;
  }

  const backButton = () => (
  <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
    <Ionicons name="arrow-back" size={24} color={MAROON} />
  </TouchableOpacity>
);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MAROON,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#FBF6EE', borderTopColor: '#E0D8C8' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Announcements',
          tabBarIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      {/* Hidden from the tab bar, opened by tapping an announcement */}

      <Tabs.Screen
      name="profile"
       options={{
        title: 'Profile',
      tabBarIcon: ({ color, size }) => (
      <Ionicons name="person-outline" size={size} color={color} />
    ),
  }}
/>
      <Tabs.Screen
        name="post/[id]"
        options={{ href: null, headerShown: true, title: 'Announcement', headerLeft: backButton }}
      />
    </Tabs>
  );
}