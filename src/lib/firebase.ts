import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0nESDyr6GbtC0rC7rGqnjyx6bFNe8jkE",
  authDomain: "tasks-9520d.firebaseapp.com",
  projectId: "tasks-9520d",
  storageBucket: "tasks-9520d.firebasestorage.app",
  messagingSenderId: "665678694351",
  appId: "1:665678694351:web:f6fb5461b2f614138274ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 