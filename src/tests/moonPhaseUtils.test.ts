import { describe, expect, it } from 'vitest';
import {
  MS_PER_DAY,
  REFERENCE_NEW_MOON_UTC,
  SYNODIC_MONTH_DAYS,
  getIlluminationPercent,
  getPhaseFraction,
  getPhaseIndex,
  normalizeToUnitInterval,
  addDays,
  isSameDay,
} from '../utils/moonPhaseUtils';
import { calculateMoonPhase } from '../components/PhaseCalculator';

describe('normalizeToUnitInterval', () => {
  it('keeps values already in [0, 1) unchanged', () => {
    expect(normalizeToUnitInterval(0.3)).toBeCloseTo(0.3);
  });

  it('wraps negative values into [0, 1)', () => {
    expect(normalizeToUnitInterval(-0.25)).toBeCloseTo(0.75);
  });

  it('wraps values greater than 1', () => {
    expect(normalizeToUnitInterval(1.4)).toBeCloseTo(0.4);
  });
});

describe('getPhaseFraction / getIlluminationPercent', () => {
  it('reports the reference new moon as ~0% illuminated', () => {
    const referenceDate = new Date(REFERENCE_NEW_MOON_UTC);
    const phaseFraction = getPhaseFraction(referenceDate);
    expect(phaseFraction).toBeCloseTo(0, 2);
    expect(getIlluminationPercent(phaseFraction)).toBeCloseTo(0, 0);
  });

  it('reports the midpoint of the synodic month as ~100% illuminated (full moon)', () => {
    const fullMoonDate = new Date(REFERENCE_NEW_MOON_UTC + (SYNODIC_MONTH_DAYS / 2) * MS_PER_DAY);
    const phaseFraction = getPhaseFraction(fullMoonDate);
    expect(phaseFraction).toBeCloseTo(0.5, 2);
    expect(getIlluminationPercent(phaseFraction)).toBeCloseTo(100, 0);
  });

  it('reports the first quarter (1/4 into the cycle) as ~50% illuminated', () => {
    const firstQuarterDate = new Date(REFERENCE_NEW_MOON_UTC + (SYNODIC_MONTH_DAYS / 4) * MS_PER_DAY);
    const phaseFraction = getPhaseFraction(firstQuarterDate);
    expect(getIlluminationPercent(phaseFraction)).toBeCloseTo(50, 0);
  });
});

describe('getPhaseIndex', () => {
  it('maps a phase fraction of 0 to index 0 (신월)', () => {
    expect(getPhaseIndex(0)).toBe(0);
  });

  it('maps a phase fraction of 0.5 to index 4 (보름달)', () => {
    expect(getPhaseIndex(0.5)).toBe(4);
  });

  it('wraps just below 1 back to index 0', () => {
    expect(getPhaseIndex(0.999)).toBe(0);
  });
});

describe('addDays / isSameDay', () => {
  it('adds days without mutating the original date', () => {
    const original = new Date(2026, 0, 1);
    const shifted = addDays(original, 5);
    expect(original.getDate()).toBe(1);
    expect(shifted.getDate()).toBe(6);
  });

  it('detects two Date objects on the same calendar day', () => {
    const a = new Date(2026, 2, 10, 3, 0);
    const b = new Date(2026, 2, 10, 23, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
});

describe('calculateMoonPhase', () => {
  it('returns a full 8-phase cycle whose index stays within 0-7', () => {
    for (let dayOffset = 0; dayOffset < 60; dayOffset += 1) {
      const date = new Date(REFERENCE_NEW_MOON_UTC + dayOffset * MS_PER_DAY);
      const result = calculateMoonPhase(date);
      expect(result.phaseIndex).toBeGreaterThanOrEqual(0);
      expect(result.phaseIndex).toBeLessThanOrEqual(7);
      expect(result.illumination).toBeGreaterThanOrEqual(0);
      expect(result.illumination).toBeLessThanOrEqual(100);
    }
  });
});
