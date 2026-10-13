// 📁 FILE LOCATION: app/(admin)/Announcement.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import { CATEGORIES, CATEGORY_COLORS } from '../../data/announcements';
import PriorityBadge from '../../components/PriorityBadge';
import { Ionicons } from '@expo/vector-icons';

const MAROON = '#7A1F2B';

const CAMPUS = 'campus';
const DEPARTMENT = 'department';

const VISIBLE_FROM_ABOVE = {
  dept_rep: [CAMPUS],              // department head sees campus-wide admin posts
  teacher: [CAMPUS, DEPARTMENT],   // teacher sees campus-wide + department head posts
};

const TAB_LABELS = {
  [CAMPUS]: 'Campus-Wide',
  [DEPARTMENT]: 'Department',
};

export default function AdminAnnouncements() {
  const router = useRouter();
  const { user } = useAuth();
  const { posts } = usePosts();

  const allowed = VISIBLE_FROM_ABOVE[user?.position] || [];

  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(allowed.length > 1 ? 'all' : allowed[0] || 'all');
 
const categoryTabs = allowed.map((key) => ({ key, label: TAB_LABELS[key] }));
const tabs = allowed.length > 1
  ? [{ key: 'all', label: 'All' }, ...categoryTabs]
  : categoryTabs;

  
  const visiblePosts = posts.filter((p) => {
    if (!allowed.includes(p.category)) return false;
    // Department posts only count if they're from the teacher's own department
    if (p.category === DEPARTMENT && p.department !== user?.department) return false;
    return activeTab === 'all' || p.category === activeTab;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MAROON} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Announcements</Text>
        </View>
      </View>

      {/* Filter buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((t) => {
          const active = t.key === activeTab;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No announcements yet.</Text>
        }
        renderItem={({ item }) => {
          const colors = CATEGORY_COLORS[item.category];
          const open = expandedId === item.id;
          const categoryLabel =
            item.category === DEPARTMENT && item.department
              ? item.department
              : CATEGORIES.find((c) => c.key === item.category)?.label;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setExpandedId(open ? null : item.id)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors?.bg }]}>
                    <Text style={[styles.badgeText, { color: colors?.text }]}>{categoryLabel}</Text>
                  </View>
                  <PriorityBadge priority={item.priority} />
                </View>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAuthor}>{item.author}</Text>
              {open && !!item.body && <Text style={styles.body}>{item.body}</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#222' },

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

  list: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },
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
  date: { fontSize: 11, color: '#999' },
  cardTitle: { fontSize: 15, color: '#222', fontWeight: '600', marginBottom: 4 },
  cardAuthor: { fontSize: 12, color: '#888' },
  body: { fontSize: 14, color: '#444', marginTop: 12, lineHeight: 20 },
});