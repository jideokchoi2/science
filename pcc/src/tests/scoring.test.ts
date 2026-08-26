import { describe, expect, it } from 'vitest';
import { calculateScore, getGrade, percentError, directionHint } from '../utils/scoring';

describe('calculateScore', () => {
  it('정확히 맞히면 100점이다', () => {
    expect(calculateScore(11.21, 11.21)).toBe(100);
    expect(calculateScore(0.38, 0.38)).toBe(100);
  });

  it('5% 안팎으로 벗어나면 95점 구간에 들어간다', () => {
    const score = calculateScore(1.05, 1.0);
    expect(score).toBeGreaterThanOrEqual(94);
    expect(score).toBeLessThan(100);
  });

  it('크게 그린 경우와 작게 그린 경우를 같은 정도로 본다', () => {
    const twiceBig = calculateScore(2.0, 1.0);
    const twiceSmall = calculateScore(0.5, 1.0);
    expect(twiceBig).toBe(twiceSmall);
  });

  it('오차가 커질수록 점수가 낮아진다', () => {
    const a = calculateScore(1.1, 1.0);
    const b = calculateScore(1.5, 1.0);
    const c = calculateScore(3.0, 1.0);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });

  it('점수는 항상 0 이상 100 이하다', () => {
    expect(calculateScore(0.001, 11.21)).toBeGreaterThanOrEqual(0);
    expect(calculateScore(500, 0.38)).toBeGreaterThanOrEqual(0);
    expect(calculateScore(500, 0.38)).toBeLessThanOrEqual(100);
  });

  it('잘못된 입력은 0점으로 처리한다', () => {
    expect(calculateScore(0, 1)).toBe(0);
    expect(calculateScore(-3, 1)).toBe(0);
    expect(calculateScore(Number.NaN, 1)).toBe(0);
  });
});

describe('getGrade', () => {
  it('점수 구간에 맞는 등급을 돌려준다', () => {
    expect(getGrade(100).key).toBe('perfect');
    expect(getGrade(97).key).toBe('excellent');
    expect(getGrade(88).key).toBe('great');
    expect(getGrade(75).key).toBe('good');
    expect(getGrade(50).key).toBe('retry');
  });
});

describe('보조 함수', () => {
  it('percentError 는 실제 값 대비 백분율 차이를 반올림한다', () => {
    expect(percentError(1.5, 1.0)).toBe(50);
    expect(percentError(0.5, 1.0)).toBe(50);
  });

  it('directionHint 는 크게/작게/비슷하게를 구분한다', () => {
    expect(directionHint(2.0, 1.0)).toContain('크게');
    expect(directionHint(0.5, 1.0)).toContain('작게');
    expect(directionHint(1.0, 1.0)).toContain('거의');
  });
});
