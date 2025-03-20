// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBv_wvxAybGoJcNeq1FU-kAB6o8Ji42PAg",
    authDomain: "monitormate-3d3ce.firebaseapp.com",
    databaseURL: "https://monitormate-3d3ce-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "monitormate-3d3ce",
    storageBucket: "monitormate-3d3ce.firebasestorage.app",
    messagingSenderId: "894302478976",
    appId: "1:894302478976:web:f0a169a321c4357c98bc65",
    measurementId: "G-1VLC8LVV7F"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(firebaseApp);

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);

// Initialize Realtime Database
const database = getDatabase(firebaseApp);

export { database, ref, set, get, push, onValue, auth, storage, storageRef, uploadBytes, getDownloadURL };
