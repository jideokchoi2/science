import { useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Props {
  count?: number;
}

/**
 * 배경 별. 화면을 가리지 않도록 aria-hidden 처리하고,
 * 동작 줄이기 설정이 켜져 있으면 반짝임을 멈춥니다.
 */
export default function StarField({ count = 90 }: Props) {
  const reduced = useReducedMotion();

  // 별의 위치는 한 번만 정해 두고 다시 계산하지 않습니다.
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.2 + 0.8,
        delay: Math.random() * 3,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#1B2559_0%,#0D1330_45%,#070B1C_100%)]" />
      {stars.map((s) => (
        <span
          key={s.id}
          className={`absolute rounded-full bg-chalk ${reduced ? 'opacity-60' : 'animate-twinkle'}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
