import { getApp, getApps, initializeApp } from "firebase/app";
// Auth için gerekli özel importlar
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwV0El0CE1x07eHR-jfqkZ02Mf95quZiE",
  authDomain: "hatirlaticiapp-defb0.firebaseapp.com",
  projectId: "hatirlaticiapp-defb0",
  storageBucket: "hatirlaticiapp-defb0.firebasestorage.app",
  messagingSenderId: "533061427544",
  appId: "1:533061427544:web:52aa6a47f17af69210852d",
  measurementId: "G-Z0VQLF4VF0"
};

// 1. Firebase'i başlat (veya olanı al)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Auth'u Expo'ya özel şekilde başlat (Hata veren yerin çözümü)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});