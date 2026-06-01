import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrmZtB5-Vp3_TYSw7oZRGhfnGTpwH6kKM",
  authDomain: "cadeiras-app.firebaseapp.com",
  projectId: "cadeiras-app",
  storageBucket: "cadeiras-app.appspot.com",
  messagingSenderId: "405009687204",
  appId: "1:405009687204:web:5d810bc66ef7f2c04dbc31"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
