// 📁 FILE LOCATION: app/(student)/index.js  (from your Notify project root)
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, CATEGORY_COLORS } from '../../data/announcements';
import { usePosts } from '../../context/PostsContext';
import { useCourses } from '../../context/CoursesContext';
import PriorityBadge from '../../components/PriorityBadge';
import UniversityLogo from '../../components/UniversityLogo';

export default function Home() {
  const router = useRouter();
  const { user, } = useAuth();
  const { posts, isRead } = usePosts();
  const { getJoinedCourses } = useCourses();
  const [activeTab, setActiveTab] = useState('all');


  // Subject posts only show for courses the student has joined
  const joinedCodes = getJoinedCourses(user?.username).map((c) => c.code);
  const visiblePosts = posts.filter((p) => {
    if (p.category === 'department' && p.department !== user?.department) return false;
    if (p.category === 'subject' && !joinedCodes.includes(p.subjectCode)) return false;
    return activeTab === 'all' || p.category === activeTab;
  });

  return (
   <SafeAreaView style={styles.safeArea}>
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerBrand}
      onPress={() => router.push('/(student)/profile')}
    >
      <UniversityLogo size={36} />
      <View>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.welcome}>{user?.fullName || user?.username}</Text>
        {user?.studentId ? (
          <Text style={styles.accountId}>Student ID: {user.studentId}</Text>
        ) : null}
        {user?.department && user?.program ? (
          <Text style={styles.accountId}>{user.department} · {user.program}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {CATEGORIES.map((c) => {
          const active = c.key === activeTab;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(c.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {activeTab === 'subject'
              ? 'No subject announcements yet. Join a course in the Courses tab to see its announcements.'
              : activeTab === 'all'
              ? 'No announcements yet. Check back later.'
              : 'No announcements here yet. Check back later.'}
          </Text>
        }
        renderItem={({ item }) => {
          const colors = CATEGORY_COLORS[item.category];
          const read = isRead(user?.username, item.id);
          return (
            <TouchableOpacity
              style={[styles.card, read && styles.cardRead]}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>
                      {item.subjectCode ||
                      (item.category === 'department' && item.department
                      ? item.department
                      : CATEGORIES.find((c) => c.key === item.category).label)}
                  </Text>
                  </View>
                  <PriorityBadge priority={item.priority} />
                </View>
                <View style={styles.rightRow}>
                  {!read && <View style={styles.unreadDot} />}
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, !read && styles.cardTitleUnread]}>{item.title}</Text>
            
              <Text style={styles.cardAuthor}>{item.author}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const MAROON = '#7A1F2B';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 12, color: '#888' },
  welcome: { fontSize: 18, fontWeight: '700', color: '#222' },
  accountId: { fontSize: 11, color: '#888', marginTop: 2 },


tabsScroll: { flexGrow: 0, flexShrink: 0, minHeight: 52 },
tabs: {
  flexDirection: 'row', alignItems: 'center',
  paddingHorizontal: 20, paddingVertical: 4, gap: 8,
},
tab: {
  height: 38, paddingHorizontal: 14, borderRadius: 19,
  alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#EFEAE0', borderWidth: 1, borderColor: '#E0D8C8',
},
  tabActive: { backgroundColor: MAROON, borderColor: MAROON },
 tabText: { fontSize: 13, color: '#555', fontWeight: '600', includeFontPadding: false },
  tabTextActive: { color: '#fff' }, 

  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#E0D8C8', marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  urgentBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#C0392B' },
  urgentText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  date: { fontSize: 11, color: '#999' },
  cardTitle: { fontSize: 15, color: '#222', fontWeight: '600', marginBottom: 4 },
  cardAuthor: { fontSize: 12, color: '#888' },
  cardRead: { opacity: 0.7 },
  cardTitleUnread: { fontWeight: '800' },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MAROON },
});