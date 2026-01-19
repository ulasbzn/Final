import React, { useEffect, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View
} from 'react-native';

// FIREBASE ARAÇLARI
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../../hooks/firebaseConfig';

export default function App() {
  // --- STATE TANIMLAMALARI ---
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [note, setNote] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('2026-01-25T10:00:00');
  const [lockedNote, setLockedNote] = useState<string>('');
  const [lockedTime, setLockedTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // --- OTURUM KONTROLÜ ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as any, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- KAYIT VE MAİL GÖNDERME ---
  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre girin.");
      return;
    }
    createUserWithEmailAndPassword(auth as any, email, password)
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            Alert.alert("Onay Yollandı ✅", "Mail kutunu kontrol et.");
            signOut(auth as any);
          });
      })
      .catch((error: any) => Alert.alert("Hata", error.message));
  };

  // --- GİRİŞ YAPMA ---
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Hata", "Alanları doldur.");
      return;
    }
    signInWithEmailAndPassword(auth as any, email, password)
      .then((userCredential) => {
        if (userCredential.user.emailVerified) {
          setUser(userCredential.user);
        } else {
          Alert.alert("Onay Gerekli ⚠️", "Önce mailindeki linke tıkla.");
          signOut(auth as any);
        }
      })
      .catch((error: any) => Alert.alert("Hata", "Giriş başarısız."));
  };

  // --- GERİ SAYIM ---
  useEffect(() => {
    let sayac: any = null;
    if (isActive && lockedTime !== null) {
      sayac = setInterval(() => {
        const simdi = new Date().getTime();
        const fark = (lockedTime as number) - simdi;

        if (fark <= 0) {
          clearInterval(sayac);
          setIsActive(false);
          if (Platform.OS !== 'web') Vibration.vibrate([500, 500, 500]);
          Alert.alert("🚨 MESAJ AÇILDI!", lockedNote);
          setLockedNote('');
          setLockedTime(null);
        } else {
          setTimeLeft(fark);
        }
      }, 1000);
    }
    return () => { if (sayac) clearInterval(sayac); };
  }, [isActive, lockedTime, lockedNote]);

  const handleStart = () => {
    const hedef = new Date(targetDate).getTime();
    if (!note.trim() || isNaN(hedef)) {
      Alert.alert("Hata", "Not yaz ve tarih gir.");
      return;
    }
    setLockedNote(note);
    setLockedTime(hedef);
    setNote('');
    Keyboard.dismiss();
    setIsActive(true);
  };

  const formatTime = (ms: number): string => {
    if (!ms || ms < 0) return "00g 00:00:00";
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / 1000 / 60) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${d}g ${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  };

  // --- GÖRÜNÜM ---
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.cyberTitle}>CYBER REMINDER</Text>
        <TextInput style={styles.input} placeholder="E-posta" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#666" value={password} secureTextEntry onChangeText={setPassword} />
        <TouchableOpacity style={styles.neonBtn} onPress={handleLogin}>
          <Text style={styles.neonBtnText}>GİRİŞ YAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.neonBtn, {borderColor: '#ff00ff', marginTop: 15}]} onPress={handleSignUp}>
          <Text style={[styles.neonBtnText, {color: '#ff00ff'}]}>HESAP OLUŞTUR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.fullScreen}>
        {!isActive ? (
          <ScrollView contentContainerStyle={styles.setupBox}>
            <TouchableOpacity onPress={() => signOut(auth as any)} style={{alignSelf: 'flex-end'}}>
                <Text style={{color: '#ff4444', fontWeight: 'bold'}}>Çıkış Yap</Text>
            </TouchableOpacity>
            <Text style={styles.cyberTitle}>SET TIME</Text>
            <TextInput style={[styles.input, {height: 80}]} placeholder="Notun..." placeholderTextColor="#666" value={note} onChangeText={setNote} multiline />
            <TextInput style={styles.input} placeholder="YYYY-MM-DDTHH:MM:SS" placeholderTextColor="#666" value={targetDate} onChangeText={setTargetDate} />
            <TouchableOpacity style={styles.neonBtn} onPress={handleStart}>
              <Text style={styles.neonBtnText}>CREATE</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.blackScreen}>
            {/* KRONOMETRE EKRANINA EKLENEN ÇIKIŞ BUTONU */}
            <TouchableOpacity 
              onPress={() => {
                setIsActive(false); 
                setLockedTime(null);
              }} 
              style={styles.exitButton}
            >
              <Text style={{color: '#ff4444', fontWeight: 'bold'}}>Çıkış Yap</Text>
            </TouchableOpacity>

            <Text style={styles.timerLabel}>KİLİTLENDİ</Text>
            <Text style={styles.bigTimer}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity style={styles.hiddenCancel} onLongPress={() => { setIsActive(false); setLockedTime(null); }}>
              <Text style={styles.cancelHint}>İptal (Basılı tut)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 30 },
  fullScreen: { flex: 1, backgroundColor: '#000' },
  setupBox: { padding: 30, paddingTop: 60 },
  cyberTitle: { color: '#00ffff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  input: { backgroundColor: '#0A0A0A', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  neonBtn: { 
    backgroundColor: 'transparent', padding: 15, borderRadius: 10, alignItems: 'center', 
    borderWidth: 2, borderColor: '#00ffff'
  },
  neonBtnText: { color: '#00ffff', fontWeight: 'bold', letterSpacing: 1 },
  blackScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  exitButton: { position: 'absolute', top: 60, right: 30 },
  timerLabel: { color: '#00ffff', letterSpacing: 2, marginBottom: 10 },
  bigTimer: { color: '#fff', fontSize: 40, fontWeight: '200' },
  hiddenCancel: { marginTop: 50 },
  cancelHint: { color: '#111' }
});