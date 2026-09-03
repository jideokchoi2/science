/**
 * 달의 위상(Moon Phase) 계산에 사용하는 상수와 순수 함수 모음.
 *
 * 계산 원리
 * ---------
 * 달은 약 29.53일(삭망월, Synodic Month) 주기로 지구를 공전하며
 * 태양-지구-달의 상대적인 위치에 따라 우리 눈에 보이는 달의 모양(위상)이 달라진다.
 * 특정 기준 신월(New Moon) 시각을 알면, 그 시각으로부터 지난 일수를
 * 삭망월 길이로 나눈 나머지를 이용해 임의의 날짜의 위상을 근사적으로 계산할 수 있다.
 */

/** 하루의 밀리초 */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 삭망월(신월에서 다음 신월까지 걸리는 평균 일수) */
export const SYNODIC_MONTH_DAYS = 29.530588853;

/**
 * 계산의 기준이 되는 신월(New Moon) 시각.
 * 2000년 1월 6일 18시 14분(UTC)은 실제 관측된 신월 시각으로 널리 쓰이는 기준값이다.
 */
export const REFERENCE_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

/** 위상을 8단계로 나눌 때의 단계 수 */
export const PHASE_COUNT = 8;

/**
 * 위상 하나의 학습용 정보.
 * index: 0(신월) ~ 7(그믐달)까지 순환하는 8단계 위상 순서
 */
export interface PhaseDefinition {
  index: number;
  name: string;
  englishName: string;
  emoji: string;
  description: string;
}

/** 8단계 위상 정의 (신월 → 초승달 → 상현달 → ... → 그믐달 순서로 순환) */
export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    index: 0,
    name: '신월 (삭)',
    englishName: 'New Moon',
    emoji: '🌑',
    description: '달이 태양과 지구 사이에 위치해 햇빛을 받는 면이 지구 반대쪽을 향해요. 그래서 지구에서는 달이 거의 보이지 않아요.',
  },
  {
    index: 1,
    name: '초승달',
    englishName: 'Waxing Crescent',
    emoji: '🌒',
    description: '신월 이후 달이 조금씩 차오르기 시작해요. 해가 진 직후 서쪽 하늘에서 가느다란 초승달을 볼 수 있어요.',
  },
  {
    index: 2,
    name: '상현달',
    englishName: 'First Quarter',
    emoji: '🌓',
    description: '달의 절반이 밝게 빛나요. 태양-지구-달이 직각을 이루는 때로, 낮에도 볼 수 있고 저녁 무렵 남쪽 하늘에 떠 있어요.',
  },
  {
    index: 3,
    name: '차오르는 달 (상현망간)',
    englishName: 'Waxing Gibbous',
    emoji: '🌔',
    description: '보름달을 향해 점점 더 많은 부분이 밝아지고 있어요. 밝은 부분이 절반보다 넓어요.',
  },
  {
    index: 4,
    name: '보름달 (망)',
    englishName: 'Full Moon',
    emoji: '🌕',
    description: '지구가 태양과 달 사이에 위치해 달의 전체 면이 햇빛을 받아요. 밤새도록 둥글고 환한 달을 볼 수 있어요.',
  },
  {
    index: 5,
    name: '이지러지는 달 (하현망간)',
    englishName: 'Waning Gibbous',
    emoji: '🌖',
    description: '보름달을 지나 다시 어두워지기 시작해요. 여전히 밝은 부분이 절반보다 넓어요.',
  },
  {
    index: 6,
    name: '하현달',
    englishName: 'Last Quarter',
    emoji: '🌗',
    description: '달의 나머지 절반이 밝게 빛나요. 자정 무렵 떠올라 새벽까지 남쪽과 서쪽 하늘에서 볼 수 있어요.',
  },
  {
    index: 7,
    name: '그믐달',
    englishName: 'Waning Crescent',
    emoji: '🌘',
    description: '다시 가느다란 달로 돌아가요. 새벽 동쪽 하늘에서 해가 뜨기 직전에 볼 수 있어요.',
  },
];

/**
 * 임의의 실수를 [0, 1) 범위로 정규화한다 (음수도 올바르게 처리).
 * @param value 정규화할 값
 */
export function normalizeToUnitInterval(value: number): number {
  const remainder = value % 1;
  return remainder < 0 ? remainder + 1 : remainder;
}

/**
 * 기준 신월 시각으로부터 주어진 날짜까지 지난 일수를 계산한다.
 * @param date 계산할 날짜
 */
export function getDaysSinceReferenceNewMoon(date: Date): number {
  return (date.getTime() - REFERENCE_NEW_MOON_UTC) / MS_PER_DAY;
}

/**
 * 주어진 날짜가 가장 최근 신월로부터 며칠이 지났는지(달의 나이) 계산한다.
 * 결과는 항상 0 이상 SYNODIC_MONTH_DAYS 미만이다.
 * @param date 계산할 날짜
 */
export function getMoonAgeDays(date: Date): number {
  const daysSinceReference = getDaysSinceReferenceNewMoon(date);
  const cycles = daysSinceReference / SYNODIC_MONTH_DAYS;
  return normalizeToUnitInterval(cycles) * SYNODIC_MONTH_DAYS;
}

/**
 * 달의 위상을 0(신월) ~ 1 직전(다음 신월 직전) 사이의 값으로 계산한다.
 * 0.5는 정확히 보름달을 의미한다.
 * @param date 계산할 날짜
 */
export function getPhaseFraction(date: Date): number {
  return getMoonAgeDays(date) / SYNODIC_MONTH_DAYS;
}

/**
 * 위상값(phaseFraction)으로부터 지구에서 보이는 달의 조도(밝게 보이는 비율, %)를 계산한다.
 * 태양-지구-달의 위상각을 이용한 코사인 근사 공식을 사용한다.
 * @param phaseFraction 0~1 사이의 위상값
 */
export function getIlluminationPercent(phaseFraction: number): number {
  const phaseAngleRad = phaseFraction * 2 * Math.PI;
  return ((1 - Math.cos(phaseAngleRad)) / 2) * 100;
}

/**
 * 위상값(phaseFraction)으로부터 지구를 중심으로 한 달의 공전 각도(라디안)를 계산한다.
 * 0 = 신월 위치(태양과 같은 방향), π = 보름달 위치(태양 반대 방향).
 * @param phaseFraction 0~1 사이의 위상값
 */
export function getPhaseAngleRadians(phaseFraction: number): number {
  return phaseFraction * 2 * Math.PI;
}

/**
 * 위상값(phaseFraction)을 8단계 위상 중 가장 가까운 단계의 인덱스로 변환한다.
 * 각 단계는 1/8 주기 폭을 가지며 경계는 각 단계 중심에서 ±1/16 지점이다.
 * @param phaseFraction 0~1 사이의 위상값
 */
export function getPhaseIndex(phaseFraction: number): number {
  const stepWidth = 1 / PHASE_COUNT;
  const shifted = normalizeToUnitInterval(phaseFraction + stepWidth / 2);
  return Math.floor(shifted * PHASE_COUNT) % PHASE_COUNT;
}

/**
 * 두 날짜의 연-월-일이 같은 날인지 비교한다 (시각은 무시).
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 주어진 날짜에서 일수를 더하거나 뺀 새로운 Date를 반환한다 (원본은 변경하지 않음).
 * @param date 기준 날짜
 * @param days 더할 일수 (음수면 이전 날짜)
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}
