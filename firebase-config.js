// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARfR8QwkP7RuOtkDIxT2Qw-AJ81twsbbU",
    authDomain: "barberia-app-c6a5a.firebaseapp.com",
    projectId: "barberia-app-c6a5a",
    storageBucket: "barberia-app-c6a5a.firebastorage.app",
    messagingSenderId: "411388410380",
    appId: "1:411388410380:web:34216bf3231c4ff5638c29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };