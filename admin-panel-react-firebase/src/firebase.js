import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { collection, getDocs } from 'firebase/firestore';


// Initialize Firebase
const app = initializeApp(
  {
    apiKey: "AIzaSyB0bocjx7pIwpWxbC7Qfb7XQbSiHDQwjk0",
    authDomain: "atcs-96271.firebaseapp.com",
    databaseURL: "https://atcs-96271.firebaseio.com",
    projectId: "atcs-96271",
    storageBucket: "atcs-96271.appspot.com",
    messagingSenderId: "1046881613444",
    appId: "1:1046881613444:web:7cacf4aea8e85c6f51b4d1",
    measurementId: "G-C37ZRE87MW"
  }
)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const messaging = getMessaging(app);