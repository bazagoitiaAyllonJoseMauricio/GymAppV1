// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm9FP5WcXqgjJ3hiekSp8siZao2CsRTQQ",
  authDomain: "rfid-nfc-proyect.firebaseapp.com",
  databaseURL: "https://rfid-nfc-proyect-default-rtdb.firebaseio.com",
  projectId: "rfid-nfc-proyect",
  storageBucket: "rfid-nfc-proyect.appspot.com",
  messagingSenderId: "698072314986",
  appId: "1:698072314986:web:89c283646181aaef700613",
  measurementId: "G-345B2NVRX6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { app, db };