import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayUnion,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Session,
  SessionParticipant,
  SessionSettings,
  Restaurant,
  VoteValue,
} from '../types';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createSession(
  hostId: string,
  hostName: string,
  settings: SessionSettings,
): Promise<Session> {
  const code = generateCode();
  const sessionId = `${code}-${Date.now()}`;

  const host: SessionParticipant = {
    id: hostId,
    name: hostName,
    joinedAt: Date.now(),
    isReady: false,
  };

  const session: Session = {
    id: sessionId,
    code,
    hostId,
    participants: { [hostId]: host },
    settings,
    votes: {},
    matches: [],
    status: 'lobby',
    restaurantQueue: [],
    restaurants: {},
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'sessions', sessionId), session);
  return session;
}

export async function joinSession(
  code: string,
  userId: string,
  userName: string,
): Promise<Session | null> {
  // Query by code — we embed the code in the doc ID prefix for simplicity
  // A real app would use a Firestore index query; here we store a lookup doc
  const lookupRef = doc(db, 'sessionCodes', code);
  const lookupSnap = await getDoc(lookupRef);

  if (!lookupSnap.exists()) return null;

  const { sessionId } = lookupSnap.data() as { sessionId: string };
  const sessionRef = doc(db, 'sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) return null;

  const participant: SessionParticipant = {
    id: userId,
    name: userName,
    joinedAt: Date.now(),
    isReady: false,
  };

  await updateDoc(sessionRef, {
    [`participants.${userId}`]: participant,
  });

  return { ...(sessionSnap.data() as Session), participants: { ...sessionSnap.data()!['participants'], [userId]: participant } };
}

export async function publishSessionCode(sessionId: string, code: string): Promise<void> {
  await setDoc(doc(db, 'sessionCodes', code), { sessionId });
}

export async function setParticipantReady(
  sessionId: string,
  userId: string,
  isReady: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    [`participants.${userId}.isReady`]: isReady,
  });
}

export async function startSwiping(
  sessionId: string,
  placeIds: string[],
  restaurants: { [placeId: string]: Restaurant },
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'swiping',
    restaurantQueue: placeIds,
    restaurants,
  });
}

export async function castVote(
  sessionId: string,
  userId: string,
  placeId: string,
  vote: VoteValue,
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    [`votes.${userId}.${placeId}`]: vote,
  });

  // Check for match after vote
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return;
  const session = snap.data() as Session;
  const participantIds = Object.keys(session.participants);

  const allVotedYes = participantIds.every(
    (pid) => session.votes[pid]?.[placeId] === 'yes',
  );

  if (allVotedYes && !session.matches.includes(placeId)) {
    await updateDoc(sessionRef, {
      matches: arrayUnion(placeId),
      status: 'matched',
    });
  }
}

export async function updateSessionSettings(
  sessionId: string,
  settings: Partial<SessionSettings>,
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (settings.radius !== undefined) updates['settings.radius'] = settings.radius;
  if (settings.location !== undefined) updates['settings.location'] = settings.location;
  await updateDoc(doc(db, 'sessions', sessionId), updates);
}

export async function resetToSwiping(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { status: 'swiping' });
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: Session) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Session);
    }
  });
}
