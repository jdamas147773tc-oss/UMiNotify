import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  collection, doc, getDoc, getDocs, limit, query,
  updateDoc, where,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext(null);

function profileFromSnapshot(snapshot, email) {
  if (!snapshot.exists()) {
    throw new Error('Your account profile could not be found. Contact an administrator.');
  }

  const profile = snapshot.data();
  return {
    ...profile,
    username: profile.studentId || profile.username || email,
    email: profile.email || email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);

      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser(profileFromSnapshot(snapshot, firebaseUser.email));
      } catch (error) {
        setUser(null);
        setAuthError(`Could not load your account profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (usernameOrEmail, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      let loginEmail = usernameOrEmail.trim();

      // No "@" means a username, so look up the email for it
      if (!loginEmail.includes('@')) {
        const q = query(
          collection(db, 'users'),
          where('username', '==', loginEmail),
          limit(1)
        );
        const found = await getDocs(q);
        if (found.empty) {
          return { success: false, error: 'Incorrect username or password.' };
        }
        loginEmail = found.docs[0].data().email;
      }

      const credential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const snapshot = await getDoc(doc(db, 'users', credential.user.uid));
      const profile = profileFromSnapshot(snapshot, credential.user.email);
      setUser(profile);
      return { success: true, role: profile.role };
    } catch (error) {
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          return {
            success: false,
            error: `${error.message} Could not clear the previous Firebase session: ${signOutError.message}`,
          };
        }
      }
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) {
        return { success: false, error: 'You must be logged in.' };
      }
      const cred = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, cred);
      await updatePassword(fbUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changeUsername = async (newUsername) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) {
        return { success: false, error: 'You must be logged in.' };
      }
      const clean = newUsername.trim();
      if (clean.length < 3 || clean.includes('@') || /\s/.test(clean)) {
        return { success: false, error: 'Use at least 3 characters, with no spaces or "@".' };
      }
      const found = await getDocs(
        query(collection(db, 'users'), where('username', '==', clean), limit(1))
      );
      if (!found.empty && found.docs[0].id !== fbUser.uid) {
        return { success: false, error: 'That username is already taken.' };
      }
      await updateDoc(doc(db, 'users', fbUser.uid), { username: clean });
      setUser((prev) => ({ ...prev, username: clean }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user, isLoading, authError,
      login, resetPassword,
      changePassword, changeUsername,
      logout,
    }),
    [user, isLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}