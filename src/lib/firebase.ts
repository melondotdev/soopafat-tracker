import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAh4XSKJFqruOniLqrsmROl4X1bfrPJqrU",
  authDomain: "soopa-60425.firebaseapp.com",
  projectId: "soopa-60425",
  storageBucket: "soopa-60425.appspot.com",
  messagingSenderId: "673911006912",
  appId: "1:673911006912:web:b200e0373a17b5fe45ef25",
  measurementId: "G-N489W49WW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error);
  });