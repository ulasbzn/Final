import React, { useEffect, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View
} from 'react-native';

// FIREBASE BAĞLANTISI (Doğru yol ayarlandı)
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../../hooks/firebaseConfig';

export default function App() {
  // --- KULLANICI DURUMU ---
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- ZAMANLAYICI DURUMLARI ---
  const [note, setNote] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('2026-01-25T10:00:00');
  const [lockedNote, setLockedNote] = useState<string>('');
  const [lockedTime, setLockedTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Uygulama açıldığında giriş yapılmış mı kontrol et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // KAYIT OLMA
  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => Alert.alert("Başarılı", "Hesabınız oluşturuldu!"))
      .catch((error: any) => Alert.alert("Kayıt Hatası", error.message));
  };

  // GİRİŞ YAPMA
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => console.log("Giriş başarılı"))
      .catch((error: any) => Alert.alert("Giriş Hatası", error.message));
  };

  // GERİ SAYIM MANTIĞI
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
    if (!note.trim()) { Alert.alert("Hata", "Mesaj yazmalısın!"); return; }
    if (isNaN(hedef) || hedef <= suan) { Alert.alert("Hata", "İleri bir tarih gir!"); return; }
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

  // --- EKRANLAR ---

  // 1. GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK EKRAN (Auth)
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <TextInput 
          style={styles.input} 
          placeholder="E-posta" 
          placeholderTextColor="#666" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Şifre" 
          placeholderTextColor="#666" 
          value={password} 
          secureTextEntry 
          onChangeText={setPassword} 
        />
        <TouchableOpacity style={styles.startBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>GİRİŞ YAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.startBtn, {backgroundColor: '#111', marginTop: 15, borderWidth: 1, borderColor: '#333'}]} onPress={handleSignUp}>
          <Text style={[styles.btnText, {color: '#fff'}]}>HESAP OLUŞTUR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. GİRİŞ YAPILMIŞSA GÖSTERİLECEK ANA EKRAN
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.fullScreen}>
        {!isActive ? (
          <ScrollView contentContainerStyle={styles.setupBox}>
            <TouchableOpacity onPress={() => signOut(auth)} style={{alignSelf: 'flex-end'}}>
                <Text style={{color: '#ff4444', fontWeight: 'bold', marginBottom: 20}}>Çıkış Yap</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Gizli Not Zamanlayıcı</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>MESAJINIZ</Text>
              <TextInput 
                style={[styles.input, {height: 100}]} 
                placeholder="Kilitlemek istediğiniz notu yazın..." 
                placeholderTextColor="#333" 
                value={note} 
                onChangeText={setNote} 
                multiline={true} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>AÇILIŞ TARİHİ (YYYY-MM-DDTHH:MM:SS)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="2026-01-25T12:00:00" 
                placeholderTextColor="#333" 
                value={targetDate} 
                onChangeText={setTargetDate} 
              />
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.btnText}>NOTU ZAMANA MÜHÜRLE</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.blackScreen}>
            <Text style={styles.timerLabel}>NOT KİLİTLENDİ</Text>
            <Text style={styles.bigTimer}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity style={styles.hiddenCancel} onLongPress={() => { setIsActive(false); setLockedTime(null); }}>
              <Text style={styles.cancelHint}>İptal etmek için basılı tutun</Text>
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
  setupBox: { padding: 30, paddingTop: 40 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  input: { backgroundColor: '#0A0A0A', color: '#fff', padding: 18, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#222', marginBottom: 10 },
  startBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  blackScreen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  timerLabel: { color: '#333', fontSize: 14, fontWeight: 'bold', letterSpacing: 4, marginBottom: 20 },
  bigTimer: { color: '#fff', fontSize: 45, fontWeight: '200' },
  hiddenCancel: { marginTop: 100, padding: 20 },
  cancelHint: { color: '#111', fontSize: 12 }
});