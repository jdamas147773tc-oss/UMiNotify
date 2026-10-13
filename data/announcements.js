// 📁 FILE LOCATION: data/announcements.js  (from your Notify project root)
// Shared dummy data. Replace with a real API fetch when the backend is ready.

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'campus', label: 'Campus-Wide' },
  { key: 'department', label: 'Department' },
  { key: 'subject', label: 'Subject' },
];

// Badge colors per category (used by the feed and the post screen)
export const CATEGORY_COLORS = {
  campus: { bg: '#F4E1E4', text: '#7A1F2B' },
  department: { bg: '#F6EAC8', text: '#7A5A0F' },
  subject: { bg: '#DCEBEC', text: '#2F5D62' },
};


// Four priority levels. Each has its own color AND a text label,
// so they can be told apart without relying on color alone.
export const PRIORITIES = {
  urgent: { label: 'Urgent', bg: '#B3261E', text: '#FFFFFF' },
  high: { label: 'High', bg: '#B85C00', text: '#FFFFFF' },
  medium: { label: 'Medium', bg: '#F6EAC8', text: '#5C4308' },
  low: { label: 'Low', bg: '#E4E8EA', text: '#3D474B' },
};

export const POSTS = [
  {
    id: '1',
    title: 'Library hours extended this week',
    body: 'The university library will stay open until 9:00 PM from Monday to Friday to support midterm preparation. Bring your school ID at the entrance.',
    category: 'campus',
    priority: 'low',
    author: 'Office of Student Affairs',
    date: 'Sep 24',
  },
  {
    id: '2',
    title: 'Classes suspended tomorrow due to weather',
    body: 'All classes at all levels are suspended tomorrow because of heavy rain. Online activities may still be given by your instructors. Stay safe.',
    category: 'campus',
    priority: 'urgent',
    author: 'University Administration',
    date: 'Sep 26',
  },
  {
    id: '3',
    title: 'Midterm exam schedule posted',
    body: 'The midterm schedule for all department courses is now available. Check your section schedule and report any conflicts to the department office by Friday.',
    category: 'department',
    department: 'DCE',
    priority: 'medium',
    author: 'Department Office',
    date: 'Sep 25',
  },
  {
    id: '4',
    title: 'CS Week registration is open',
    body: 'Register for CS Week activities at the department office. Slots for the coding contest are limited to 40 participants.',
    category: 'department',
    department: 'DCE',
    priority: 'low',
    author: 'Department Office',
    date: 'Sep 22',
  },
  {
    id: '5',
    title: 'Quiz moved to Thursday',
    body: 'The quiz originally scheduled for Tuesday is moved to Thursday, same time and room. Coverage stays the same: Chapters 4 to 6.',
    category: 'subject',
    subjectCode: 'IT 301',
    priority: 'high',
    author: 'Prof. Reyes',
    date: 'Sep 27',
  },
  {
    id: '6',
    title: 'Project proposal deadline reminder',
    body: 'Submit your project proposal through the class channel before Sunday, 11:59 PM. Late submissions will lose 10 points.',
    category: 'subject',
    subjectCode: 'CS 205',
    priority: 'medium',
    author: 'Prof. Santos',
    date: 'Sep 23',
  },
];