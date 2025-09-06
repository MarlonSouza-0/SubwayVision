// Importa os SDKs do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc_8qRK7WkEUWYPAc41T05zELJb_PkYCU",
  authDomain: "metro-sp-dtbs.firebaseapp.com",
  projectId: "metro-sp-dtbs",
  storageBucket: "metro-sp-dtbs.firebasestorage.app",
  messagingSenderId: "128758650890",
  appId: "1:128758650890:web:232823f4fb552968fb67f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

