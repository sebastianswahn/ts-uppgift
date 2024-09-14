import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBR-XBdJsSnKJVrpQhfxwmIg0S1UWvKreg",
  authDomain: "typescript-forum-2b4c6.firebaseapp.com",
  projectId: "typescript-forum-2b4c6",
  storageBucket: "typescript-forum-2b4c6.appspot.com",
  messagingSenderId: "659286310372",
  appId: "1:659286310372:web:806b3fef8b0e29ee291bf1",
  measurementId: "G-KPNPMFG3PB",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
}

export const registerUser = async (email: string, password: string) => {
  await createUserWithEmailAndPassword(auth, email, password);
};

export async function testFirestore() {}

export { auth, db };
