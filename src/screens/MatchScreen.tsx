import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '../types';
import { useSession } from '../hooks/useSession';
import StarRating from '../components/StarRating';
import CalendarModal from '../components/CalendarModal';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Match'>;
  route: RouteProp<RootStackParamList, 'Match'>;
};

export default function MatchScreen({ navigation, route }: Props) {
  const { sessionId, userId, matchedPlaceId } = route.params;
  const { session } = useSession(sessionId);
  const [showCalendar, setShowCalendar] = useState(false);

  const restaurant = session?.restaurants[matchedPlaceId];

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text>Loading match details…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={['#FF6B35', '#FF8C5A']} style={styles.banner}>
          <Text style={styles.bannerEmoji}>🎉</Text>
          <Text style={styles.bannerTitle}>Everyone agrees!</Text>
          <Text style={styles.bannerSubtitle}>{restaurant.name}</Text>
        </LinearGradient>

        {restaurant.photos[0] && (
          <Image source={{ uri: restaurant.photos[0] }} style={styles.heroPhoto} />
        )}

        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <View style={styles.ratingRow}>
            <StarRating rating={restaurant.rating} size={20} />
            <Text style={styles.ratingText}>
              {restaurant.rating.toFixed(1)} · {restaurant.userRatingsTotal.toLocaleString()} reviews
            </Text>
          </View>

          {restaurant.openNow != null && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: restaurant.openNow ? '#2ECC71' : '#E74C3C' }]} />
              <Text style={[styles.statusText, { color: restaurant.openNow ? '#2ECC71' : '#E74C3C' }]}>
                {restaurant.openNow ? 'Open Now' : 'Currently Closed'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => navigation.navigate('MapView', { restaurant })}
          >
            <Ionicons name="location-outline" size={18} color="#FF6B35" />
            <Text style={styles.addressText}>{restaurant.address}</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          {restaurant.phoneNumber && (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => Linking.openURL(`tel:${restaurant.phoneNumber}`)}
            >
              <Ionicons name="call-outline" size={18} color="#FF6B35" />
              <Text style={styles.addressText}>{restaurant.phoneNumber}</Text>
            </TouchableOpacity>
          )}

          {restaurant.website && (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => Linking.openURL(restaurant.website!)}
            >
              <Ionicons name="globe-outline" size={18} color="#FF6B35" />
              <Text style={[styles.addressText, styles.link]} numberOfLines={1}>
                {restaurant.website.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('MapView', { restaurant })}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
            <Text style={styles.secondaryBtnText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.replace('Swipe', { sessionId, userId })}
          >
            <Text style={styles.ghostBtnText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        {restaurant.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {restaurant.reviews.map((review, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <StarRating rating={review.rating} size={13} />
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        restaurant={restaurant}
        onClose={() => setShowCalendar(false)}
        onSuccess={() => {
          setShowCalendar(false);
          Alert.alert('Added!', 'Restaurant appointment added to your calendar.');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  bannerEmoji: { fontSize: 48 },
  bannerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  bannerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  heroPhoto: {
    width: '100%',
    height: 220,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  link: {
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryBtnText: { color: '#FF6B35', fontSize: 16, fontWeight: '700' },
  ghostBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  ghostBtnText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  reviewsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#333' },
  reviewText: { fontSize: 14, color: '#666', lineHeight: 20 },
});
