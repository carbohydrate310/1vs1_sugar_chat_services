import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyABpEWCeKHY7xrLgG5RGLliA6q8hpaYsww",
    authDomain: "my-chat-app-97afe.firebaseapp.com",
    projectId: "my-chat-app-97afe",
    storageBucket: "my-chat-app-97afe.firebasestorage.app",
    messagingSenderId: "436348088012",
    appId: "1:436348088012:web:302edf3abacb18a64b1c69",
    measurementId: "G-0083FLW2BF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
