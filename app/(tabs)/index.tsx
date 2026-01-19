import React, { useEffect, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View
} from 'react-native';

// FIREBASE BAĞLANTISI VE ARAÇLAR
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('2026-01-25T10:00:00');
  const [lockedNote, setLockedNote] = useState<string>('');
  const [lockedTime, setLockedTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // --- OTURUM KONTROLÜ ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          setUser(currentUser);
        } else {
          // Onaylanmamışsa içeri alma
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- KAYIT OL VE LİNK GÖNDER ---
  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre girin.");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            Alert.alert("Onay Linki Yollandı!", "Mailini kontrol et ve linke tıkla, sonra giriş yap.");
            signOut(auth);
          });
      })
      .catch((error: any) => Alert.alert("Hata", error.message));
  };

  // --- GİRİŞ YAP ---
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Hata", "Alanları doldur.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (userCredential.user.emailVerified) {
          setUser(userCredential.user);
        } else {
          Alert.alert("Onay Gerekli", "Önce mailindeki linke tıklayıp hesabını onayla.");
          signOut(auth);
        }
      })
      .catch((error: any) => Alert.alert("Hata", "Giriş yapılamadı."));
  };

  // --- GERİ SAYIM SAYACI ---
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
    const suan = new Date().getTime();
    if (!note.trim()) { Alert.alert("Hata", "Mesaj yaz!"); return; }
    if (isNaN(hedef) || hedef <= suan) { Alert.alert("Hata", "Gelecek bir tarih gir!"); return; }
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

  // --- EKRAN GÖRÜNÜMLERİ ---
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <TextInput style={styles.input} placeholder="E-posta" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#666" value={password} secureTextEntry onChangeText={setPassword} />
        <TouchableOpacity style={styles.startBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>GİRİŞ YAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.startBtn, {backgroundColor: '#111', marginTop: 15}]} onPress={handleSignUp}>
          <Text style={[styles.btnText, {color: '#fff'}]}>HESAP OLUŞTUR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.fullScreen}>
        {!isActive ? (
          <ScrollView contentContainerStyle={styles.setupBox}>
            <TouchableOpacity onPress={() => signOut(auth)} style={{alignSelf: 'flex-end'}}>
                <Text style={{color: '#ff4444', fontWeight: 'bold'}}>Çıkış Yap</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Zamanlayıcı</Text>
            <TextInput style={[styles.input, {height: 80}]} placeholder="Notun..." placeholderTextColor="#333" value={note} onChangeText={setNote} multiline />
            <TextInput style={styles.input} placeholder="YYYY-MM-DDTHH:MM:SS" placeholderTextColor="#333" value={targetDate} onChangeText={setTargetDate} />
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.btnText}>KİLİTLE</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.blackScreen}>
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
  setupBox: { padding: 30, paddingTop: 50 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  startBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' },
  blackScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  timerLabel: { color: '#444', letterSpacing: 2, marginBottom: 10 },
  bigTimer: { color: '#fff', fontSize: 40, fontWeight: '200' },
  hiddenCancel: { marginTop: 50 },
  cancelHint: { color: '#222' }
});