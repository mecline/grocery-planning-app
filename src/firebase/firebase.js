import "firebase/compat/database";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}`,
    storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: `${process.env.REACT_APP_FIREBASE_SENDER_ID}`,
    appId: `${process.env.REACT_APP_FIREBASE_APP_ID}`,
    measurementId: `${process.env.REACT_APP_FIREBASE_MEASUREMENT_ID}`,
    databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};


// Initialize Firebase

const db = firebase.initializeApp(firebaseConfig);

export const firebaseDb = db;
export const auth = firebase.auth();
export const storage = firebase.storage();

