import { PLANETS } from '../data/planets';
import type { Attempt, GameSession, PlanetId } from '../types';

export interface PlanetStat {
  planetId: PlanetId;
  name: string;
  attempts: number;
  averageScore: number;
  bestScore: number;
  /** 실제보다 크게 그린 비율(%) — 지도에 참고 */
  overestimateRate: number;
}

export interface Analytics {
  sessionCount: number;
  attemptCount: number;
  overallAverage: number;
  planetStats: PlanetStat[];
  /** 판별 평균 점수 (오래된 순) — 추이 그래프용 */
  trend: { label: string; average: number }[];
  /** 평균이 가장 낮은 행성 = 다음 수업에서 짚어 줄 지점 */
  weakestPlanet?: PlanetStat;
}

/** 저장된 모든 판을 모아 학급 지도용 통계를 만듭니다. */
export function buildAnalytics(sessions: GameSession[]): Analytics {
  const all: Attempt[] = sessions.flatMap((s) => s.attempts);

  const planetStats: PlanetStat[] = PLANETS.map((planet) => {
    const rows = all.filter((a) => a.planetId === planet.id);
    const attempts = rows.length;
    const averageScore = attempts ? round1(sum(rows.map((r) => r.score)) / attempts) : 0;
    const bestScore = attempts ? Math.max(...rows.map((r) => r.score)) : 0;
    const over = rows.filter((r) => r.drawnRatio > r.trueRatio).length;
    return {
      planetId: planet.id,
      name: planet.name,
      attempts,
      averageScore,
      bestScore,
      overestimateRate: attempts ? Math.round((over / attempts) * 100) : 0,
    };
  });

  const answered = planetStats.filter((p) => p.attempts > 0);

  return {
    sessionCount: sessions.length,
    attemptCount: all.length,
    overallAverage: all.length ? round1(sum(all.map((a) => a.score)) / all.length) : 0,
    planetStats,
    trend: sessions
      .slice()
      .sort((a, b) => a.startedAt - b.startedAt)
      .map((s, i) => ({ label: `${i + 1}판`, average: round1(s.averageScore) })),
    weakestPlanet: answered.length
      ? answered.reduce((min, p) => (p.averageScore < min.averageScore ? p : min))
      : undefined,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
