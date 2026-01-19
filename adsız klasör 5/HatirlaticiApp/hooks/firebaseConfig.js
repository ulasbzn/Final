import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase'den aldığın gerçek bilgiler buraya gelecek
const firebaseConfig = {
  apiKey: "BURAYA_API_KEY_GELECEK",
  authDomain: "PROJE_ADIN.firebaseapp.com",
  projectId: "PROJE_ID_BURAYA",
  storageBucket: "PROJE_ADIN.appspot.com",
  messagingSenderId: "SAYILAR_BURAYA",
  appId: "APP_ID_BURAYA"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Auth (Giriş Sistemi) özelliğini dışarı aktar
export const auth = getAuth(app);