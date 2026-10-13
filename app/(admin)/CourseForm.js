// 📁 FILE LOCATION: app/(admin)/CourseForm.js  (from your Notify project root)
import React, { useState, useCallback } from 'react';
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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';

const MAROON = '#7A1F2B';

export default function CourseForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // present when editing
  const { user } = useAuth();
  const { getCourse, addCourse, updateCourse } = useCourses();

  const existing = id ? getCourse(id) : null;

  const [code, setCode] = useState(existing?.code ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [errors, setErrors] = useState({});

  // Reset the form every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const course = id ? getCourse(id) : null;
      setCode(course?.code ?? '');
      setName(course?.name ?? '');
      setErrors({});
    }, [id])
  );

  const handleSave = () => {
    const e = {};
    if (!code.trim()) e.code = 'Enter the course code.';
    if (!name.trim()) e.name = 'Enter the course name.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (existing) {
      updateCourse(existing.id, { code: code.trim(), name: name.trim() });
    } else {
      addCourse({ code: code.trim(), name: name.trim(), owner: user.username });
    }

    setCode('');
    setName('');
    router.replace('/(admin)/courses');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>{existing ? 'Edit course' : 'New course'}</Text>

          <Text style={styles.label}>Course code</Text>
          <TextInput
            style={[styles.input, errors.code && styles.inputError]}
            value={code}
            onChangeText={setCode}
            placeholder="e.g. IT 301"
            placeholderTextColor="#A39A8C"
            autoCapitalize="characters"
          />
          {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}

          <Text style={styles.label}>Course name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Systems Integration"
            placeholderTextColor="#A39A8C"
            autoCapitalize="words"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          {!existing && (
            <Text style={styles.hint}>
              A joining code is generated automatically. Share it with your students so they can join.
            </Text>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{existing ? 'Save changes' : 'Create course'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  container: { padding: 24 },
  heading: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#EFEAE0', borderWidth: 1, borderColor: '#E0D8C8', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#222',
  },
  inputError: { borderColor: '#C0392B' },
  errorText: { color: '#C0392B', fontSize: 12, marginTop: 4 },
  hint: { fontSize: 13, color: '#777', lineHeight: 19, marginTop: 16 },
  saveButton: {
    height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});