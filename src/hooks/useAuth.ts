import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export function useAuth(): { uid: string | null; authLoading: boolean } {
  const [uid, setUid] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        setAuthLoading(false);
      } else {
        try {
          const credential = await signInAnonymously(auth);
          setUid(credential.user.uid);
        } catch {
          // Auth unavailable (no network on first launch) — app still works
          // but Firestore writes will fail until connectivity returns
          setUid(null);
        } finally {
          setAuthLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  return { uid, authLoading };
}
