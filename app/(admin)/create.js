// 📁 FILE LOCATION: app/(admin)/create.js  (from your Notify project root)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import { useCourses } from '../../context/CoursesContext';

const BASE_TOPICS = [
  { id: 'campus', label: 'Campus-Wide', category: 'campus' },
  { id: 'department', label: 'Department', category: 'department' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
];

export default function CreateAnnouncement() {
  const router = useRouter();
  const { user } = useAuth();
  const { addPost } = usePosts();
  const { getOwnedCourses } = useCourses();

  // - super_admin: Campus-Wide
  // - dept_rep: Department (plus their own subjects)
  // - teacher: subjects only
  const canPostCampusWide = user.position === 'super_admin';
  const canPostDepartment = user.position === 'dept_rep';

  const TOPICS = [
    ...(canPostCampusWide ? [BASE_TOPICS[0]] : []),
    ...(canPostDepartment ? [BASE_TOPICS[1]] : []),
    ...getOwnedCourses(user.username).map((c) => ({
      id: c.id,
      label: c.code,
      category: 'subject',
      subjectCode: c.code,
    })),
  ];

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('medium');
  const [topicId, setTopicId] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Enter a title.';
    if (!body.trim()) e.body = 'Enter the message.';
    if (!topicId) e.topic = 'Choose who should receive this.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setPriority('medium');
    setTopicId(null);
    setErrors({});
  };

  const handleSend = () => {
    if (!validate()) return;

    const topic = TOPICS.find((t) => t.id === topicId);
    addPost({
      title: title.trim(),
      body: body.trim(),
      category: topic.category,
      subjectCode: topic.subjectCode,
      priority,
      author: user.username,
      department: topic.category === 'department' ? user.department : undefined,
    });

    resetForm();
    router.replace('/(admin)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Quiz moved to Thursday"
            placeholderTextColor="#A39A8C"
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.body && styles.inputError]}
            value={body}
            onChangeText={setBody}
            placeholder="Write the full announcement here"
            placeholderTextColor="#A39A8C"
            multiline
            textAlignVertical="top"
          />
          {errors.body ? <Text style={styles.errorText}>{errors.body}</Text> : null}

          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setPriority(p.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Send to</Text>
          <View style={styles.chipRow}>
            {TOPICS.map((t) => {
              const active = topicId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setTopicId(t.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.topic ? <Text style={styles.errorText}>{errors.topic}</Text> : null}

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send announcement</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MAROON = '#7A1F2B';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  container: { padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#EFEAE0', borderWidth: 1, borderColor: '#E0D8C8', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#222',
  },
  textArea: { minHeight: 120 },
  inputError: { borderColor: '#C0392B' },
  errorText: { color: '#C0392B', fontSize: 12, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#EFEAE0', borderWidth: 1, borderColor: '#E0D8C8',
  },
  chipActive: { backgroundColor: MAROON, borderColor: MAROON },
  chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  sendButton: {
    height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});