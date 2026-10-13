// 📁 FILE LOCATION: app/(student)/courses.js  (from your Notify project root)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CoursesContext';

const MAROON = '#7A1F2B';

export default function StudentCourses() {
  const { user } = useAuth();
  const { joinCourse, leaveCourse, toggleAlerts, getJoinedCourses } = useCourses();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const myCourses = getJoinedCourses(user.username);

  const handleJoin = () => {
    if (!code.trim()) {
      setError('Enter the joining code from your instructor.');
      return;
    }
    const result = joinCourse(user.username, code);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError('');
    setCode('');
    Alert.alert('Course joined', `You joined ${result.course.code}. Its announcements now appear in your feed.`);
  };

  const confirmLeave = (course) => {
    Alert.alert('Leave course', `Leave ${course.code}? You will stop seeing its announcements.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leaveCourse(user.username, course.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={myCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>My courses</Text>

            <Text style={styles.label}>Join a course</Text>
            <View style={styles.joinRow}>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setError('');
                }}
                placeholder="Enter joining code"
                placeholderTextColor="#A39A8C"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={[styles.label, { marginTop: 24 }]}>Joined courses</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            You haven't joined any course yet. Ask your instructor for a joining code.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.courseCode}>{item.code}</Text>
                <Text style={styles.courseName}>{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmLeave(item)}>
                <Text style={styles.leave}>Leave</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.alertRow}>
              <Text style={styles.alertText}>
                {item.alertsOn ? 'Alerts on' : 'Alerts off'}
              </Text>
              <Switch
                value={item.alertsOn}
                onValueChange={() => toggleAlerts(user.username, item.id)}
                trackColor={{ false: '#D8D0C0', true: '#C98A93' }}
                thumbColor={item.alertsOn ? MAROON : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  list: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  joinRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, height: 46, borderRadius: 8, backgroundColor: '#EFEAE0',
    paddingHorizontal: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0D8C8', color: '#222',
  },
  inputError: { borderColor: '#C0392B' },
  joinButton: {
    height: 46, paddingHorizontal: 20, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center',
  },
  joinButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  errorText: { color: '#C0392B', fontSize: 12, marginTop: 6 },
  empty: { color: '#888', fontSize: 14, lineHeight: 20, marginTop: 4 },
  card: {
    backgroundColor: '#fff', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#E0D8C8', marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, paddingRight: 12 },
  courseCode: { fontSize: 16, fontWeight: '700', color: MAROON },
  courseName: { fontSize: 14, color: '#444', marginTop: 2 },
  leave: { fontSize: 13, color: '#888', fontWeight: '600' },
  alertRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EFEAE0',
  },
  alertText: { fontSize: 13, color: '#555' },
});