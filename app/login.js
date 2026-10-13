import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import UniversityLogo from '../components/UniversityLogo';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
   const { login, resetPassword, isLoading, authError } = useAuth();

 const handleLogin = async () => {
    const result = await login(username, password); 
    if (result.success) {
        if (result.role === 'admin') {
            router.replace('/(admin)');
        } else {
            router.replace('/(student)');
        }
    } else {
        Alert.alert('Login failed', result.error || 'Please try again');
    }
};
        const handleForgotPassword = async () => {
  const email = username.trim();
  if (!email.includes('@')) {
    Alert.alert('Enter your email', 'Type your student email in the field above, then tap "Forgot password?".');
    return;
  }
  const result = await resetPassword(email);
  if (result.success) {
    Alert.alert('Check your email', 'If an account exists for that email, a reset link has been sent.');
  } else {
    Alert.alert('Could not send reset email', result.error || 'Please try again');
  }
};
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : Platform.OS === 'android'
                            ? 'height'
                            : undefined
                }
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.logoWrapper}>
                        <UniversityLogo size={120} />
                    </View>

                    <Text style={styles.title}>UMiNotify</Text>
                    <Text style={styles.subtitle}>Your Academic Broadcast Platform</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email or faculty username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            placeholder="Enter email or username"
                        />
                    </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color="#8A7F7A"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Logging in...' : 'Login  ->'}
                        </Text>
                    </TouchableOpacity>
                    {authError ? <Text style={styles.authError}>{authError}</Text> : null}

                   <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow}>
                        <Text style={styles.signUpLink}>Forgot password?</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const MAROON = '#7A1F2B';
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FBF6EE' },
    flex: { flex: 1 },
    container: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 24, alignItems: 'center' },
    logoWrapper: {
        width: 100, height: 90,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: 20,
    },
    logo: { width: 70, height: 70 },
    title: { fontSize: 26, fontWeight: '700', color: '#222', marginTop: 4 },
    subtitle: { fontSize: 12, color: '#888', marginBottom: 18, textAlign: 'center' },
    portalLink: { fontSize: 14, color: '#333', textDecorationLine: 'underline', marginBottom: 24 },
    fieldGroup: { width: '100%', marginBottom: 16 },
    label: { fontSize: 13, color: '#333', marginBottom: 6 },
    input: {
        width: '100%', height: 44, borderRadius: 8, backgroundColor: '#EFEAE0',
        paddingHorizontal: 14, fontSize: 14, borderWidth: 1, borderColor: '#E0D8C8',
    },
    loginButton: {
        width: '100%', height: 48, borderRadius: 8, backgroundColor: MAROON,
        alignItems: 'center', justifyContent: 'center', marginTop: 12,
    },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    signUpRow: { flexDirection: 'row', marginTop: 18 },
    signUpText: { fontSize: 13, color: '#555' },
    signUpLink: { fontSize: 13, color: MAROON, fontWeight: '600', textDecorationLine: 'underline' },
    forgotRow: { marginTop: 18 },
    authError: { color: '#C0392B', fontSize: 12, marginTop: 12, textAlign: 'center' },
    passwordWrapper: {
    width: '100%', height: 44, borderRadius: 8, backgroundColor: '#EFEAE0',
    borderWidth: 1, borderColor: '#E0D8C8',
    flexDirection: 'row', alignItems: 'center',
},
passwordInput: { flex: 1, height: '100%', paddingHorizontal: 14, fontSize: 14 },
eyeButton: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
});