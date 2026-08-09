import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG2T-TnsHoVMABkLBWrMU5XJ2CQDoBxGE",
  authDomain: "hirafy-bc3b0.firebaseapp.com",
  projectId: "hirafy-bc3b0",
  storageBucket: "hirafy-bc3b0.firebasestorage.app",
  messagingSenderId: "319111054349",
  appId: "1:319111054349:web:e21379ea386942d5bb0144"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
