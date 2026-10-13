// 📁 FILE LOCATION: app/(admin)/courses.js  (from your Notify project root)
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';

const MAROON = '#7A1F2B';

export default function AdminCourses() {
  const router = useRouter();
  const { user } = useAuth();
  const { getOwnedCourses, getMemberCount, deleteCourse, regenerateJoinCode } = useCourses();

  const myCourses = getOwnedCourses(user.username);

  const confirmDelete = (course) => {
    Alert.alert(
      'Delete course',
      `Delete ${course.code}? Students will be removed from it and lose access to its announcements.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCourse(course.id) },
      ]
    );
  };

  const confirmNewCode = (course) => {
    Alert.alert(
      'Generate a new code',
      'The old code will stop working. Students who already joined stay in the course.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => regenerateJoinCode(course.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={myCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Your courses</Text>
            {/* FIXED: path matches the file name CourseForm.js (no group name in the URL) */}
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => router.push({ pathname: '/CourseForm', params: { id: '' } })}
            >
              <Text style={styles.newButtonText}>+ New course</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            You have no courses yet. Create one to get a joining code for your students.
          </Text>
        }
        renderItem={({ item }) => {
          const members = getMemberCount(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseName}>{item.name}</Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Joining code</Text>
                <Text style={styles.codeValue} selectable>{item.joinCode}</Text>
              </View>
              <Text style={styles.members}>
                {members} {members === 1 ? 'student' : 'students'} joined
              </Text>

              <View style={styles.actions}>
                {/* FIXED: same path here */}
                <TouchableOpacity onPress={() => router.push({ pathname: '/CourseForm', params: { id: item.id } })}>
                  <Text style={styles.action}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmNewCode(item)}>
                  <Text style={styles.action}>New code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  list: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 16 },
  newButton: {
    height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  newButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  empty: { color: '#888', fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#E0D8C8', marginBottom: 10,
  },
  courseCode: { fontSize: 16, fontWeight: '700', color: MAROON },
  courseName: { fontSize: 14, color: '#444', marginTop: 2 },
  codeBox: {
    marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#F4E1E4',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  codeLabel: { fontSize: 12, color: '#7A1F2B' },
  codeValue: { fontSize: 20, fontWeight: '700', color: MAROON, letterSpacing: 2 },
  members: { fontSize: 12, color: '#888', marginTop: 8 },
  actions: {
    flexDirection: 'row', gap: 20, marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#EFEAE0',
  },
  action: { fontSize: 13, fontWeight: '600', color: MAROON },
  delete: { fontSize: 13, fontWeight: '600', color: '#C0392B' },
});