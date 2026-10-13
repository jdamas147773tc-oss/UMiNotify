import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePosts } from '../../context/PostsContext';

export default function NewAnnouncementPopup() {
  const { notifications, dismissNotification } = usePosts();
  const current = notifications[0]; // show one at a time, in order
  const slide = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (!current) return;
    slide.setValue(-150);
    Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    const timer = setTimeout(() => dismiss(current.id), 5000);
    return () => clearTimeout(timer);
  }, [current?.id]);

  const dismiss = (id) => {
    Animated.timing(slide, { toValue: -150, duration: 250, useNativeDriver: true }).start(() =>
      dismissNotification(id)
    );
  };

  if (!current) return null;

  const label =
    current.category === 'subject' ? `📚 ${current.subjectCode}` :
    current.category === 'department' ? `🏫 ${current.department}` :
    '📢 Campus Announcement';

  return (
    <Animated.View style={[styles.popup, { transform: [{ translateY: slide }] }]}>
      <TouchableOpacity onPress={() => dismiss(current.id)} activeOpacity={0.8}>
        <Text style={styles.label}>{label} • New Announcement</Text>
        <Text style={styles.title} numberOfLines={1}>{current.title}</Text>
        {!!current.body && <Text style={styles.body} numberOfLines={2}>{current.body}</Text>}
        {notifications.length > 1 && (
          <Text style={styles.more}>+{notifications.length - 1} more</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#7A1F2B',
    elevation: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  label: { color: '#F3D9DC', fontSize: 12, marginBottom: 2 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  body: { color: '#F5E6E8', fontSize: 13, marginTop: 2 },
  more: { color: '#E8B4BA', fontSize: 11, marginTop: 4 },
  });