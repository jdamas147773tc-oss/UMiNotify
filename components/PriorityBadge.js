// 📁 FILE LOCATION: components/PriorityBadge.js  (from your Notify project root)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORITIES } from '../data/announcements';

export default function PriorityBadge({ priority }) {
  const p = PRIORITIES[priority] || PRIORITIES.medium;
  return (
    <View style={[styles.badge, { backgroundColor: p.bg }]}>
      <Text style={[styles.text, { color: p.text }]}>{p.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  text: { fontSize: 11, fontWeight: '700' },
});