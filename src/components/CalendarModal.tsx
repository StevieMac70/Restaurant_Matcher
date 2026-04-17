import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant, CalendarEventDetails } from '../types';
import { addRestaurantToCalendar } from '../services/calendarService';

interface CalendarModalProps {
  visible: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
  onSuccess: () => void;
}

function padZero(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function CalendarModal({
  visible,
  restaurant,
  onClose,
  onSuccess,
}: CalendarModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const [date, setDate] = useState(tomorrow);
  const [hour, setHour] = useState('19');
  const [minute, setMinute] = useState('00');
  const [duration, setDuration] = useState('90');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!restaurant) return;

    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const d = parseInt(duration, 10);

    if (isNaN(h) || h < 0 || h > 23) {
      Alert.alert('Invalid hour', 'Please enter a valid hour (0-23).');
      return;
    }
    if (isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Invalid minute', 'Please enter a valid minute (0-59).');
      return;
    }

    const startDate = new Date(date);
    startDate.setHours(h, m, 0, 0);

    setSaving(true);
    try {
      const details: CalendarEventDetails = {
        restaurantName: restaurant.name,
        address: restaurant.address,
        notes: notes || `Matched via Restaurant Matcher 🍽️`,
        startDate,
        durationMinutes: isNaN(d) || d <= 0 ? 90 : d,
      };
      const eventId = await addRestaurantToCalendar(details);
      if (eventId) {
        onSuccess();
      } else {
        Alert.alert('Permission Denied', 'Please allow calendar access in Settings.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not create calendar event.');
    } finally {
      setSaving(false);
    }
  };

  const adjustDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  const formattedDate = `${date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  return (
    <Modal transparent animationType="slide" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Add to Calendar</Text>
          {restaurant && (
            <Text style={styles.subtitle}>{restaurant.name}</Text>
          )}

          {/* Date picker */}
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustDate(-1)}>
              <Ionicons name="chevron-back" size={20} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustDate(1)}>
              <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>

          {/* Time */}
          <Text style={styles.fieldLabel}>Time (24h)</Text>
          <View style={styles.timeRow}>
            <TextInput
              style={styles.timeInput}
              value={hour}
              onChangeText={setHour}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="HH"
              placeholderTextColor="#ccc"
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
              style={styles.timeInput}
              value={minute}
              onChangeText={setMinute}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="MM"
              placeholderTextColor="#ccc"
            />
            <Text style={styles.durationLabel}>Duration (min)</Text>
            <TextInput
              style={[styles.timeInput, styles.durationInput]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="90"
              placeholderTextColor="#ccc"
            />
          </View>

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note…"
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={3}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Event'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  arrowBtn: {
    padding: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeInput: {
    width: 52,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  colon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  durationLabel: {
    marginLeft: 12,
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  durationInput: {
    width: 64,
  },
  notesInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
