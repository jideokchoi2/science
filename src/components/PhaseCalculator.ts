/**
 * 특정 날짜의 달 위상 정보를 계산하는 로직.
 * 실제 수식은 utils/moonPhaseUtils.ts의 순수 함수들을 조합해서 만든다.
 */
import {
  PHASE_DEFINITIONS,
  PhaseDefinition,
  getIlluminationPercent,
  getMoonAgeDays,
  getPhaseAngleRadians,
  getPhaseFraction,
  getPhaseIndex,
} from '../utils/moonPhaseUtils';

/** 하나의 날짜에 대한 달 위상 계산 결과 */
export interface MoonPhaseResult {
  /** 계산에 사용한 날짜 */
  date: Date;
  /** 가장 최근 신월로부터 지난 일수 (0 ~ 약 29.53) */
  ageDays: number;
  /** 위상값 (0 = 신월, 0.5 = 보름달, 1 직전 = 다음 신월 직전) */
  phaseFraction: number;
  /** 지구 공전 궤도상 달의 위상각 (라디안, 0 = 신월 위치, π = 보름달 위치) */
  phaseAngleRad: number;
  /** 지구에서 보이는 달의 조도 (0~100%) */
  illumination: number;
  /** 8단계 위상 중 해당하는 인덱스 (0~7) */
  phaseIndex: number;
  /** 8단계 위상 정의 정보 */
  phaseDefinition: PhaseDefinition;
}

/**
 * 주어진 날짜의 달 위상을 계산한다.
 * @param date 위상을 계산할 날짜
 */
export function calculateMoonPhase(date: Date): MoonPhaseResult {
  const phaseFraction = getPhaseFraction(date);
  const phaseIndex = getPhaseIndex(phaseFraction);

  return {
    date,
    ageDays: getMoonAgeDays(date),
    phaseFraction,
    phaseAngleRad: getPhaseAngleRadians(phaseFraction),
    illumination: getIlluminationPercent(phaseFraction),
    phaseIndex,
    phaseDefinition: PHASE_DEFINITIONS[phaseIndex],
  };
}

/**
 * 8단계 위상 정의 중 인덱스에 해당하는 정보를 가져온다.
 * @param phaseIndex 0~7 사이의 위상 인덱스
 */
export function getPhaseDefinition(phaseIndex: number): PhaseDefinition {
  return PHASE_DEFINITIONS[phaseIndex];
}

export { PHASE_DEFINITIONS };
