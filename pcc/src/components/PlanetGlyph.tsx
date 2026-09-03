import type { Planet } from '../types';

interface Props {
  planet: Planet;
  size?: number;
}

/**
 * 행성 그림. 외부 이미지 파일 대신 SVG로 그려서
 * 인터넷 연결 없이도 항상 같은 모습으로 보이고, 행성마다 실제 특징(줄무늬·고리·크레이터 등)을
 * 살짝 반영해 실제 모습과 비슷하게 그립니다.
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
        <clipPath id={`clip-${planet.id}`}>
          <circle cx="50" cy="50" r={r} />
        </clipPath>
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

      <g clipPath={`url(#clip-${planet.id})`}>
        {/* 수성: 달처럼 팬 크레이터 자국 */}
        {planet.id === 'mercury' && (
          <g opacity="0.4" fill={planet.colorDark}>
            <circle cx="34" cy="34" r="6" />
            <circle cx="60" cy="30" r="4" />
            <circle cx="62" cy="60" r="7" />
            <circle cx="40" cy="66" r="3.5" />
          </g>
        )}

        {/* 금성: 두꺼운 소용돌이 구름 */}
        {planet.id === 'venus' && (
          <g opacity="0.4" fill="none" stroke={planet.colorDark} strokeWidth="4" strokeLinecap="round">
            <path d="M12 40 Q40 30 70 42" />
            <path d="M18 58 Q48 68 86 56" />
          </g>
        )}

        {/* 지구의 대륙과 구름 */}
        {planet.id === 'earth' && (
          <>
            <g opacity="0.55" fill="#3F9B6D">
              <circle cx="38" cy="42" r="12" />
              <circle cx="62" cy="62" r="9" />
            </g>
            <g opacity="0.5" fill="#F4FBFF">
              <ellipse cx="66" cy="32" rx="13" ry="4.5" />
              <ellipse cx="30" cy="70" rx="10" ry="3.5" />
            </g>
          </>
        )}

        {/* 화성: 붉은 대지 무늬와 극관 */}
        {planet.id === 'mars' && (
          <>
            <g opacity="0.35" fill={planet.colorDark}>
              <circle cx="40" cy="46" r="10" />
              <circle cx="64" cy="58" r="7" />
            </g>
            <ellipse cx="50" cy="12" rx="10" ry="6" fill="#F4FBFF" opacity="0.85" />
          </>
        )}

        {/* 목성: 줄무늬 + 대적점 */}
        {planet.id === 'jupiter' && (
          <>
            <g opacity="0.35" fill={planet.colorDark}>
              <rect x="6" y="30" width="88" height="6" rx="3" />
              <rect x="8" y="46" width="84" height="5" rx="2.5" />
              <rect x="6" y="60" width="88" height="6" rx="3" />
            </g>
            <ellipse cx="66" cy="53" rx="9" ry="6" fill="#C1613B" opacity="0.7" />
          </>
        )}

        {/* 토성: 옅은 줄무늬 */}
        {planet.id === 'saturn' && (
          <g opacity="0.3" fill={planet.colorDark}>
            <rect x="6" y="38" width="88" height="5" rx="2.5" />
            <rect x="6" y="52" width="88" height="5" rx="2.5" />
          </g>
        )}

        {/* 천왕성: 옅고 매끈한 청록 안개 띠 */}
        {planet.id === 'uranus' && (
          <g opacity="0.3" fill={planet.colorDark}>
            <ellipse cx="50" cy="50" rx="46" ry="12" />
          </g>
        )}

        {/* 해왕성: 짙은 줄무늬 + 대암점 */}
        {planet.id === 'neptune' && (
          <>
            <g opacity="0.3" fill={planet.colorDark}>
              <rect x="6" y="34" width="88" height="6" rx="3" />
              <rect x="6" y="58" width="88" height="5" rx="2.5" />
            </g>
            <ellipse cx="36" cy="46" rx="7" ry="5" fill="#16205A" opacity="0.6" />
          </>
        )}
      </g>

      {/* 표면 위 은은한 하이라이트로 구체감 표현 */}
      <ellipse cx="38" cy="34" rx="16" ry="10" fill="#FFFFFF" opacity="0.12" />
    </svg>
  );
}
