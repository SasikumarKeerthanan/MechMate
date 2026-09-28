// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyABRldnRI4b2EgXN9PKXQhkM4FvvCR1lnQ",
    authDomain: "mechmate-1d07b.firebaseapp.com",
    projectId: "mechmate-1d07b",
    storageBucket: "mechmate-1d07b.firebasestorage.app",
    messagingSenderId: "413018470924",
    appId: "1:413018470924:web:a07e4a6ba6fef4d5efcc29",
    measurementId: "G-9Y4C73R40D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);