import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RADIUS_OPTIONS = [
  { label: '0.5 mi', meters: 800 },
  { label: '1 mi', meters: 1600 },
  { label: '2 mi', meters: 3200 },
  { label: '5 mi', meters: 8000 },
  { label: '10 mi', meters: 16000 },
];

interface RadiusSelectorProps {
  value: number;
  onChange: (meters: number) => void;
}

export default function RadiusSelector({ value, onChange }: RadiusSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="radio-outline" size={18} color="#FF6B35" />
        <Text style={styles.label}>Search Radius</Text>
      </View>
      <View style={styles.options}>
        {RADIUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.meters}
            style={[styles.option, value === opt.meters && styles.optionSelected]}
            onPress={() => onChange(opt.meters)}
          >
            <Text style={[styles.optionText, value === opt.meters && styles.optionTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
});
