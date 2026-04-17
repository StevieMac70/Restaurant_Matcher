import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList, Restaurant } from '../types';
import { useSession } from '../hooks/useSession';
import { castVote, resetToSwiping } from '../services/sessionService';
import SwipeCard from '../components/SwipeCard';
import RestaurantCard from '../components/RestaurantCard';
import MatchModal from '../components/MatchModal';
import CalendarModal from '../components/CalendarModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Swipe'>;
  route: RouteProp<RootStackParamList, 'Swipe'>;
};

export default function SwipeScreen({ navigation, route }: Props) {
  const { sessionId, userId } = route.params;
  const { session, loading } = useSession(sessionId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPlaceId, setMatchedPlaceId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [votedPlaceIds, setVotedPlaceIds] = useState<Set<string>>(new Set());

  // Track newly detected matches
  useEffect(() => {
    if (!session) return;
    const matches = session.matches ?? [];
    if (matches.length > 0 && !showMatch) {
      const latestMatch = matches[matches.length - 1];
      setMatchedPlaceId(latestMatch);
      setShowMatch(true);
    }
  }, [session?.matches?.length]);

  const restaurantQueue = session?.restaurantQueue ?? [];
  const restaurants = session?.restaurants ?? {};

  // Filter out already-voted restaurants
  const unvotedQueue = restaurantQueue.filter((id) => !votedPlaceIds.has(id));
  const currentRestaurant: Restaurant | null =
    unvotedQueue[0] ? restaurants[unvotedQueue[0]] ?? null : null;
  const nextRestaurant: Restaurant | null =
    unvotedQueue[1] ? restaurants[unvotedQueue[1]] ?? null : null;

  const handleVote = useCallback(
    async (placeId: string, vote: 'yes' | 'no') => {
      setVotedPlaceIds((prev) => new Set([...prev, placeId]));
      try {
        await castVote(sessionId, userId, placeId, vote);
      } catch {
        // vote is tracked locally even if network fails
      }
    },
    [sessionId, userId],
  );

  const handleMatchContinue = async () => {
    setShowMatch(false);
    if (session?.status === 'matched') {
      await resetToSwiping(sessionId);
    }
  };

  const handleViewMap = () => {
    if (!matchedPlaceId || !session) return;
    const restaurant = session.restaurants[matchedPlaceId];
    if (restaurant) {
      setShowMatch(false);
      navigation.navigate('MapView', { restaurant });
    }
  };

  const handleMapFromCard = () => {
    if (!currentRestaurant) return;
    navigation.navigate('MapView', { restaurant: currentRestaurant });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const matchedRestaurant = matchedPlaceId ? session?.restaurants[matchedPlaceId] ?? null : null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        {/* Header stats */}
        <View style={styles.header}>
          <View style={styles.headerStat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.headerStatText}>
              {Object.keys(session?.participants ?? {}).length} people
            </Text>
          </View>
          <View style={styles.headerStat}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <Text style={styles.headerStatText}>
              {unvotedQueue.length} left
            </Text>
          </View>
          <View style={styles.headerStat}>
            <Ionicons name="heart-outline" size={16} color="#E74C3C" />
            <Text style={styles.headerStatText}>
              {session?.matches?.length ?? 0} matches
            </Text>
          </View>
        </View>

        {/* Card stack area */}
        <View style={styles.cardArea}>
          {unvotedQueue.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>All done!</Text>
              <Text style={styles.emptySubtitle}>
                You've voted on all available restaurants.
                {(session?.matches?.length ?? 0) > 0
                  ? ` You matched on ${session!.matches.length} place(s)!`
                  : ' No matches yet — your group disagreed on everything.'}
              </Text>
            </View>
          ) : (
            <>
              {/* Background card (next) */}
              {nextRestaurant && (
                <View style={[styles.backgroundCard, styles.cardWrapper]}>
                  <View style={styles.cardInner}>
                    <RestaurantCard restaurant={nextRestaurant} />
                  </View>
                </View>
              )}

              {/* Top card (current) */}
              {currentRestaurant && (
                <View style={styles.cardWrapper}>
                  <SwipeCard
                    isTop
                    onSwipeLeft={() => handleVote(currentRestaurant.placeId, 'yes')}
                    onSwipeRight={() => handleVote(currentRestaurant.placeId, 'no')}
                  >
                    <RestaurantCard
                      restaurant={currentRestaurant}
                      onMapPress={handleMapFromCard}
                    />
                  </SwipeCard>
                </View>
              )}
            </>
          )}
        </View>

        {/* Action buttons */}
        {currentRestaurant && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.noBtn]}
              onPress={() => handleVote(currentRestaurant.placeId, 'no')}
            >
              <Ionicons name="close" size={32} color="#E74C3C" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapBtn}
              onPress={handleMapFromCard}
            >
              <Ionicons name="map-outline" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.yesBtn]}
              onPress={() => handleVote(currentRestaurant.placeId, 'yes')}
            >
              <Ionicons name="checkmark" size={32} color="#2ECC71" />
            </TouchableOpacity>
          </View>
        )}

        {/* Swipe hint */}
        {currentRestaurant && (
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>← Swipe left to LIKE  ·  Swipe right to SKIP →</Text>
          </View>
        )}

        {/* Match modal */}
        <MatchModal
          visible={showMatch}
          restaurant={matchedRestaurant}
          onAddToCalendar={() => {
            setShowMatch(false);
            setShowCalendar(true);
          }}
          onViewMap={handleViewMap}
          onContinue={handleMatchContinue}
        />

        {/* Calendar modal */}
        <CalendarModal
          visible={showCalendar}
          restaurant={matchedRestaurant}
          onClose={() => setShowCalendar(false)}
          onSuccess={() => {
            setShowCalendar(false);
            Alert.alert('Added!', 'Restaurant appointment added to your calendar.');
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F2F2F2' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardWrapper: {
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
  },
  backgroundCard: {
    position: 'absolute',
    transform: [{ scale: 0.96 }, { translateY: 8 }],
    opacity: 0.85,
  },
  cardInner: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 40,
    gap: 24,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  noBtn: {
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  yesBtn: {
    borderWidth: 2,
    borderColor: '#2ECC71',
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hintRow: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '500',
  },
});
