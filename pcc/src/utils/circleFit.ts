import type { Point } from './smoothing';

export interface FittedCircle {
  cx: number;
  cy: number;
  r: number;
  /** 0~1. 1에 가까울수록 완전한 원에 가깝게 그린 것 */
  roundness: number;
}

/**
 * 손으로 그린 점들을 하나의 원으로 근사합니다. (최소제곱 원 근사 / Kasa 방법)
 *
 * 원의 식 x² + y² + D·x + E·y + F = 0 을 점들에 대해 선형 연립방정식으로 풀면
 * 중심 (-D/2, -E/2), 반지름 √((D²+E²)/4 - F) 를 얻습니다.
 * 점이 거의 한 줄로 늘어서 계산이 불가능하면 null 을 돌려줍니다.
 */
export function fitCircle(points: Point[]): FittedCircle | null {
  if (points.length < 8) return null;

  // 수치 안정성을 위해 무게중심을 원점으로 옮겨 계산합니다.
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;

  let Suu = 0, Svv = 0, Suv = 0, Suuu = 0, Svvv = 0, Suvv = 0, Svuu = 0;
  for (const p of points) {
    const u = p.x - mx;
    const v = p.y - my;
    Suu += u * u;
    Svv += v * v;
    Suv += u * v;
    Suuu += u * u * u;
    Svvv += v * v * v;
    Suvv += u * v * v;
    Svuu += v * u * u;
  }

  const det = Suu * Svv - Suv * Suv;
  if (Math.abs(det) < 1e-8) return null; // 거의 직선 → 원으로 볼 수 없음

  const b1 = (Suuu + Suvv) / 2;
  const b2 = (Svvv + Svuu) / 2;
  const uc = (b1 * Svv - b2 * Suv) / det;
  const vc = (b2 * Suu - b1 * Suv) / det;

  const r = Math.sqrt(uc * uc + vc * vc + (Suu + Svv) / n);
  if (!Number.isFinite(r) || r <= 0) return null;

  const cx = uc + mx;
  const cy = vc + my;

  // 각 점이 근사한 원에서 얼마나 벗어났는지(RMS)를 반지름과 비교해 원다움을 계산합니다.
  let sqSum = 0;
  for (const p of points) {
    const d = Math.hypot(p.x - cx, p.y - cy) - r;
    sqSum += d * d;
  }
  const rms = Math.sqrt(sqSum / n);
  const roundness = clamp01(1 - rms / r);

  return { cx, cy, r, roundness };
}

/**
 * 그린 선이 얼마나 닫혀 있는지 확인합니다.
 * 시작점과 끝점이 반지름에 비해 많이 떨어져 있으면 원을 닫지 않은 것으로 봅니다.
 */
export function isClosedEnough(points: Point[], r: number, tolerance = 1.2): boolean {
  if (points.length < 2 || r <= 0) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return Math.hypot(last.x - first.x, last.y - first.y) <= r * tolerance;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
