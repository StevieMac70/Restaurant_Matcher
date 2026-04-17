import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '../types';
import StarRating from '../components/StarRating';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'MapView'>;
  route: RouteProp<RootStackParamList, 'MapView'>;
};

export default function MapViewScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const { coordinates } = restaurant;

  const openDirections = () => {
    const label = encodeURIComponent(restaurant.name);
    const query = `${coordinates.latitude},${coordinates.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${query}`,
      android: `geo:${query}?q=${query}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'Could not open maps application.'),
      );
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}&query_place_id=${restaurant.placeId}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open Google Maps.'),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }}
          title={restaurant.name}
          description={restaurant.address}
          pinColor="#FF6B35"
        >
          <View style={styles.markerContainer}>
            <View style={styles.marker}>
              <Ionicons name="restaurant" size={20} color="#fff" />
            </View>
            <View style={styles.markerTail} />
          </View>
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutName}>{restaurant.name}</Text>
              <StarRating rating={restaurant.rating} size={13} />
              <Text style={styles.calloutAddress} numberOfLines={2}>
                {restaurant.address}
              </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>

      {/* Bottom panel */}
      <View style={styles.panel}>
        <View style={styles.panelInfo}>
          <Text style={styles.panelName} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.panelRating}>
            <StarRating rating={restaurant.rating} size={14} />
            <Text style={styles.panelRatingText}>
              {restaurant.rating.toFixed(1)} ({restaurant.userRatingsTotal.toLocaleString()})
            </Text>
          </View>
          <Text style={styles.panelAddress} numberOfLines={2}>{restaurant.address}</Text>
          {restaurant.openNow != null && (
            <Text style={[styles.openStatus, { color: restaurant.openNow ? '#2ECC71' : '#E74C3C' }]}>
              {restaurant.openNow ? '● Open Now' : '● Closed'}
            </Text>
          )}
        </View>

        <View style={styles.panelActions}>
          <TouchableOpacity style={styles.dirBtn} onPress={openDirections}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.dirBtnText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleBtn} onPress={openGoogleMaps}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.googleBtnText}>Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  map: { flex: 1 },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B35',
    marginTop: -2,
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    gap: 4,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    gap: 16,
  },
  panelInfo: {
    gap: 4,
  },
  panelName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  panelRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelRatingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  panelAddress: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  openStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  panelActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dirBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dirBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleBtnText: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: '700',
  },
});
