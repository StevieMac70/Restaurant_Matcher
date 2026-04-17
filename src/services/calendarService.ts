import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarEventDetails } from '../types';

async function getDefaultCalendarId(): Promise<string> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal.id;
  }

  const writeable = calendars.find(
    (c) => c.accessLevel === 'owner' || c.accessLevel === 'contributor',
  );
  if (writeable) return writeable.id;

  // Create a local calendar as fallback
  const newId = await Calendar.createCalendarAsync({
    title: 'Restaurant Matcher',
    color: '#FF6B35',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: undefined,
    source: {
      isLocalAccount: true,
      name: 'Restaurant Matcher',
      type: Calendar.SourceType.LOCAL,
    },
    name: 'restaurantMatcher',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return newId;
}

export async function requestCalendarPermission(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function addRestaurantToCalendar(
  details: CalendarEventDetails,
): Promise<string | null> {
  const granted = await requestCalendarPermission();
  if (!granted) return null;

  const calendarId = await getDefaultCalendarId();

  const endDate = new Date(details.startDate);
  endDate.setMinutes(endDate.getMinutes() + details.durationMinutes);

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: `🍽️ ${details.restaurantName}`,
    location: details.address,
    notes: details.notes,
    startDate: details.startDate,
    endDate,
    alarms: [{ relativeOffset: -60 }, { relativeOffset: -15 }],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return eventId;
}
