  // 📁 FILE LOCATION: app/(admin)/_layout.js  (from your Notify project root)
  import React from 'react';
  import { Text, TouchableOpacity } from 'react-native';
  import { Redirect, Tabs, useRouter } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  import { useAuth } from '../../context/AuthContext';

  const MAROON = '#7A1F2B';

  export default function AdminLayout() {
    const { user } = useAuth();
    const router = useRouter();

    // Not logged in, or not faculty/admin -> back to login
    if (!user || user.role !== 'admin') {
      return <Redirect href="/login" />;
    }

     const isCampusAdmin = user.position === 'super_admin';

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
            title: 'Post',
            tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Courses',
            tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
          }}
        />
        {/* Hidden from the tab bar, opened from buttons */}
        <Tabs.Screen
          name="create"
          options={{ href: null, headerShown: true, title: 'New Announcement', headerLeft: backButton }}
        />
          <Tabs.Screen
            name="Announcement"
            options={{
              href: isCampusAdmin ? null : undefined,
              title: 'Announcement',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="megaphone-outline" size={size} color={color} />
              ),
            }}
          />
        <Tabs.Screen
          name="CourseForm"
          options={{ href: null, headerShown: true, title: 'Course', headerLeft: backButton }}
        />
        <Tabs.Screen
          name="profile"
          options={{
          title: 'Profile',
          headerShown: false,
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