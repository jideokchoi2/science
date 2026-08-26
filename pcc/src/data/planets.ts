import type { Planet } from '../types';

/**
 * 태양계 행성의 상대적인 크기 자료.
 * relativeDiameter 는 지구의 지름을 1.0 으로 두었을 때의 값입니다.
 * (지구 지름 약 12,756 km 기준)
 */
export const PLANETS: Planet[] = [
  {
    id: 'mercury',
    name: '수성',
    nameEn: 'Mercury',
    relativeDiameter: 0.38,
    colorLight: '#B7B2A8',
    colorDark: '#5C574F',
    hasRing: false,
    orderFromSun: 1,
    fact: '수성은 태양에 가장 가깝고 태양계에서 가장 작은 행성이에요. 지구 지름의 약 0.4배랍니다.',
  },
  {
    id: 'venus',
    name: '금성',
    nameEn: 'Venus',
    relativeDiameter: 0.95,
    colorLight: '#F5DFA6',
    colorDark: '#B3823C',
    hasRing: false,
    orderFromSun: 2,
    fact: '금성은 지구와 크기가 거의 같아서 지구의 쌍둥이라고 불려요. 두꺼운 구름에 덮여 있답니다.',
  },
  {
    id: 'earth',
    name: '지구',
    nameEn: 'Earth',
    relativeDiameter: 1.0,
    colorLight: '#7FC4F5',
    colorDark: '#1F5FA8',
    hasRing: false,
    orderFromSun: 3,
    fact: '지구는 우리가 사는 행성이고 이 게임의 크기 기준이에요. 그래서 언제나 1.0배랍니다.',
  },
  {
    id: 'mars',
    name: '화성',
    nameEn: 'Mars',
    relativeDiameter: 0.53,
    colorLight: '#E4794C',
    colorDark: '#8A3A22',
    hasRing: false,
    orderFromSun: 4,
    fact: '화성은 지구의 절반쯤 되는 크기예요. 붉은 흙 때문에 붉은 행성이라고 불린답니다.',
  },
  {
    id: 'jupiter',
    name: '목성',
    nameEn: 'Jupiter',
    relativeDiameter: 11.21,
    colorLight: '#E6C79A',
    colorDark: '#9A6034',
    hasRing: false,
    orderFromSun: 5,
    fact: '목성은 태양계에서 가장 큰 행성이에요. 지구를 나란히 놓으면 11개쯤 들어갈 만큼 크답니다.',
  },
  {
    id: 'saturn',
    name: '토성',
    nameEn: 'Saturn',
    relativeDiameter: 9.45,
    colorLight: '#F0DCA8',
    colorDark: '#A98B4E',
    hasRing: true,
    orderFromSun: 6,
    fact: '토성은 두 번째로 큰 행성이고 얼음과 돌로 된 고리를 가지고 있어요. 지구 지름의 약 9배랍니다.',
  },
  {
    id: 'uranus',
    name: '천왕성',
    nameEn: 'Uranus',
    relativeDiameter: 4.01,
    colorLight: '#A7E7EA',
    colorDark: '#3E8FA0',
    hasRing: false,
    orderFromSun: 7,
    fact: '천왕성은 옆으로 누워서 도는 특이한 행성이에요. 지구 지름의 약 4배 크기랍니다.',
  },
  {
    id: 'neptune',
    name: '해왕성',
    nameEn: 'Neptune',
    relativeDiameter: 3.88,
    colorLight: '#7FA8F0',
    colorDark: '#2A44A0',
    hasRing: false,
    orderFromSun: 8,
    fact: '해왕성은 태양에서 가장 먼 행성이에요. 천왕성과 크기가 비슷해서 약 3.9배랍니다.',
  },
];

/** 게임에서 가장 큰 행성의 비율 (캔버스 축척을 정할 때 사용) */
export const MAX_RATIO = Math.max(...PLANETS.map((p) => p.relativeDiameter));

export function getPlanet(id: string): Planet {
  const found = PLANETS.find((p) => p.id === id);
  if (!found) throw new Error(`알 수 없는 행성 id: ${id}`);
  return found;
}
