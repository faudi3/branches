import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore/";

const firebaseConfig = {
  apiKey: "AIzaSyA_g4XOSNND9gOabovyUTaYBSPnOujIQPc",
  authDomain: "branches-4275b.firebaseapp.com",
  projectId: "branches-4275b",
  storageBucket: "branches-4275b.appspot.com",
  messagingSenderId: "212548170855",
  appId: "1:212548170855:web:f9c7248c23472daf0290c2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
