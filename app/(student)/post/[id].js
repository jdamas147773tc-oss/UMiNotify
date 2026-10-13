// 📁 FILE LOCATION: app/(student)/post/[id].js  (from your Notify project root)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CATEGORIES, CATEGORY_COLORS } from '../../../data/announcements';
import { usePosts } from '../../../context/PostsContext';
import { useAuth } from '../../../context/AuthContext';
import PriorityBadge from '../../../components/PriorityBadge';

const MAROON = '#7A1F2B';

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { posts, commentsByPost, isRead, markRead, addComment, deleteComment } = usePosts();
  const [commentText, setCommentText] = useState('');
  const [showFullBody, setShowFullBody] = useState(false);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Announcement not found</Text>
          <Text style={styles.body}>It may have been removed. Go back and pick another one.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const colors = CATEGORY_COLORS[post.category];
  const categoryLabel = CATEGORIES.find((c) => c.key === post.category).label;
  const read = isRead(user.username, post.id);
  const comments = commentsByPost[post.id] || [];

  const handleMarkRead = () => {
    markRead(user.username, post.id, user.fullName || user.username);

    // Go back to the main screen (the feed this announcement was opened from)
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(student)');
    }
  };

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || !user?.username) return;

    await addComment({
      postId: post.id,
      username: user.username,
      fullName: user.fullName || user.username,
      text: trimmed,
    });
    setCommentText('');
  };

  const handleDeleteComment = (comment) => {
    if (!user?.username || comment.username !== user.username) return;

    Alert.alert('Delete comment', 'Remove this comment from the thread?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteComment(comment.id, user.username) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {post.subjectCode || categoryLabel}
            </Text>
          </View>
          <PriorityBadge priority={post.priority} />
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
        {post.category === 'department' && post.department ? post.department : post.author} · {post.date}
        </Text>

        <View style={styles.bodyCard}>
          <Text style={styles.bodyLabel}>Description</Text>
          <Text style={styles.body} numberOfLines={showFullBody ? undefined : 6}>
            {post.body}
          </Text>
          {post.body.length > 220 ? (
            <TouchableOpacity onPress={() => setShowFullBody((prev) => !prev)} style={styles.toggleBodyButton}>
              <Text style={styles.toggleBodyText}>{showFullBody ? 'Show less' : 'Show more'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.readRow}>
            <View style={styles.readSummaryBox}>
              <Text style={styles.readSummaryTitle}>Read by {read ? 1 : 0}</Text>
            </View>

            {read ? (
              <View style={styles.readBox}>
                <Text style={styles.readText}>✓ You marked this as read</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.readButton} onPress={handleMarkRead}>
                <Text style={styles.readButtonText}>Mark as read</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>Comments</Text>

          {comments.length === 0 ? (
            <Text style={styles.emptyComments}>No comments yet. Be the first one to reply.</Text>
          ) : (
            <View style={styles.commentList}>
              {comments.map((comment) => {
                const isOwnComment = comment.username === user.username;

                return (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.fullName || comment.username}</Text>
                      {isOwnComment ? (
                        <TouchableOpacity onPress={() => handleDeleteComment(comment)}>
                          <Text style={styles.deleteComment}>Delete</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.commentComposer}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              placeholderTextColor="#A39A8C"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.commentButton, !commentText.trim() && styles.commentButtonDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.commentButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  container: { padding: 24 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  meta: { fontSize: 12, color: '#888', marginBottom: 20 },
  bodyCard: {
    backgroundColor: '#F8F3ED', borderWidth: 1, borderColor: '#E0D8C8', borderRadius: 10,
    padding: 14, marginBottom: 18,
  },
  image: {
    width: '100%', height: 220, borderRadius: 10, marginBottom: 14, backgroundColor: '#EAE2D7',
  },
  bodyLabel: {
    fontSize: 11,
    color: '#8A7F7A',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  body: { fontSize: 15, color: '#444', lineHeight: 23 },
  toggleBodyButton: { marginTop: 8, alignSelf: 'flex-end' },
  toggleBodyText: { color: MAROON, fontSize: 12, fontWeight: '700' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 12 },
  readRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12,
  },
  readSummaryBox: {
    backgroundColor: '#F2EEE8', borderWidth: 1, borderColor: '#E0D8C8', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  readSummaryTitle: { fontSize: 12, fontWeight: '700', color: '#222' },
  emptyComments: { fontSize: 13, color: '#7C7068', marginBottom: 12 },
  commentList: { gap: 10, marginBottom: 12 },
  commentItem: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0D8C8',
    borderRadius: 8, padding: 12,
  },
  commentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  commentAuthor: { fontSize: 12, fontWeight: '700', color: '#222' },
  deleteComment: { fontSize: 12, fontWeight: '600', color: '#C0392B' },
  commentText: { fontSize: 13, color: '#444', lineHeight: 20 },
  commentComposer: { marginTop: 8 },
  commentInput: {
    backgroundColor: '#EFEAE0', borderWidth: 1, borderColor: '#E0D8C8', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#222', minHeight: 80,
    marginBottom: 10,
  },
  commentButton: {
    height: 42, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center',
  },
  commentButtonDisabled: { opacity: 0.55 },
  commentButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  readButton: {
    height: 36, borderRadius: 8, backgroundColor: MAROON,
    paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
  },
  readButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  readBox: {
    height: 36, borderRadius: 8, backgroundColor: '#E6F0E6', borderWidth: 1, borderColor: '#B7D3B7',
    paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
  },
  readText: { color: '#2F6B2F', fontSize: 12, fontWeight: '600' },
});