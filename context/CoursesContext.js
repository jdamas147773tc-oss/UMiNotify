// 📁 FILE LOCATION: context/CoursesContext.js  (from your Notify project root)
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const CoursesContext = createContext(null);

// Letters and numbers without look-alikes (no 0/O, 1/I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// PLACEHOLDER: real join codes should be generated securely on a server later.
function makeCode() {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return s;
}

const membershipId = (username, courseId) => `${username}__${courseId}`;
const warn = (label) => (error) => console.warn(`${label}:`, error.message);

export function CoursesProvider({ children }) {
  const { user } = useAuth();
  const username = user?.username;
  const isAdmin = user?.role === 'admin';

  const [courses, setCourses] = useState([]);
  // { username, courseId, alertsOn }
  const [memberships, setMemberships] = useState([]);

  // Live list of all courses (students need it to look up join codes)
  useEffect(() => {
    if (!username) {
      setCourses([]);
      return undefined;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => setCourses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      warn('Could not load courses')
    );
    return unsubscribe;
  }, [username]);

  // Admins need every membership (for student counts); students only their own
  useEffect(() => {
    if (!username) {
      setMemberships([]);
      return undefined;
    }
    const source = isAdmin
      ? collection(db, 'memberships')
      : query(collection(db, 'memberships'), where('username', '==', username));
    const unsubscribe = onSnapshot(
      source,
      (snapshot) => setMemberships(snapshot.docs.map((d) => d.data())),
      warn('Could not load memberships')
    );
    return unsubscribe;
  }, [username, isAdmin]);

  const uniqueCode = () => {
    let code = makeCode();
    while (courses.some((c) => c.joinCode === code)) code = makeCode();
    return code;
  };

  // ---------- Admin actions ----------
  const addCourse = async ({ code, name, owner }) => {
    await addDoc(collection(db, 'courses'), { code, name, joinCode: uniqueCode(), owner });
  };

  const updateCourse = async (id, { code, name }) => {
    await updateDoc(doc(db, 'courses', id), { code, name });
  };

  const deleteCourse = async (id) => {
    await deleteDoc(doc(db, 'courses', id));

    // Remove everyone who joined this course
    const snap = await getDocs(query(collection(db, 'memberships'), where('courseId', '==', id)));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const regenerateJoinCode = async (id) => {
    await updateDoc(doc(db, 'courses', id), { joinCode: uniqueCode() });
  };

  const getOwnedCourses = (owner) => courses.filter((c) => c.owner === owner);
  const getCourse = (id) => courses.find((c) => c.id === id);
  const getMemberCount = (courseId) => memberships.filter((m) => m.courseId === courseId).length;

  // ---------- Student actions ----------
  // These still return their result right away (checked against local data),
  // and save to Firestore in the background, so your screens don't change.
  const joinCourse = (joiner, joinCode) => {
    const course = courses.find((c) => c.joinCode === joinCode.trim().toUpperCase());
    if (!course) return { success: false, error: 'That code is not valid. Check it and try again.' };
    if (memberships.some((m) => m.username === joiner && m.courseId === course.id)) {
      return { success: false, error: 'You already joined this course.' };
    }
    setDoc(doc(db, 'memberships', membershipId(joiner, course.id)), {
      username: joiner,
      courseId: course.id,
      alertsOn: true,
    }).catch(warn('Could not join course'));
    return { success: true, course };
  };

  const leaveCourse = (leaver, courseId) => {
    deleteDoc(doc(db, 'memberships', membershipId(leaver, courseId))).catch(warn('Could not leave course'));
  };

  const toggleAlerts = (member, courseId) => {
    const current = memberships.find((m) => m.username === member && m.courseId === courseId);
    if (!current) return;
    updateDoc(doc(db, 'memberships', membershipId(member, courseId)), {
      alertsOn: !current.alertsOn,
    }).catch(warn('Could not update alerts'));
  };

  // Joined courses for a student, each with its alertsOn flag
  const getJoinedCourses = (member) =>
    memberships
      .filter((m) => m.username === member)
      .map((m) => {
        const course = courses.find((c) => c.id === m.courseId);
        return course ? { ...course, alertsOn: m.alertsOn } : null;
      })
      .filter(Boolean);

  const value = useMemo(
    () => ({
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      regenerateJoinCode,
      getOwnedCourses,
      getCourse,
      getMemberCount,
      joinCourse,
      leaveCourse,
      toggleAlerts,
      getJoinedCourses,
    }),
    [courses, memberships]
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider');
  return ctx;
}