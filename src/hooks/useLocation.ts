import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../types';

interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setState({ coordinates: null, error: 'Location permission denied.', loading: false });
        }
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            coordinates: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            },
            error: null,
            loading: false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ coordinates: null, error: 'Could not fetch location.', loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
