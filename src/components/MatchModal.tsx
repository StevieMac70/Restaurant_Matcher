import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';

const { width } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  restaurant: Restaurant | null;
  onAddToCalendar: () => void;
  onViewMap: () => void;
  onContinue: () => void;
}

export default function MatchModal({
  visible,
  restaurant,
  onAddToCalendar,
  onViewMap,
  onContinue,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!restaurant) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.container, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C5A']}
            style={styles.header}
          >
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>Everyone agrees on…</Text>
          </LinearGradient>

          {restaurant.photos[0] ? (
            <Image source={{ uri: restaurant.photos[0] }} style={styles.restaurantPhoto} />
          ) : (
            <View style={[styles.restaurantPhoto, styles.noPhoto]}>
              <Ionicons name="restaurant" size={60} color="#ccc" />
            </View>
          )}

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantAddress} numberOfLines={2}>{restaurant.address}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F39C12" />
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)} · {restaurant.userRatingsTotal.toLocaleString()} reviews
              </Text>
              {restaurant.openNow != null && (
                <Text style={[styles.openBadge, { color: restaurant.openNow ? '#2ECC71' : '#E74C3C' }]}>
                  {restaurant.openNow ? '● Open' : '● Closed'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onViewMap}>
              <Ionicons name="map" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>View Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.calendarBtn]} onPress={onAddToCalendar}>
              <Ionicons name="calendar" size={22} color="#FF6B35" />
              <Text style={[styles.actionBtnText, { color: '#FF6B35' }]}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueBtnText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  matchEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  matchSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  restaurantPhoto: {
    width: '100%',
    height: 180,
  },
  noPhoto: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantInfo: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  openBadge: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  calendarBtn: {
    backgroundColor: '#FFF0EB',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  continueBtn: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  continueBtnText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
