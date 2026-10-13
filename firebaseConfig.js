import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDP7RTXzMG24FxItgUp8DqcRG8KCU6Wz9Q',
  authDomain: 'umnotify.firebaseapp.com',
  projectId: 'umnotify',
  storageBucket: 'umnotify.firebasestorage.app',
  messagingSenderId: '318603918649',
  appId: '1:318603918649:web:a3fd7dfe712fd358b13ce8',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function initializeFirebaseAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') {
      throw error;
    }
    return getAuth(app);
  }
}

export const auth = initializeFirebaseAuth();
export const db = getFirestore(app);