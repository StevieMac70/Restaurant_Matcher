import { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import { subscribeToSession } from '../services/sessionService';

export function useSession(sessionId: string | null): {
  session: Session | null;
  loading: boolean;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    unsubRef.current = subscribeToSession(sessionId, (s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      unsubRef.current?.();
    };
  }, [sessionId]);

  return { session, loading };
}
