import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '../types';

const USER_KEY = '@restaurant_matcher_user';

export function useUserProfile(): {
  user: UserProfile | null;
  saveUser: (name: string) => Promise<UserProfile>;
  loading: boolean;
} {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((raw) => {
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          // corrupted, ignore
        }
      }
      setLoading(false);
    });
  }, []);

  const saveUser = async (name: string): Promise<UserProfile> => {
    const profile: UserProfile = { id: user?.id ?? uuidv4(), name };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  return { user, saveUser, loading };
}
