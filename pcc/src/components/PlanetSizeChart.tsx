import { useEffect, useRef } from 'react';
import Button from './Button';
import PlanetSizeCompare from './PlanetSizeCompare';

interface Props {
  onClose: () => void;
}

/**
 * "행성 크기 비교" 정답표를 여는 모달. 실제 그래프는 PlanetSizeCompare 가 그리며,
 * 이 컴포넌트는 다이얼로그 뼈대(포커스·Esc 닫기·배경)만 담당합니다.
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

        <PlanetSizeCompare />

        <div className="flex justify-end">
          <Button ref={closeRef} onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
