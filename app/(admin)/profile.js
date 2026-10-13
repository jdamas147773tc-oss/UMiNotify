// 📁 FILE LOCATION: app/(admin)/profile.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const MAROON = '#7A1F2B';

const POSITION_LABELS = {
  super_admin: 'Campus Admin',
  dept_rep: 'Department Head',
  teacher: 'Teacher',
};

export default function AdminProfile() {
  const { user, logout, changePassword, changeUsername } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const canEditUsername = user?.role === 'admin' && !!user?.email;

  const startEdit = () => {
    setNewUsername(user?.username || '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNewUsername('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const handleSave = async () => {
    const usernameChanged =
      canEditUsername && newUsername.trim() !== '' && newUsername.trim() !== user?.username;
    const passwordFilled = !!(currentPw || newPw || confirmPw);

    if (!usernameChanged && !passwordFilled) {
      Alert.alert('Nothing to save', 'Change your username or fill in the password fields.');
      return;
    }

    // Check the password fields first so nothing is saved halfway
    if (passwordFilled) {
      if (!currentPw) {
        Alert.alert('Current password needed', 'Enter your current password.');
        return;
      }
      if (newPw.length < 6) {
        Alert.alert('Too short', 'Use at least 6 characters for the new password.');
        return;
      }
      if (newPw !== confirmPw) {
        Alert.alert('Does not match', 'The new passwords are not the same.');
        return;
      }
    }

    // Password first, since it verifies the current password
    if (passwordFilled) {
      const pwResult = await changePassword(currentPw, newPw);
      if (!pwResult.success) {
        Alert.alert('Could not change password', pwResult.error);
        return;
      }
    }

    if (usernameChanged) {
      const nameResult = await changeUsername(newUsername);
      if (!nameResult.success) {
        Alert.alert(
          'Could not change username',
          (passwordFilled ? 'Your password was updated, but the username was not. ' : '') +
            nameResult.error
        );
        return;
      }
    }

    cancelEdit();
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const performLogout = async () => {
    await logout();
  };

  const confirmLogout = () => {
    const message = 'Are you sure you want to log out?';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) performLogout();
      return;
    }
    Alert.alert('Log out', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: performLogout },
    ]);
  };

  const rows = [
    { label: 'Username', value: user?.username },
    { label: 'Position', value: POSITION_LABELS[user?.position] || 'Faculty' },
    { label: 'Department', value: user?.department || 'All departments' },
    ...(user?.email ? [{ label: 'Email', value: user.email }] : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Text style={styles.avatarInitial}>
              {(user?.fullName || user?.username || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName || user?.username}</Text>
          <Text style={styles.role}>{POSITION_LABELS[user?.position] || 'Faculty'}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.label}>{row.label}</Text>
              {row.label === 'Username' && editing && canEditUsername ? (
                <TextInput
                  style={styles.inlineInput}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="Username"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.value}>{row.value}</Text>
              )}
            </View>
          ))}
        </View>

        {!editing ? (
          user?.email ? (
            <TouchableOpacity style={styles.editButton} onPress={startEdit}>
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Change password</Text>
              <TextInput style={styles.input} value={currentPw} onChangeText={setCurrentPw}
                placeholder="Current password" secureTextEntry />
              <TextInput style={styles.input} value={newPw} onChangeText={setNewPw}
                placeholder="New password" secureTextEntry />
              <TextInput style={styles.input} value={confirmPw} onChangeText={setConfirmPw}
                placeholder="Confirm new password" secureTextEntry />
              <Text style={styles.hint}>Leave blank to keep your current password.</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  top: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: MAROON },
  avatarInitial: { fontSize: 44, color: '#fff', fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#222', marginTop: 12 },
  role: { fontSize: 14, color: '#888', marginTop: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: '#E0D8C8', paddingHorizontal: 16,
  },
  row: { paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#EFEAE0' },
  label: { fontSize: 12, color: '#888', marginBottom: 2 },
  value: { fontSize: 15, color: '#222', fontWeight: '500' },
  inlineInput: {
    height: 40, borderRadius: 8, backgroundColor: '#EFEAE0', borderWidth: 1,
    borderColor: MAROON, paddingHorizontal: 12, fontSize: 15, color: '#222', marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: '#E0D8C8', padding: 16, marginTop: 16,
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 10 },
  input: {
    height: 44, borderRadius: 8, backgroundColor: '#EFEAE0', borderWidth: 1,
    borderColor: '#E0D8C8', paddingHorizontal: 14, fontSize: 14, marginBottom: 10,
  },
  hint: { fontSize: 12, color: '#888' },
  saveButton: {
    marginTop: 16, height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center',
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  editButton: {
    marginTop: 16, height: 44, borderRadius: 8, borderWidth: 1, borderColor: MAROON,
    alignItems: 'center', justifyContent: 'center',
  },
  editButtonText: { color: MAROON, fontSize: 14, fontWeight: '600' },
  cancelButton: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#888', fontSize: 14, fontWeight: '600' },
  logoutButton: {
    marginTop: 24, height: 48, borderRadius: 8, backgroundColor: MAROON,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});