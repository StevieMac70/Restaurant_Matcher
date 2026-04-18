import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { RootStackParamList } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useLocation } from '../hooks/useLocation';
import { createSession, joinSession, publishSessionCode } from '../services/sessionService';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Welcome'> };

const NAME_KEY = '@restaurant_matcher_name';
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function WelcomeScreen({ navigation }: Props) {
  const { firebaseUid } = useAppContext();
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [loading, setLoading] = useState(false);

  const { coordinates, error: locationError, loading: locationLoading } = useLocation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to continue.');
      return;
    }
    if (!firebaseUid) {
      Alert.alert('Not ready', 'Connecting to servers… please try again in a moment.');
      return;
    }
    if (!coordinates) {
      Alert.alert(
        'Location required',
        locationError ?? 'Could not get your location. Check Location permissions in Settings.',
      );
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(NAME_KEY, name.trim());
      const session = await createSession(firebaseUid, name.trim(), {
        radius: 1600,
        location: coordinates,
      });
      await publishSessionCode(session.id, session.code);
      navigation.navigate('Lobby', { sessionId: session.id, userId: firebaseUid });
    } catch {
      Alert.alert(
        'Connection error',
        'Could not create session. Check your internet connection and Firebase configuration.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to continue.');
      return;
    }
    if (!sessionCode.trim()) {
      Alert.alert('Code required', 'Please enter the 6-character session code.');
      return;
    }
    if (!firebaseUid) {
      Alert.alert('Not ready', 'Connecting to servers… please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(NAME_KEY, name.trim());
      const session = await joinSession(
        sessionCode.trim().toUpperCase(),
        firebaseUid,
        name.trim(),
      );
      if (!session) {
        Alert.alert('Not found', 'No session found with that code. Double-check and try again.');
        return;
      }
      navigation.navigate('Lobby', { sessionId: session.id, userId: firebaseUid });
    } catch {
      Alert.alert('Connection error', 'Could not join session. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isConnecting = !firebaseUid;

  return (
    <LinearGradient colors={['#FF6B35', '#FF8C5A', '#FFB347']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="restaurant" size={52} color="#FF6B35" />
              </View>
              <Text style={styles.appName}>Restaurant Matcher</Text>
              <Text style={styles.tagline}>Swipe. Match. Eat together.</Text>
            </View>

            {/* Connection indicator */}
            {isConnecting && (
              <View style={styles.connectingBanner}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.connectingText}>Connecting…</Text>
              </View>
            )}

            {/* Main card */}
            <View style={styles.card}>
              {mode === 'home' && (
                <>
                  <Text style={styles.cardTitle}>Get Started</Text>
                  <Text style={styles.cardSubtitle}>
                    Create a session and invite friends, or join one with a code.
                  </Text>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isConnecting && styles.btnDisabled]}
                    onPress={() => setMode('create')}
                    disabled={isConnecting}
                  >
                    <Ionicons name="add-circle-outline" size={22} color="#fff" />
                    <Text style={styles.primaryBtnText}>Create Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, isConnecting && styles.btnDisabled]}
                    onPress={() => setMode('join')}
                    disabled={isConnecting}
                  >
                    <Ionicons name="enter-outline" size={22} color="#FF6B35" />
                    <Text style={styles.secondaryBtnText}>Join with Code</Text>
                  </TouchableOpacity>
                </>
              )}

              {(mode === 'create' || mode === 'join') && (
                <>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setMode('home')}>
                    <Ionicons name="arrow-back" size={20} color="#FF6B35" />
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.cardTitle}>
                    {mode === 'create' ? 'Create Session' : 'Join Session'}
                  </Text>

                  <Text style={styles.inputLabel}>Your Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#bbb"
                    autoCapitalize="words"
                    returnKeyType={mode === 'create' ? 'done' : 'next'}
                    maxLength={40}
                  />

                  {mode === 'join' && (
                    <>
                      <Text style={styles.inputLabel}>Session Code</Text>
                      <TextInput
                        style={[styles.input, styles.codeInput]}
                        value={sessionCode}
                        onChangeText={setSessionCode}
                        placeholder="ABC123"
                        placeholderTextColor="#bbb"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={8}
                        returnKeyType="done"
                        onSubmitEditing={handleJoin}
                      />
                    </>
                  )}

                  {mode === 'create' && locationLoading && (
                    <View style={styles.statusRow}>
                      <ActivityIndicator size="small" color="#FF6B35" />
                      <Text style={styles.statusText}>Getting your location…</Text>
                    </View>
                  )}

                  {mode === 'create' && coordinates && (
                    <View style={styles.statusRow}>
                      <Ionicons name="location" size={16} color="#2ECC71" />
                      <Text style={[styles.statusText, { color: '#2ECC71' }]}>Location ready</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryBtn, (loading || isConnecting) && styles.btnDisabled]}
                    onPress={mode === 'create' ? handleCreate : handleJoin}
                    disabled={loading || isConnecting}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name={mode === 'create' ? 'rocket-outline' : 'enter-outline'}
                          size={22}
                          color="#fff"
                        />
                        <Text style={styles.primaryBtnText}>
                          {mode === 'create' ? 'Create & Continue' : 'Join Session'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* How it works */}
            <View style={styles.steps}>
              {[
                { icon: 'people-outline', text: 'Invite friends with a 6-character code' },
                { icon: 'hand-left-outline', text: 'Swipe LEFT ✓ to like · RIGHT ✗ to skip' },
                { icon: 'heart-outline', text: 'Match when everyone votes YES!' },
                { icon: 'calendar-outline', text: 'Book a time · Add to your calendar' },
              ].map((s, i) => (
                <View key={i} style={styles.step}>
                  <Ionicons name={s.icon as any} size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.stepText}>{s.text}</Text>
                </View>
              ))}
            </View>

            {/* Footer links */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>·</Text>
              <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  connectingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  connectingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  codeInput: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.5, elevation: 0, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  secondaryBtnText: { color: '#FF6B35', fontSize: 17, fontWeight: '700' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backBtnText: { color: '#FF6B35', fontWeight: '600', fontSize: 15 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusText: { fontSize: 14, color: '#999', fontWeight: '500' },
  steps: { gap: 12, marginBottom: 24 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  footerDot: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  footerVersion: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
});
