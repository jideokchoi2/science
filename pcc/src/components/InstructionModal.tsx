import { useEffect, useRef } from 'react';
import Button from './Button';

interface Props {
  onClose: () => void;
}

const STEPS = [
  '화면 가운데에 있는 파란 원이 지구예요. 크기의 기준이 됩니다.',
  '위에 나온 행성이 지구보다 몇 배 큰지 생각해 보세요.',
  '지구를 둘러싸듯이 손가락이나 마우스로 동그라미를 한 바퀴 그립니다.',
  '손을 떼면 그린 원이 자동으로 반듯한 원으로 바뀌고 점수가 나와요.',
  '정답 원이 나타나면 내 원과 얼마나 다른지 눈으로 비교해 보세요.',
];

/** 게임 방법 안내창. Esc 로 닫을 수 있고 열리면 바로 포커스를 받습니다. */
export default function InstructionModal({ onClose }: Props) {
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
        aria-labelledby="how-to-title"
        className="panel animate-popIn w-full max-w-lg p-5 sm:p-6"
      >
        <h2 id="how-to-title" className="font-display text-2xl text-beam">
          게임 방법
        </h2>

        <ol className="mt-4 space-y-3">
          {STEPS.map((text, i) => (
            <li key={i} className="flex gap-3">
              <span className="tabular mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-beam/15 font-display text-sm text-beam">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-chalk/90">{text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-4 rounded-xl border border-edge/60 bg-deep/60 p-3 text-sm text-dust">
          마우스나 터치가 어려우면 게임 화면에서 <b className="text-chalk">키보드로 답하기</b>를 누르세요.
          화살표 키로 크기를 맞추고 Enter 로 제출할 수 있어요.
        </p>

        <div className="mt-5 flex justify-end">
          <Button ref={closeRef} onClick={onClose}>
            알겠어요
          </Button>
        </div>
      </div>
    </div>
  );
}
