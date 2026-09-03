interface Props {
  size?: number;
}

/**
 * 태양 그림. PlanetGlyph 와 짝을 이루는 SVG로, 이글거리는 표면과
 * 은은하게 퍼지는 코로나(빛무리)를 표현해 '거대한 별'이라는 느낌을 줍니다.
 */
export default function SunGlyph({ size = 96 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-25 -25 150 150"
      role="img"
      aria-label="태양 그림"
      className="drop-shadow-[0_0_45px_rgba(255,164,60,0.55)]"
    >
      <defs>
        <radialGradient id="sun-core" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFF6D9" />
          <stop offset="55%" stopColor="#FFD066" />
          <stop offset="100%" stopColor="#FF7A18" />
        </radialGradient>
        <radialGradient id="sun-corona" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#FFB35C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFB35C" stopOpacity="0" />
        </radialGradient>
        <clipPath id="sun-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>

      {/* 코로나(빛무리) */}
      <circle cx="50" cy="50" r="74" fill="url(#sun-corona)" />

      {/* 방사형 플레어(태양 빛살) */}
      <g stroke="#FFC46B" strokeWidth="3" strokeLinecap="round" opacity="0.6">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = 50 + Math.cos(angle) * 50;
          const y1 = 50 + Math.sin(angle) * 50;
          const x2 = 50 + Math.cos(angle) * 62;
          const y2 = 50 + Math.sin(angle) * 62;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      <circle cx="50" cy="50" r="44" fill="url(#sun-core)" />

      {/* 이글거리는 표면(플라즈마 무늬) */}
      <g clipPath="url(#sun-clip)" opacity="0.35" fill="#FF7A18">
        <ellipse cx="30" cy="60" rx="14" ry="8" />
        <ellipse cx="66" cy="34" rx="12" ry="7" />
        <ellipse cx="68" cy="70" rx="10" ry="6" />
      </g>

      <ellipse cx="38" cy="32" rx="16" ry="10" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}
