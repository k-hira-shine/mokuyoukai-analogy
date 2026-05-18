import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKvKd8OuJyRPl4pa_TfeN_s79afpxvnXw",
  authDomain: "mokuyoukai-analogy.firebaseapp.com",
  projectId: "mokuyoukai-analogy",
  storageBucket: "mokuyoukai-analogy.firebasestorage.app",
  messagingSenderId: "965073150405",
  appId: "1:965073150405:web:f680ba5bab01678334ebac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
