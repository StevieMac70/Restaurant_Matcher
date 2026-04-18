import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Coordinates } from '../types';

interface AppContextValue {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  firebaseUid: string | null;
  setFirebaseUid: (uid: string | null) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  userLocation: Coordinates | null;
  setUserLocation: (loc: Coordinates | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        firebaseUid,
        setFirebaseUid,
        currentSessionId,
        setCurrentSessionId,
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
