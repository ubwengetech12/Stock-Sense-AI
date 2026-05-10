// File: src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKLgjeTrKdHOR6Ra-UNDMDQERElViwa6w",
  authDomain: "stocksenseai-f8e94.firebaseapp.com",
  projectId: "stocksenseai-f8e94",
  storageBucket: "stocksenseai-f8e94.firebasestorage.app",
  messagingSenderId: "765152520956",
  appId: "1:765152520956:web:46d16d959be37c24628579",
};

const app = initializeApp(firebaseConfig);

// Use default Firestore database (no custom ID — your config has none)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
}

export function handleFirestoreError(
  error: any,
  operation: FirestoreErrorInfo['operationType'],
  path: string | null = null
): never {
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType: operation,
    path,
  };
  throw new Error(JSON.stringify(errorInfo));
}