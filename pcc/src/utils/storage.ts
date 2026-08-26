import type { GameSession } from '../types';

/**
 * 기록은 이 기기의 브라우저(localStorage)에만 저장됩니다.
 * 서버로 전송되는 개인 정보는 없습니다.
 */
const KEY = 'pcc:sessions:v1';
const MAX_SESSIONS = 50;

export function loadSessions(): GameSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GameSession[]) : [];
  } catch {
    return []; // 사생활 보호 모드 등으로 읽기가 막힌 경우
  }
}

export function saveSession(session: GameSession): GameSession[] {
  const next = [...loadSessions(), session].slice(-MAX_SESSIONS);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 저장이 막혀도 게임 진행에는 영향이 없습니다. */
  }
  return next;
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
