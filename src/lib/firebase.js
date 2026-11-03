/**
 * Firebase initialization. Config comes from the VITE_FIREBASE_* variables in
 * .env. Exports:
 *   - auth: Firebase Authentication instance
 *   - db:   Firestore instance
 * Everything that talks to Firebase imports these two from here.
 *
 * Where things are used:
 *   - auth: features/auth/AuthContext.jsx
 *   - db: features/auth/AuthContext.jsx, features/boards/LeadDashboard.jsx,
 *       features/boards/PhaseMenu.jsx, features/boards/StudentDashboard.jsx,
 *       features/comments/commentActions.js, features/comments/useComments.js,
 *       features/notifications/notificationActions.js,
 *       features/notifications/useNotifications.js, features/projects/projectActions.js,
 *       features/projects/useProjects.js, features/settings/Settings.jsx,
 *       features/settings/useSettings.js, features/students/useStudents.js,
 *       features/tickets/hooks/useHistory.js, features/tickets/hooks/useTickets.js,
 *       features/tickets/ticketActions.js, features/tickets/ticketHistory.js
 *   - Local helpers (only used in this file): firebaseConfig, app
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
