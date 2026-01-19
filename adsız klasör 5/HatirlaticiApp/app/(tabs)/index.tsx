import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';

export default function App() {
  const [note, setNote] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('2026-01-25T10:00:00');
  const [lockedNote, setLockedNote] = useState<string>('');
  const [lockedTime, setLockedTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // TİP HATASINI ÇÖZEN TANIM:
    let sayac: any = null;

    if (isActive && lockedTime !== null) {
      // window.setInterval kullanarak TypeScript hatasını bypass ediyoruz
      sayac = window.setInterval(() => {
        const simdi = new Date().getTime();
        const fark = lockedTime - simdi;

        if (fark <= 0) {
          if (sayac) clearInterval(sayac);
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

    return () => {
      if (sayac) clearInterval(sayac);
    };
  }, [isActive, lockedTime, lockedNote]);

  const handleStart = () => {
    const hedef = new Date(targetDate).getTime();
    const suan = new Date().getTime();

    if (!note.trim()) {
      Alert.alert("Hata", "Mesaj yazmalısın!");
      return;
    }
    if (isNaN(hedef) || hedef <= suan) {
      Alert.alert("Hata", "İleri bir tarih gir!");
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
    
    const hh = h < 10 ? `0${h}` : h;
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    
    return `${d}g ${hh}:${mm}:${ss}`;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.fullScreen}>
        {!isActive ? (
          <ScrollView contentContainerStyle={styles.setupBox}>
            <Text style={styles.title}>Gizli Not Zamanlayıcı</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>MESAJIN</Text>
              <TextInput
                style={styles.input}
                placeholder="Buraya yaz..."
                placeholderTextColor="#333"
                value={note}
                onChangeText={setNote}
                multiline={true}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TARIH (YYYY-MM-DDTHH:MM:SS)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-01-25T12:00:00"
                placeholderTextColor="#333"
                value={targetDate}
                onChangeText={setTargetDate}
              />
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.btnText}>MÜHÜRLE VE KİLİTLE</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.blackScreen}>
            <Text style={styles.timerLabel}>MESAJ GİZLENDİ</Text>
            <Text style={styles.bigTimer}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity 
              style={styles.hiddenCancel} 
              onLongPress={() => { setIsActive(false); setLockedTime(null); }}
            >
              <Text style={styles.cancelHint}>İptal için basılı tut</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#000' },
  setupBox: { padding: 30, paddingTop: 100 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  input: { backgroundColor: '#0A0A0A', color: '#fff', padding: 18, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#222' },
  startBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  blackScreen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  timerLabel: { color: '#111', fontSize: 14, fontWeight: 'bold', letterSpacing: 4, marginBottom: 20 },
  bigTimer: { color: '#fff', fontSize: 45, fontWeight: '200' },
  hiddenCancel: { marginTop: 100, padding: 20 },
  cancelHint: { color: '#050505', fontSize: 12 }
});