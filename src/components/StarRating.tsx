import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  color = '#F39C12',
}: StarRatingProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={size}
            color={color}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
