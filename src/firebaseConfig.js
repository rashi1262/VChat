// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaZPupgt6vF9Yr3cgfS8suc9TUUkOWSZA",
  authDomain: "vchat-auth.firebaseapp.com",
  projectId: "vchat-auth",
  storageBucket: "vchat-auth.firebasestorage.app",
  messagingSenderId: "1028501969903",
  appId: "1:1028501969903:web:5efc2de7899a0a009ab41a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };