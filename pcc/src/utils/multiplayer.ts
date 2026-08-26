import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PLANETS } from '../data/planets';
import type { LeaderboardEntry, MatchDoc, PlanetId, WinEntry } from '../types';

/**
 * 학생 한 명을 구분하는 id. 같은 기기에서 같은 방에 다시 들어와도
 * 승수·순위가 이어지도록 방 코드별로 localStorage에 저장해 둡니다.
 */
export function getPlayerId(roomCode: string): string {
  const key = `pcc:playerId:${roomCode}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

/** 방 코드에 쓸 수 없는 문자를 정리합니다. */
export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 12);
}

// ── 전체 순위전 ──────────────────────────────────────────────

/** 최고 점수만 남도록 갱신합니다. (여러 판을 해도 순위표는 최고 기록 기준) */
export async function submitLeaderboardScore(
  roomCode: string,
  playerId: string,
  nickname: string,
  totalScore: number,
): Promise<void> {
  const ref = doc(db, 'rooms', roomCode, 'leaderboard', playerId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const prevBest = snap.exists() ? (snap.data().totalScore as number) : -1;
    if (totalScore > prevBest) {
      tx.set(ref, { nickname, totalScore, submittedAt: Date.now() });
    }
  });
}

export function listenLeaderboard(
  roomCode: string,
  onChange: (rows: LeaderboardEntry[]) => void,
): () => void {
  const q = query(
    collection(db, 'rooms', roomCode, 'leaderboard'),
    orderBy('totalScore', 'desc'),
    limit(50),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LeaderboardEntry, 'id'>) })));
  });
}

// ── 랜덤 매치 ────────────────────────────────────────────────

/**
 * 대기열에 들어갑니다. 마침 기다리던 다른 학생이 있으면 그 자리에서 바로 매칭해
 * 매치 id를 돌려주고, 없으면 대기 상태로 남아 있다가 다른 학생이 올 때 매칭됩니다.
 */
export async function joinQueue(
  roomCode: string,
  playerId: string,
  nickname: string,
): Promise<string | null> {
  const queueRef = collection(db, 'rooms', roomCode, 'queue');
  const myRef = doc(queueRef, playerId);

  // 1) 이미 기다리고 있는 다른 학생을 찾습니다.
  const waitingQuery = query(
    queueRef,
    where('status', '==', 'waiting'),
    orderBy('joinedAt', 'asc'),
    limit(5),
  );
  const waitingSnap = await getDocs(waitingQuery);
  const opponent = waitingSnap.docs.find((d) => d.id !== playerId);

  if (!opponent) {
    // 상대가 없으면 대기열에 등록만 하고 기다립니다.
    await setDoc(myRef, { nickname, status: 'waiting', joinedAt: Date.now() });
    return null;
  }

  // 2) 상대를 찾았으면 트랜잭션으로 동시에 두 번 매칭되지 않게 확정합니다.
  const opponentRef = opponent.ref;
  const matchRef = doc(collection(db, 'rooms', roomCode, 'matches'));
  const planet = PLANETS[Math.floor(Math.random() * PLANETS.length)];

  try {
    await runTransaction(db, async (tx) => {
      const freshOpponent = await tx.get(opponentRef);
      if (!freshOpponent.exists() || freshOpponent.data().status !== 'waiting') {
        throw new Error('opponent-taken');
      }
      const opponentData = freshOpponent.data() as { nickname: string };

      const match: Omit<MatchDoc, 'id'> = {
        planetId: planet.id,
        player1Id: opponent.id,
        player1Name: opponentData.nickname,
        player2Id: playerId,
        player2Name: nickname,
        status: 'playing',
        createdAt: Date.now(),
      };
      tx.set(matchRef, match);
      tx.set(opponentRef, { status: 'matched', matchId: matchRef.id }, { merge: true });
      tx.set(myRef, { nickname, status: 'matched', matchId: matchRef.id, joinedAt: Date.now() });
    });
    return matchRef.id;
  } catch {
    // 다른 학생이 그 상대를 먼저 채갔다면 다시 대기 상태로 등록합니다.
    await setDoc(myRef, { nickname, status: 'waiting', joinedAt: Date.now() });
    return null;
  }
}

export async function leaveQueue(roomCode: string, playerId: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', roomCode, 'queue', playerId));
}

/** 대기 중일 때 상대가 나를 매칭해 줄 때까지 지켜봅니다. */
export function listenMyQueueStatus(
  roomCode: string,
  playerId: string,
  onMatched: (matchId: string) => void,
): () => void {
  const ref = doc(db, 'rooms', roomCode, 'queue', playerId);
  return onSnapshot(ref, (snap) => {
    const data = snap.data();
    if (data?.status === 'matched' && data.matchId) onMatched(data.matchId);
  });
}

export function listenMatch(
  roomCode: string,
  matchId: string,
  onChange: (match: MatchDoc | null) => void,
): () => void {
  const ref = doc(db, 'rooms', roomCode, 'matches', matchId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return onChange(null);
    onChange({ id: snap.id, ...(snap.data() as Omit<MatchDoc, 'id'>) });
  });
}

/**
 * 점수를 제출합니다. 두 사람 모두 제출했으면 이 함수를 호출한 클라이언트가
 * 승자를 계산하고 명예의 전당(wins)에 반영합니다.
 */
export async function submitMatchScore(
  roomCode: string,
  matchId: string,
  playerId: string,
  score: number,
): Promise<void> {
  const matchRef = doc(db, 'rooms', roomCode, 'matches', matchId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) return;
    const match = snap.data() as MatchDoc;
    if (match.status === 'done') return;

    const isPlayer1 = match.player1Id === playerId;
    const update: Partial<MatchDoc> = isPlayer1 ? { player1Score: score } : { player2Score: score };
    const other = isPlayer1 ? match.player2Score : match.player1Score;

    if (other === undefined) {
      tx.set(matchRef, update, { merge: true });
      return;
    }

    // 두 사람 모두 제출 완료 → 승자 결정
    const p1 = isPlayer1 ? score : match.player1Score!;
    const p2 = isPlayer1 ? match.player2Score! : score;
    const winnerId = p1 === p2 ? 'draw' : p1 > p2 ? match.player1Id : match.player2Id;

    const players = [
      [match.player1Id, match.player1Name],
      [match.player2Id, match.player2Name],
    ] as const;

    // Firestore 트랜잭션은 모든 읽기가 쓰기보다 먼저 실행되어야 하므로,
    // wins 문서를 먼저 전부 읽은 뒤에 match/wins 쓰기를 수행합니다.
    const winSnaps = await Promise.all(
      players.map(([id]) => tx.get(doc(db, 'rooms', roomCode, 'wins', id))),
    );

    tx.set(matchRef, { ...update, status: 'done', winnerId }, { merge: true });

    players.forEach(([id, name], i) => {
      const winSnap = winSnaps[i];
      const prev = winSnap.exists() ? (winSnap.data() as { wins: number; matches: number }) : { wins: 0, matches: 0 };
      tx.set(winSnap.ref, {
        nickname: name,
        wins: prev.wins + (id === winnerId ? 1 : 0),
        matches: prev.matches + 1,
      });
    });
  });
}

export function listenWins(roomCode: string, onChange: (rows: WinEntry[]) => void): () => void {
  const q = query(collection(db, 'rooms', roomCode, 'wins'), orderBy('wins', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WinEntry, 'id'>) })));
  });
}

export function randomPlanetId(): PlanetId {
  return PLANETS[Math.floor(Math.random() * PLANETS.length)].id;
}

// serverTimestamp import kept for future use (server-side ordering if needed)
void serverTimestamp;
