import type { Planet } from '../types';

interface Props {
  planet: Planet;
  size?: number;
}

/**
 * 행성 그림. 외부 이미지 파일 대신 SVG로 그려서
 * 인터넷 연결 없이도 항상 같은 모습으로 보입니다.
 */
export default function PlanetGlyph({ planet, size = 96 }: Props) {
  const gradId = `grad-${planet.id}`;
  const r = 44;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${planet.name} 그림`}
      className="drop-shadow-[0_0_20px_rgba(95,227,214,0.18)]"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={planet.colorLight} />
          <stop offset="100%" stopColor={planet.colorDark} />
        </radialGradient>
      </defs>

      {planet.hasRing && (
        <ellipse
          cx="50"
          cy="52"
          rx="49"
          ry="13"
          fill="none"
          stroke={planet.colorLight}
          strokeWidth="4"
          opacity="0.75"
          transform="rotate(-18 50 52)"
        />
      )}

      <circle cx="50" cy="50" r={r} fill={`url(#${gradId})`} />

      {/* 목성의 줄무늬 */}
      {planet.id === 'jupiter' && (
        <g opacity="0.35" fill={planet.colorDark}>
          <rect x="8" y="38" width="84" height="6" rx="3" />
          <rect x="10" y="54" width="80" height="5" rx="2.5" />
        </g>
      )}

      {/* 지구의 대륙 느낌 */}
      {planet.id === 'earth' && (
        <g opacity="0.55" fill="#3F9B6D">
          <circle cx="38" cy="42" r="12" />
          <circle cx="62" cy="62" r="9" />
        </g>
      )}
    </svg>
  );
}
