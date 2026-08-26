import { describe, expect, it } from 'vitest';
import { fitCircle, isClosedEnough } from '../utils/circleFit';
import { prepareStroke, resample, smooth, strokeLength, type Point } from '../utils/smoothing';

/** 시험용 원 위의 점들을 만듭니다. jitter 로 손떨림을 흉내 냅니다. */
function circlePoints(cx: number, cy: number, r: number, count = 60, jitter = 0): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const noise = jitter ? (Math.sin(i * 7.3) * jitter) : 0;
    return { x: cx + (r + noise) * Math.cos(angle), y: cy + (r + noise) * Math.sin(angle) };
  });
}

describe('fitCircle', () => {
  it('완전한 원의 중심과 반지름을 찾아낸다', () => {
    const fitted = fitCircle(circlePoints(200, 150, 80));
    expect(fitted).not.toBeNull();
    expect(fitted!.cx).toBeCloseTo(200, 1);
    expect(fitted!.cy).toBeCloseTo(150, 1);
    expect(fitted!.r).toBeCloseTo(80, 1);
    expect(fitted!.roundness).toBeGreaterThan(0.99);
  });

  it('손떨림이 있어도 반지름을 비슷하게 추정한다', () => {
    const fitted = fitCircle(circlePoints(120, 120, 50, 80, 4));
    expect(fitted).not.toBeNull();
    expect(fitted!.r).toBeGreaterThan(45);
    expect(fitted!.r).toBeLessThan(55);
  });

  it('찌그러진 모양은 원다움이 낮게 나온다', () => {
    const round = fitCircle(circlePoints(0, 0, 60))!;
    const wobbly = fitCircle(circlePoints(0, 0, 60, 60, 22))!;
    expect(wobbly.roundness).toBeLessThan(round.roundness);
  });

  it('점이 너무 적으면 null 을 돌려준다', () => {
    expect(fitCircle([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBeNull();
  });

  it('직선은 원으로 보지 않는다', () => {
    const line: Point[] = Array.from({ length: 30 }, (_, i) => ({ x: i * 5, y: 100 }));
    expect(fitCircle(line)).toBeNull();
  });
});

describe('isClosedEnough', () => {
  it('한 바퀴 돌아온 선은 닫힌 것으로 본다', () => {
    const pts = circlePoints(0, 0, 40, 60);
    expect(isClosedEnough(pts, 40)).toBe(true);
  });

  it('반 바퀴만 그린 선은 닫히지 않은 것으로 본다', () => {
    const half = circlePoints(0, 0, 40, 60).slice(0, 30);
    expect(isClosedEnough(half, 40)).toBe(false);
  });
});

describe('선 다듬기', () => {
  it('resample 은 너무 가까운 점을 제거한다', () => {
    const dense: Point[] = Array.from({ length: 50 }, (_, i) => ({ x: i * 0.5, y: 0 }));
    expect(resample(dense, 3).length).toBeLessThan(dense.length);
  });

  it('smooth 는 점 개수를 바꾸지 않는다', () => {
    const pts = circlePoints(0, 0, 30, 40, 5);
    expect(smooth(pts, 2)).toHaveLength(pts.length);
  });

  it('prepareStroke 를 거쳐도 반지름 추정이 유지된다', () => {
    const fitted = fitCircle(prepareStroke(circlePoints(50, 50, 70, 120, 3)));
    expect(fitted!.r).toBeGreaterThan(64);
    expect(fitted!.r).toBeLessThan(76);
  });

  it('strokeLength 는 선의 길이를 잰다', () => {
    expect(strokeLength([{ x: 0, y: 0 }, { x: 3, y: 4 }])).toBeCloseTo(5);
  });
});
