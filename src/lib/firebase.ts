// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzhyR5kDTZKznqQ8HlyfOCMCz3q4_pQf8",
  authDomain: "nivedha-23672.firebaseapp.com",
  projectId: "nivedha-23672",
  storageBucket: "nivedha-23672.firebasestorage.app",
  messagingSenderId: "326643531943",
  appId: "1:326643531943:web:f44a81dcf6f1d9c4109b82",
  measurementId: "G-94BNQZG803"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// User data type
export interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  createdAt: Date;
}

// Function to store user data in Firestore
export const storeUserData = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Only create the user document if it doesn't exist
    if (!userDoc.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date()
      };
      
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

export { app, auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };