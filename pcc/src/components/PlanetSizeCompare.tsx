import { PLANETS } from '../data/planets';
import type { Attempt } from '../types';

interface Props {
  /** 채점이 끝난 시도 기록. 넘기면 실제 크기 원 위에 학생이 그린 원을 함께 겹쳐 보여 줍니다. */
  attempts?: Attempt[];
}

/** 지구 기준 원의 반지름(px). 이 값에 상대 지름을 곱해 실제 크기 비율대로 그립니다. */
const EARTH_RADIUS = 20;
const GAP = 26;
const TOP_MARGIN = 34;

/**
 * 여덟 행성을 지구와 같은 기준선 위에 실제 비율대로 나란히 그리는 시각 자료.
 * attempts 를 넘기면 같은 기준선 위에 학생이 그린 원(주황 점선)도 겹쳐 그려서,
 * 실제 크기와 내가 그린 크기를 한눈에 비교할 수 있게 합니다.
 */
export default function PlanetSizeCompare({ attempts }: Props) {
  const drawnFor = (planetId: string) => attempts?.find((a) => a.planetId === planetId);

  const maxR =
    Math.max(
      ...PLANETS.map((p) => Math.max(p.relativeDiameter, drawnFor(p.id)?.drawnRatio ?? 0)),
    ) * EARTH_RADIUS;
  const bottomMargin = attempts ? 50 : 34;
  const baseline = TOP_MARGIN + maxR * 2;
  const height = baseline + bottomMargin;

  let cursorX = GAP;
  const items = PLANETS.map((planet) => {
    const r = planet.relativeDiameter * EARTH_RADIUS;
    const attempt = drawnFor(planet.id);
    const drawnR = attempt ? attempt.drawnRatio * EARTH_RADIUS : null;
    const topR = Math.max(r, drawnR ?? 0);
    const cx = cursorX + topR;
    cursorX += topR * 2 + GAP;
    return { planet, r, cx, attempt, drawnR, topR };
  });
  const width = cursorX;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-edge/60 bg-deep/60 p-3">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          className="block"
        >
          <line x1={0} y1={baseline} x2={width} y2={baseline} stroke="#2A356B" strokeWidth={1} />
          {items.map(({ planet, r, cx, attempt, drawnR, topR }) => (
            <g key={planet.id}>
              <circle cx={cx} cy={baseline - r} r={r} fill={planet.colorLight} opacity={0.9} />
              {drawnR !== null && (
                <circle
                  cx={cx}
                  cy={baseline - drawnR}
                  r={drawnR}
                  fill="none"
                  stroke="#FFC46B"
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                />
              )}

              <text
                x={cx}
                y={baseline - topR * 2 - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#EAF0FF"
                fontFamily="Pretendard, system-ui, sans-serif"
              >
                {planet.name}
              </text>
              <text
                x={cx}
                y={baseline + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#8E9BCB"
                fontFamily="Pretendard, system-ui, sans-serif"
              >
                실제 {planet.relativeDiameter.toFixed(2)}배
              </text>
              {attempt && (
                <text
                  x={cx}
                  y={baseline + 36}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#FFC46B"
                  fontFamily="Pretendard, system-ui, sans-serif"
                >
                  내 원 {attempt.drawnRatio.toFixed(2)}배 · {attempt.score}점
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 화면 리더 사용자를 위한 목록 형태 요약 (위 그림과 같은 내용) */}
      <ul className="sr-only">
        {items.map(({ planet, attempt }) => (
          <li key={planet.id}>
            {planet.name}은(는) 지구 지름의 {planet.relativeDiameter}배예요.
            {attempt && ` 내가 그린 원은 ${attempt.drawnRatio.toFixed(2)}배로, ${attempt.score}점을 받았어요.`}
          </li>
        ))}
      </ul>

      {attempts ? (
        <p className="text-center text-xs text-dust">
          채워진 원은 실제 크기, <span className="text-flare">주황 점선</span>은 내가 그린 크기예요.
        </p>
      ) : (
        <p className="text-center text-xs text-dust">
          가로로 넘겨 가며 목성·토성처럼 큰 행성도 함께 볼 수 있어요.
        </p>
      )}
    </div>
  );
}
