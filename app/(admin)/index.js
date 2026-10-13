// 📁 FILE LOCATION: app/(admin)/index.js  (from your Notify project root)
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import { CATEGORIES, CATEGORY_COLORS } from '../../data/announcements';
import PriorityBadge from '../../components/PriorityBadge';
import UniversityLogo from '../../components/UniversityLogo';

export default function AdminHome() {
  const router = useRouter();
  const { user} = useAuth();
  const { posts, deletePost, commentsByPost } = usePosts();

  // Only show announcements this faculty member posted
  const myPosts = posts.filter((p) => p.author === user?.username);

  const confirmDelete = (post) => {
    const message = `Delete "${post.title}"? Students will no longer see it.`;

    // Alert.alert with buttons doesn't work in the web preview, so use window.confirm there
    if (Platform.OS === 'web') {
      if (window.confirm(message)) deletePost(post.id);
      return;
    }

    Alert.alert('Delete announcement', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
       <TouchableOpacity
  style={styles.headerBrand}
  onPress={() => router.push('/(admin)/profile')}
>
  <UniversityLogo size={36} />
  <View>
    <Text style={styles.greeting}>Signed in as faculty</Text>
    <Text style={styles.welcome}>{user?.fullName || user?.username}</Text>
    {user?.studentId ? (
      <Text style={styles.accountId}>ID: {user.studentId}</Text>
    ) : null}
  </View>
  </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.newButton} onPress={() => router.push('/(admin)/create')}>
        <Text style={styles.newButtonText}>+ New announcement</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Your announcements</Text>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You haven't posted anything yet. Tap "New announcement" to send your first one.
          </Text>
        }
        renderItem={({ item }) => {
          const colors = CATEGORY_COLORS[item.category];
          const commentCount = commentsByPost[item.id]?.length || 0;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/post/[id]',
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.cardTopRow}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {item.subjectCode || CATEGORIES.find((c) => c.key === item.category).label}
                    </Text>
                  </View>
                  <PriorityBadge priority={item.priority} />
                </View>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
              <View style={styles.actions}>
                <Text style={styles.viewThread}>
                  {commentCount === 0 ? 'View comments' : `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`}
                </Text>

                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmDelete(item);
                  }}
                >
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  logout: { color: MAROON, fontWeight: '600' },
  newButton: {
    marginHorizontal: 20, height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  newButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#666', paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#888', marginTop: 30, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#E0D8C8', marginBottom: 10,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  urgentBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#C0392B' },
  urgentText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  date: { fontSize: 11, color: '#999' },
  cardTitle: { fontSize: 15, color: '#222', fontWeight: '600', marginBottom: 4 },
  cardBody: { fontSize: 13, color: '#666', lineHeight: 18 },
  actions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EFEAE0',
  },
  viewThread: { fontSize: 13, fontWeight: '600', color: MAROON },
  delete: { fontSize: 13, fontWeight: '600', color: '#C0392B' },
});