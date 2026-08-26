/** 앱 전체에서 함께 쓰는 타입 정의 */

export type PlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export interface Planet {
  id: PlanetId;
  /** 초등 과학 교과서 표기 이름 */
  name: string;
  nameEn: string;
  /** 지구를 1.0으로 보았을 때의 지름 비율 */
  relativeDiameter: number;
  /** 행성 그리기에 쓰는 색 (밝은 쪽 / 어두운 쪽) */
  colorLight: string;
  colorDark: string;
  /** 고리 표현 여부 (토성) */
  hasRing: boolean;
  /** 태양에서 몇 번째 행성인지 */
  orderFromSun: number;
  /** 채점 후 보여 줄 과학 상식 한 줄 */
  fact: string;
}

/** 한 행성에 대한 한 번의 도전 기록 */
export interface Attempt {
  planetId: PlanetId;
  /** 학생이 그린 원의 지름 ÷ 지구 기준 원의 지름 */
  drawnRatio: number;
  /** 실제 상대 지름 */
  trueRatio: number;
  score: number;
  /** 그린 선이 얼마나 원에 가까운지 (0~1) */
  roundness: number;
  /** 입력 방식 */
  method: 'pointer' | 'keyboard';
  timestamp: number;
}

/** 한 판(8행성)의 기록 */
export interface GameSession {
  id: string;
  startedAt: number;
  finishedAt: number;
  attempts: Attempt[];
  totalScore: number;
  averageScore: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type Screen =
  | 'start'
  | 'game'
  | 'result'
  | 'teacher'
  | 'roomEntry'
  | 'roomLobby'
  | 'leaderboard'
  | 'matchmaking';

/** 반 순위표 한 줄 */
export interface LeaderboardEntry {
  id: string;
  nickname: string;
  totalScore: number;
  submittedAt: number;
}

/** 대기열에 들어간 학생 */
export interface QueueEntry {
  id: string;
  nickname: string;
  status: 'waiting' | 'matched';
  matchId?: string;
  joinedAt: number;
}

/** 1:1 랜덤 매치 한 판 */
export interface MatchDoc {
  id: string;
  planetId: PlanetId;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  status: 'playing' | 'done';
  player1Score?: number;
  player2Score?: number;
  winnerId?: string | 'draw';
  createdAt: number;
}

/** 승수 랭킹(명예의 전당) 한 줄 */
export interface WinEntry {
  id: string;
  nickname: string;
  wins: number;
  matches: number;
}
