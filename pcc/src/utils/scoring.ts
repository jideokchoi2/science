/** 점수 계산 규칙 */

/**
 * 점수는 "몇 배 차이로 틀렸는가"를 기준으로 매깁니다.
 *
 *   비(ratio) = 학생이 그린 배율 ÷ 실제 배율
 *   오차 e = |ln(비)|
 *   점수 = 100 × e^(-DECAY × e)
 *
 * 로그를 쓰는 이유: 절반으로 작게 그린 것과 두 배로 크게 그린 것을
 * 똑같은 정도의 오차로 보기 위해서입니다. (수성처럼 작은 행성과
 * 목성처럼 큰 행성을 같은 잣대로 채점할 수 있습니다.)
 */
export const SCORE_DECAY = 1.05;

export function calculateScore(drawnRatio: number, trueRatio: number): number {
  if (!Number.isFinite(drawnRatio) || drawnRatio <= 0 || trueRatio <= 0) return 0;
  const error = Math.abs(Math.log(drawnRatio / trueRatio));
  const score = 100 * Math.exp(-SCORE_DECAY * error);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** 실제 값 대비 몇 % 차이인지 (피드백 문구용) */
export function percentError(drawnRatio: number, trueRatio: number): number {
  if (trueRatio <= 0) return 0;
  return Math.round(Math.abs(drawnRatio - trueRatio) / trueRatio * 100);
}

export interface Grade {
  key: 'perfect' | 'excellent' | 'great' | 'good' | 'retry';
  label: string;
  message: string;
  /** 화면 강조색 */
  color: string;
}

/** 점수 구간별 등급과 격려 문구 */
export function getGrade(score: number): Grade {
  if (score >= 100)
    return { key: 'perfect', label: '완벽해요', message: '실제 크기와 똑같이 그렸어요. 대단한 관측이에요!', color: '#FFC46B' };
  if (score >= 95)
    return { key: 'excellent', label: '훌륭해요', message: '거의 정확해요. 크기 감각이 아주 좋아요!', color: '#5FE3D6' };
  if (score >= 85)
    return { key: 'great', label: '아주 좋아요', message: '실제 크기에 많이 가까웠어요. 조금만 더 다듬어 볼까요?', color: '#8FD98A' };
  if (score >= 70)
    return { key: 'good', label: '좋아요', message: '방향은 맞았어요. 지구와 몇 배 차이인지 다시 떠올려 보아요.', color: '#F0DCA8' };
  return { key: 'retry', label: '다시 도전', message: '괜찮아요. 정답 원을 눈으로 익히고 다음 행성에서 도전해 보아요!', color: '#E4794C' };
}

/** 그린 원이 실제보다 큰지 작은지 알려 주는 한 줄 힌트 */
export function directionHint(drawnRatio: number, trueRatio: number): string {
  const diff = drawnRatio / trueRatio;
  if (diff > 1.1) return '실제보다 크게 그렸어요';
  if (diff < 0.9) return '실제보다 작게 그렸어요';
  return '실제 크기와 거의 같아요';
}
