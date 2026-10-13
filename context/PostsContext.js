// 📁 FILE LOCATION: context/PostsContext.js  (from your Notify project root)
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { useCourses } from './CoursesContext';

const PostsContext = createContext(null);

// Firestore rejects fields set to `undefined` (e.g. subjectCode on a campus
// post), so strip them out before saving.
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
// Decide whether the signed-in user should be buzzed for a given post
const shouldNotify = (post, user, enrolledCodes) => {
  if (!user || !post.author || post.author === user.username) return false; // never your own post
  if (post.category === 'campus') return true;
  if (post.category === 'department') return post.department === user.department;
  if (post.category === 'subject') return Array.isArray(enrolledCodes) && enrolledCodes.includes(post.subjectCode);
  return false;
};
export function PostsProvider({ children }) {
  const { user } = useAuth();
  const username = user?.username;
  const { getJoinedCourses, getEnrolledCourses } = useCourses();
  const enrolledCodes = useMemo(
    () => (getJoinedCourses?.(username) ?? getEnrolledCourses?.(username) ?? []).map((c) => c.code),
    [username, getJoinedCourses, getEnrolledCourses]
  );

  // Keep the latest check in a ref so the Firestore listener doesn't need to resubscribe
  const shouldNotifyRef = useRef(() => false);
  shouldNotifyRef.current = (post) => shouldNotify(post, user, enrolledCodes);
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [readersByPost, setReadersByPost] = useState({});
  const [reads, setReads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const previousPostIdsRef = useRef(null);
  const notifiedPostIdsRef = useRef(new Set());

  useEffect(() => {
    if (!username) {
      previousPostIdsRef.current = null;
      notifiedPostIdsRef.current.clear();
      setNotifications([]);
      return undefined;
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const nextIds = new Set(nextPosts.map((post) => post.id));
        const previousIds = previousPostIdsRef.current;

        // Skip the very first load so old posts don't buzz
        if (previousIds) {
          const newPosts = nextPosts.filter((post) => !previousIds.has(post.id));
          const notificationsToShow = [];

          newPosts.forEach((post) => {
            const shouldBuzz = shouldNotifyRef.current(post);
            if (shouldBuzz && !notifiedPostIdsRef.current.has(post.id)) {
              Vibration.vibrate([50, 80, 50]);
              notifiedPostIdsRef.current.add(post.id);
              notificationsToShow.push(post);
            }

            console.log('NEW POST', {
              category: post.category,
              department: post.department,
              subjectCode: post.subjectCode,
              author: post.author,
              myDepartment: user?.department,
              myCodes: enrolledCodes,
              notify: shouldBuzz,
            });
          });

          if (notificationsToShow.length) {
            setNotifications((current) => [...current, ...notificationsToShow]);
          }
        }

        previousPostIdsRef.current = nextIds;
        setPosts((prev) => {
          const sameList = prev.length === nextPosts.length && prev.every((item, index) => item.id === nextPosts[index]?.id);
          return sameList ? prev : nextPosts;
        });
      },
      (error) => console.warn('Could not load posts:', error.message)
    );
    return unsubscribe;
  }, [username]);

  useEffect(() => {
    if (!username) {
      setPosts([]);
      setReads([]);
    }
  }, [username]);

  // Live list of what this user has read
  useEffect(() => {
    if (!username) {
      return undefined;
    }
    const q = query(collection(db, 'reads'), where('username', '==', username));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => setReads(snapshot.docs.map((d) => `${d.data().username}:${d.data().postId}`)),
      (error) => console.warn('Could not load read status:', error.message)
    );
    return unsubscribe;
  }, [username]);

  // Live list of comments grouped by post id, oldest first for thread readability
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const grouped = {};
        snapshot.docs.forEach((docSnap) => {
          const comment = { id: docSnap.id, ...docSnap.data() };
          grouped[comment.postId] ??= [];
          grouped[comment.postId].push(comment);
        });
        setCommentsByPost(grouped);
      },
      (error) => console.warn('Could not load comments:', error.message)
    );
    return unsubscribe;
  }, []);

  // Live list of read receipts grouped by post id
  useEffect(() => {
    const q = query(collection(db, 'reads'), orderBy('readAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const grouped = {};
        snapshot.docs.forEach((docSnap) => {
          const entry = { id: docSnap.id, ...docSnap.data() };
          grouped[entry.postId] ??= [];
          grouped[entry.postId].push({
            username: entry.username,
            fullName: entry.fullName || entry.username,
            readAt: entry.readAt,
          });
        });
        setReadersByPost(grouped);
      },
      (error) => console.warn('Could not load read status:', error.message)
    );
    return unsubscribe;
  }, []);

  const addPost = async ({ title, body, category, subjectCode, priority, author, department, image }) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const trimmedImage = typeof image === 'string' ? image.trim() : '';

    await addDoc(
      collection(db, 'posts'),
      clean({
        title,
        body,
        category,
        subjectCode,
        priority,
        author,
        department,
        image: trimmedImage || undefined,
        date,
        createdAt: now.getTime(), // used to sort newest first
      })
    );
  };

  const addComment = async ({ postId, username: commenterUsername, fullName, text }) => {
    const trimmed = text?.trim();
    if (!postId || !commenterUsername || !trimmed) return;

    await addDoc(
      collection(db, 'comments'),
      clean({
        postId,
        username: commenterUsername,
        fullName: fullName || commenterUsername,
        text: trimmed,
        createdAt: Date.now(),
      })
    );
  };

  const deletePost = async (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setCommentsByPost((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = (next[key] || []).filter((comment) => comment.postId !== postId);
      });
      return next;
    });

    await deleteDoc(doc(db, 'posts', postId));

    // Also remove the read records for this post so they don't pile up
    const readSnap = await getDocs(query(collection(db, 'reads'), where('postId', '==', postId)));
    if (!readSnap.empty) {
      const batch = writeBatch(db);
      readSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const commentSnap = await getDocs(query(collection(db, 'comments'), where('postId', '==', postId)));
    if (!commentSnap.empty) {
      const batch = writeBatch(db);
      commentSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const deleteComment = async (commentId, currentUsername) => {
    if (!commentId || !currentUsername) return;

    const commentSnap = await getDoc(doc(db, 'comments', commentId));
    if (!commentSnap.exists()) return;

    if (commentSnap.data().username !== currentUsername) return;

    setCommentsByPost((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((postId) => {
        next[postId] = (next[postId] || []).filter((comment) => comment.id !== commentId);
      });
      return next;
    });

    await deleteDoc(doc(db, 'comments', commentId));
  };

  const markRead = (readerName, postId, fullName) => {
    const key = `${readerName}:${postId}`;
    if (reads.includes(key)) return;
    setDoc(doc(db, 'reads', `${readerName}__${postId}`), {
      username: readerName,
      fullName: fullName || readerName,
      postId,
      readAt: Date.now(),
    }).catch((error) => console.warn('Could not save read status:', error.message));
  };

  const isRead = (readerName, postId) => reads.includes(`${readerName}:${postId}`);
  const dismissNotification = (postId) => {
    setNotifications((current) => current.filter((post) => post.id !== postId));
  };

  const value = useMemo(
    () => ({ posts, commentsByPost, readersByPost, notifications, dismissNotification, addPost, addComment, deletePost, deleteComment, markRead, isRead }),
    [posts, commentsByPost, readersByPost, notifications, reads]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}