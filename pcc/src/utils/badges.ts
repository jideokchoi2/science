import type { Attempt, Badge, GameSession } from '../types';

/** 얻을 수 있는 모든 배지 목록 */
export const ALL_BADGES: Badge[] = [
  { id: 'first-launch', name: '첫 관측', description: '한 판을 끝까지 완주했어요', icon: '🔭' },
  { id: 'giant-hunter', name: '거대 행성 전문가', description: '목성에서 85점 이상을 받았어요', icon: '🪐' },
  { id: 'tiny-eye', name: '작은 행성 관측가', description: '수성에서 85점 이상을 받았어요', icon: '🔍' },
  { id: 'precise', name: '정밀 관측가', description: '한 판에서 95점 이상을 3번 받았어요', icon: '🎯' },
  { id: 'round-master', name: '동그라미 장인', description: '아주 동그란 원을 그렸어요 (원다움 95% 이상)', icon: '⭕' },
  { id: 'explorer', name: '태양계 탐험가', description: '8개 행성을 모두 도전했어요', icon: '🚀' },
  { id: 'high-average', name: '우수 관측단', description: '평균 85점 이상으로 마쳤어요', icon: '🏅' },
  { id: 'persistent', name: '꾸준한 관측', description: '3판 이상 플레이했어요', icon: '📔' },
];

const BADGE_MAP = new Map(ALL_BADGES.map((b) => [b.id, b]));

/**
 * 방금 끝난 판과 이전 기록을 함께 보고 획득한 배지를 계산합니다.
 * 순수 함수라 화면과 상관없이 단독으로 검사할 수 있습니다.
 */
export function evaluateBadges(current: Attempt[], pastSessions: GameSession[]): Badge[] {
  const earned = new Set<string>();

  if (current.length > 0) earned.add('first-launch');

  const jupiter = current.find((a) => a.planetId === 'jupiter');
  if (jupiter && jupiter.score >= 85) earned.add('giant-hunter');

  const mercury = current.find((a) => a.planetId === 'mercury');
  if (mercury && mercury.score >= 85) earned.add('tiny-eye');

  if (current.filter((a) => a.score >= 95).length >= 3) earned.add('precise');

  if (current.some((a) => a.roundness >= 0.95)) earned.add('round-master');

  if (new Set(current.map((a) => a.planetId)).size >= 8) earned.add('explorer');

  const average = current.length
    ? current.reduce((s, a) => s + a.score, 0) / current.length
    : 0;
  if (average >= 85) earned.add('high-average');

  // 이번 판을 포함해 3판 이상
  if (pastSessions.length + 1 >= 3) earned.add('persistent');

  return [...earned].map((id) => BADGE_MAP.get(id)!).filter(Boolean);
}
