import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Restaurant } from '../types';
import StarRating from './StarRating';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.72;

interface RestaurantCardProps {
  restaurant: Restaurant;
  onMapPress?: () => void;
}

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

export default function RestaurantCard({ restaurant, onMapPress }: RestaurantCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasPhotos = restaurant.photos.length > 0;

  return (
    <View style={[styles.container, { height: CARD_HEIGHT }]}>
      {/* Photo carousel */}
      <View style={styles.photoContainer}>
        {hasPhotos ? (
          <Image
            source={{ uri: restaurant.photos[photoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="restaurant" size={80} color="#ccc" />
          </View>
        )}

        {/* Photo dots */}
        {restaurant.photos.length > 1 && (
          <View style={styles.dots}>
            {restaurant.photos.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                <View style={[styles.dot, i === photoIndex && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.gradient}
        />

        {/* Name and basic info over photo */}
        <View style={styles.photoOverlay}>
          <Text style={styles.name} numberOfLines={2}>{restaurant.name}</Text>
          <View style={styles.row}>
            <StarRating rating={restaurant.rating} size={18} color="#F1C40F" />
            <Text style={styles.ratingText}>
              {restaurant.rating.toFixed(1)} ({restaurant.userRatingsTotal.toLocaleString()})
            </Text>
            {restaurant.priceLevel != null && (
              <Text style={styles.price}>{PRICE_LABELS[restaurant.priceLevel]}</Text>
            )}
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={14} color={restaurant.openNow ? '#2ECC71' : '#E74C3C'} />
            <Text style={[styles.openStatus, { color: restaurant.openNow ? '#2ECC71' : '#E74C3C' }]}>
              {restaurant.openNow == null ? 'Hours unknown' : restaurant.openNow ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable details */}
      <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
        {/* Address */}
        <TouchableOpacity style={styles.detailRow} onPress={onMapPress}>
          <Ionicons name="location-outline" size={18} color="#FF6B35" />
          <Text style={styles.detailText} numberOfLines={2}>{restaurant.address}</Text>
          <Ionicons name="map-outline" size={18} color="#FF6B35" />
        </TouchableOpacity>

        {/* Phone */}
        {restaurant.phoneNumber && (
          <TouchableOpacity
            style={styles.detailRow}
            onPress={() => Linking.openURL(`tel:${restaurant.phoneNumber}`)}
          >
            <Ionicons name="call-outline" size={18} color="#FF6B35" />
            <Text style={styles.detailText}>{restaurant.phoneNumber}</Text>
          </TouchableOpacity>
        )}

        {/* Website */}
        {restaurant.website && (
          <TouchableOpacity
            style={styles.detailRow}
            onPress={() => Linking.openURL(restaurant.website!)}
          >
            <Ionicons name="globe-outline" size={18} color="#FF6B35" />
            <Text style={[styles.detailText, styles.link]} numberOfLines={1}>
              {restaurant.website.replace(/^https?:\/\//, '')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cuisine types */}
        <View style={styles.tagRow}>
          {restaurant.types
            .filter((t) => t !== 'establishment' && t !== 'point_of_interest' && t !== 'food')
            .slice(0, 4)
            .map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t.replace(/_/g, ' ')}</Text>
              </View>
            ))}
        </View>

        {/* Reviews */}
        {restaurant.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {restaurant.reviews.slice(0, 3).map((review, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <StarRating rating={review.rating} size={12} />
                </View>
                <Text style={styles.reviewText} numberOfLines={3}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  photoContainer: {
    height: CARD_HEIGHT * 0.52,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noPhoto: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    color: '#F1C40F',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  openStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  dots: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },
  details: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  link: {
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  tag: {
    backgroundColor: '#FFF0EB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reviewsSection: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  reviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
