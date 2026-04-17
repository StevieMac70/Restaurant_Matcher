import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, Session } from '../types';
import { useSession } from '../hooks/useSession';
import {
  setParticipantReady,
  startSwiping,
  updateSessionSettings,
} from '../services/sessionService';
import {
  fetchNearbyRestaurants,
  fetchMultipleRestaurants,
} from '../services/placesService';
import RadiusSelector from '../components/RadiusSelector';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Lobby'>;
  route: RouteProp<RootStackParamList, 'Lobby'>;
};

export default function LobbyScreen({ navigation, route }: Props) {
  const { sessionId, userId } = route.params;
  const { session, loading } = useSession(sessionId);
  const [isReady, setIsReady] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);

  // Navigate to swipe when host starts the session
  useEffect(() => {
    if (session?.status === 'swiping') {
      navigation.replace('Swipe', { sessionId, userId });
    }
  }, [session?.status]);

  const isHost = session?.hostId === userId;
  const participants = session ? Object.values(session.participants) : [];
  const allReady = participants.length > 1 && participants.every((p) => p.isReady || p.id === userId);

  const handleReady = async () => {
    const next = !isReady;
    setIsReady(next);
    await setParticipantReady(sessionId, userId, next);
  };

  const handleStart = async () => {
    if (!session) return;
    setLoadingStart(true);
    try {
      const placeIds = await fetchNearbyRestaurants(
        session.settings.location,
        session.settings.radius,
      );
      if (placeIds.length === 0) {
        Alert.alert('No Restaurants', 'No restaurants found in this area. Try a larger radius.');
        return;
      }
      // Fetch details for up to 20 restaurants
      const limited = placeIds.slice(0, 20);
      const restaurants = await fetchMultipleRestaurants(limited);
      const restaurantMap = Object.fromEntries(restaurants.map((r) => [r.placeId, r]));
      await startSwiping(sessionId, limited, restaurantMap);
    } catch (err) {
      Alert.alert('Error', 'Could not load restaurants. Check your Google Places API key.');
    } finally {
      setLoadingStart(false);
    }
  };

  const handleShare = async () => {
    if (!session) return;
    try {
      await Share.share({
        message: `Join my Restaurant Matcher session!\nCode: ${session.code}\n\nDownload the app to start swiping 🍽️`,
        title: 'Restaurant Matcher Invite',
      });
    } catch {}
  };

  const handleCopyCode = async () => {
    if (!session) return;
    await Clipboard.setStringAsync(session.code);
    Alert.alert('Copied!', `Session code ${session.code} copied to clipboard.`);
  };

  const handleRadiusChange = async (meters: number) => {
    if (!isHost || !session) return;
    await updateSessionSettings(sessionId, { radius: meters });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Session not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Session code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Session Code</Text>
          <Text style={styles.code}>{session.code}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeBtn} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={18} color="#FF6B35" />
              <Text style={styles.codeBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.codeBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#FF6B35" />
              <Text style={styles.codeBtnText}>Invite</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeHint}>Share this code with friends to join your session</Text>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participants ({participants.length})
          </Text>
          {participants.map((p) => (
            <View key={p.id} style={styles.participantRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.participantName}>
                {p.name}{p.id === userId ? ' (You)' : ''}
                {p.id === session.hostId ? ' 👑' : ''}
              </Text>
              <View style={[styles.readyBadge, p.isReady && styles.readyBadgeOn]}>
                <Text style={[styles.readyText, p.isReady && styles.readyTextOn]}>
                  {p.isReady ? 'Ready' : 'Waiting'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Radius (host only) */}
        {isHost && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Settings</Text>
            <RadiusSelector
              value={session.settings.radius}
              onChange={handleRadiusChange}
            />
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FF6B35" />
              <Text style={styles.locationText}>
                {session.settings.location.latitude.toFixed(4)},{' '}
                {session.settings.location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        {!isHost && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>
              The host controls radius and will start the session.
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="radio-outline" size={16} color="#666" />
              <Text style={styles.locationText}>
                Search radius:{' '}
                {session.settings.radius >= 1000
                  ? `${(session.settings.radius / 1000).toFixed(1)} km`
                  : `${session.settings.radius} m`}
              </Text>
            </View>
          </View>
        )}

        {/* Ready / Start buttons */}
        {!isHost && (
          <TouchableOpacity
            style={[styles.primaryBtn, isReady && styles.readyActiveBtn]}
            onPress={handleReady}
          >
            <Ionicons name={isReady ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>{isReady ? "I'm Ready!" : 'Mark as Ready'}</Text>
          </TouchableOpacity>
        )}

        {isHost && (
          <TouchableOpacity
            style={[styles.primaryBtn, (!allReady || loadingStart) && styles.btnDisabled]}
            onPress={handleStart}
            disabled={!allReady || loadingStart}
          >
            {loadingStart ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={22} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {allReady ? 'Start Matching!' : 'Waiting for everyone…'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#999' },
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  code: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FF6B35',
    letterSpacing: 8,
    marginBottom: 16,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
  },
  codeBtnText: {
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 14,
  },
  codeHint: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  participantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  readyBadgeOn: {
    backgroundColor: '#E8F8F0',
  },
  readyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
  },
  readyTextOn: {
    color: '#2ECC71',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#888',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  readyActiveBtn: {
    backgroundColor: '#2ECC71',
    shadowColor: '#2ECC71',
  },
  btnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
