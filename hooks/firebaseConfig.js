import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Giriş ve Kayıt sistemi için bu lazım

const firebaseConfig = {
  apiKey: "AIzaSyCwV0El0CE1x07eHR-jfqkZ02Mf95quZiE",
  authDomain: "hatirlaticiapp-defb0.firebaseapp.com",
  projectId: "hatirlaticiapp-defb0",
  storageBucket: "hatirlaticiapp-defb0.firebasestorage.app",
  messagingSenderId: "533061427544",
  appId: "1:533061427544:web:52aa6a47f17af69210852d",
  measurementId: "G-Z0VQLF4VF0"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Giriş/Kayıt (Auth) özelliğini dışarı aktar
export const auth = getAuth(app);