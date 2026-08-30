import { useEffect, useRef } from 'react';
import { PLANETS } from '../data/planets';
import Button from './Button';

interface Props {
  onClose: () => void;
}

/** 지구 기준 원의 반지름(px). 이 값에 각 행성의 상대 지름을 곱해 실제 크기 비율대로 그립니다. */
const EARTH_RADIUS = 20;
const GAP = 26;
const TOP_MARGIN = 34;
const BOTTOM_MARGIN = 34;

/**
 * 여덟 행성을 지구와 같은 기준선 위에 실제 비율대로 나란히 그려 보여 주는 "정답표".
 * 게임 도입부에서 예상을 세우게 하거나, 채점 후 전체 크기 감각을 정리할 때 씁니다.
 */
export default function PlanetSizeChart({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const maxR = Math.max(...PLANETS.map((p) => p.relativeDiameter)) * EARTH_RADIUS;
  const baseline = TOP_MARGIN + maxR * 2;
  const height = baseline + BOTTOM_MARGIN;

  let cursorX = GAP;
  const items = PLANETS.map((planet) => {
    const r = planet.relativeDiameter * EARTH_RADIUS;
    const cx = cursorX + r;
    cursorX += r * 2 + GAP;
    return { planet, r, cx };
  });
  const width = cursorX;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="planet-size-title"
        className="panel animate-popIn flex w-full max-w-3xl flex-col gap-4 p-5 sm:p-6"
      >
        <div>
          <h2 id="planet-size-title" className="font-display text-2xl text-beam">
            🪐 행성 크기 비교
          </h2>
          <p className="mt-1 text-sm text-dust">
            지구(1.0배)를 기준으로 여덟 행성의 실제 상대적인 크기를 한눈에 볼 수 있어요.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-edge/60 bg-deep/60 p-3">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
            className="block"
          >
            <line x1={0} y1={baseline} x2={width} y2={baseline} stroke="#2A356B" strokeWidth={1} />
            {items.map(({ planet, r, cx }) => (
              <g key={planet.id}>
                <circle cx={cx} cy={baseline - r} r={r} fill={planet.colorLight} opacity={0.9} />
                <text
                  x={cx}
                  y={baseline - r * 2 - 8}
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
                  {planet.relativeDiameter.toFixed(2)}배
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* 화면 리더 사용자를 위한 표 형태 요약 (위 그림과 같은 내용) */}
        <ul className="sr-only">
          {PLANETS.map((planet) => (
            <li key={planet.id}>
              {planet.name}은(는) 지구 지름의 {planet.relativeDiameter}배예요.
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-dust">
          가로로 넘겨 가며 목성·토성처럼 큰 행성도 함께 볼 수 있어요.
        </p>

        <div className="flex justify-end">
          <Button ref={closeRef} onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
