import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types';
import { useLocation } from '../hooks/useLocation';
import { createSession, joinSession, publishSessionCode } from '../services/sessionService';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Welcome'> };

const USER_KEY = '@restaurant_matcher_user';

async function getOrCreateUserId(): Promise<string> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    return parsed.id as string;
  }
  const id = uuidv4();
  return id;
}

async function saveUserId(id: string, name: string) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify({ id, name }));
}

export default function WelcomeScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [loading, setLoading] = useState(false);

  const { coordinates, error: locationError, loading: locationLoading } = useLocation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!coordinates) {
      Alert.alert('Location required', locationError ?? 'Could not get your location.');
      return;
    }

    setLoading(true);
    try {
      const userId = await getOrCreateUserId();
      await saveUserId(userId, name.trim());

      const session = await createSession(userId, name.trim(), {
        radius: 1600,
        location: coordinates,
      });
      await publishSessionCode(session.id, session.code);

      navigation.navigate('Lobby', { sessionId: session.id, userId });
    } catch (err) {
      Alert.alert('Error', 'Could not create session. Check your Firebase config.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!sessionCode.trim()) {
      Alert.alert('Code required', 'Please enter the session code.');
      return;
    }

    setLoading(true);
    try {
      const userId = await getOrCreateUserId();
      await saveUserId(userId, name.trim());

      const session = await joinSession(sessionCode.trim().toUpperCase(), userId, name.trim());
      if (!session) {
        Alert.alert('Not found', 'No session found with that code. Double-check and try again.');
        return;
      }

      navigation.navigate('Lobby', { sessionId: session.id, userId });
    } catch (err) {
      Alert.alert('Error', 'Could not join session. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

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

            {/* Card */}
            <View style={styles.card}>
              {mode === 'home' && (
                <>
                  <Text style={styles.cardTitle}>Get Started</Text>
                  <Text style={styles.cardSubtitle}>
                    Create a session and invite friends, or join one with a code.
                  </Text>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setMode('create')}>
                    <Ionicons name="add-circle-outline" size={22} color="#fff" />
                    <Text style={styles.primaryBtnText}>Create Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('join')}>
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
                    returnKeyType="next"
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
                      />
                    </>
                  )}

                  {mode === 'create' && locationLoading && (
                    <View style={styles.locationRow}>
                      <ActivityIndicator size="small" color="#FF6B35" />
                      <Text style={styles.locationText}>Getting your location…</Text>
                    </View>
                  )}

                  {mode === 'create' && coordinates && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={16} color="#2ECC71" />
                      <Text style={[styles.locationText, { color: '#2ECC71' }]}>
                        Location ready
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.btnDisabled]}
                    onPress={mode === 'create' ? handleCreate : handleJoin}
                    disabled={loading}
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

            {/* Instructions */}
            <View style={styles.steps}>
              {[
                { icon: 'people-outline', text: 'Invite friends with a 6-char code' },
                { icon: 'hand-left-outline', text: 'Swipe LEFT ✓ to like, RIGHT ✗ to skip' },
                { icon: 'heart-outline', text: 'Match when everyone agrees!' },
                { icon: 'calendar-outline', text: 'Book a time & add to calendar' },
              ].map((s, i) => (
                <View key={i} style={styles.step}>
                  <Ionicons name={s.icon as any} size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.stepText}>{s.text}</Text>
                </View>
              ))}
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
    marginBottom: 32,
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
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
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
  secondaryBtnText: {
    color: '#FF6B35',
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backBtnText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  steps: {
    gap: 12,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
