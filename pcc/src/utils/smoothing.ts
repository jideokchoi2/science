/** 손으로 그린 선을 다듬는 도구 모음 */

export interface Point {
  x: number;
  y: number;
}

/**
 * 너무 촘촘한 점을 걸러 냅니다.
 * 손가락으로 그리면 같은 자리에 점이 수십 개 찍히는데,
 * 그대로 두면 원 근사 계산이 그 부분으로 치우칩니다.
 */
export function resample(points: Point[], minDistance = 3): Point[] {
  if (points.length === 0) return [];
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = out[out.length - 1];
    const dx = points[i].x - last.x;
    const dy = points[i].y - last.y;
    if (Math.hypot(dx, dy) >= minDistance) out.push(points[i]);
  }
  return out;
}

/**
 * 이동 평균으로 선을 부드럽게 만듭니다. (손떨림 제거)
 * windowSize 는 앞뒤로 몇 개의 점을 함께 평균 낼지 정합니다.
 */
export function smooth(points: Point[], windowSize = 2): Point[] {
  if (points.length <= 2 || windowSize < 1) return points;
  return points.map((_, i) => {
    let sx = 0;
    let sy = 0;
    let count = 0;
    for (let k = -windowSize; k <= windowSize; k++) {
      const j = i + k;
      if (j < 0 || j >= points.length) continue;
      sx += points[j].x;
      sy += points[j].y;
      count++;
    }
    return { x: sx / count, y: sy / count };
  });
}

/** 걸러 내기 → 부드럽게 하기 순서로 한 번에 처리합니다. */
export function prepareStroke(points: Point[]): Point[] {
  return smooth(resample(points, 3), 2);
}

/** 선의 전체 길이 (너무 짧은 낙서를 걸러 낼 때 사용) */
export function strokeLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}
