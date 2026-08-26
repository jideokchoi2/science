import { useCallback, useEffect, useState } from 'react';
import { PLANETS } from '../data/planets';
import { calculateScore } from '../utils/scoring';
import { sfx } from '../utils/sound';
import type { Attempt } from '../types';
import DrawingCanvas from './DrawingCanvas';
import FeedbackPanel from './FeedbackPanel';
import PlanetGlyph from './PlanetGlyph';
import ProgressIndicator from './ProgressIndicator';
import Button from './Button';

interface Props {
  index: number;
  attempts: Attempt[];
  soundOn: boolean;
  reducedMotion: boolean;
  onAttempt: (attempt: Attempt) => void;
  onNext: () => void;
  onQuit: () => void;
}

interface RoundResult {
  ratio: number;
  score: number;
}

/**
 * 한 행성에 대한 라운드를 담당합니다.
 * 그리기 → 채점 → 정답 공개 → 다음 행성 순서로 진행합니다.
 */
export default function GameScreen({
  index,
  attempts,
  soundOn,
  reducedMotion,
  onAttempt,
  onNext,
  onQuit,
}: Props) {
  const planet = PLANETS[index];
  const isLast = index === PLANETS.length - 1;

  const [result, setResult] = useState<RoundResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = useState(false);

  // 행성이 바뀌면 라운드 상태를 초기화합니다.
  useEffect(() => {
    setResult(null);
    setNotice(null);
  }, [index]);

  const handleStrokeComplete = useCallback(
    (ratio: number, roundness: number, method: 'pointer' | 'keyboard') => {
      const score = calculateScore(ratio, planet.relativeDiameter);
      setNotice(null);
      setResult({ ratio, score });
      onAttempt({
        planetId: planet.id,
        drawnRatio: Number(ratio.toFixed(3)),
        trueRatio: planet.relativeDiameter,
        score,
        roundness: Number(roundness.toFixed(3)),
        method,
        timestamp: Date.now(),
      });
      if (soundOn) (score >= 85 ? sfx.great : sfx.soft)();
    },
    [onAttempt, planet, soundOn],
  );

  return (
    <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col gap-3 p-3 sm:p-5">
      {/* 머리말: 진행 상황과 나가기 */}
      <header className="flex items-center justify-between gap-3">
        <ProgressIndicator currentIndex={index} scores={attempts.map((a) => a.score)} />
        <Button variant="quiet" onClick={onQuit}>
          그만하기
        </Button>
      </header>

      {/* 문제: 어떤 행성을 그릴 차례인지 */}
      <section className="panel flex items-center gap-4 p-3 sm:p-4">
        <PlanetGlyph planet={planet} size={64} />
        <div className="min-w-0">
          <p className="text-sm text-dust">
            태양에서 {planet.orderFromSun}번째 행성 · {planet.nameEn}
          </p>
          <h2 className="font-display text-2xl leading-tight sm:text-3xl">
            {planet.name}은(는) 지구보다 얼마나 클까요?
          </h2>
          <p className="text-sm text-dust">
            가운데 지구를 보고 {planet.name}의 크기만큼 동그라미를 그려 보세요.
          </p>
        </div>
      </section>

      {/* 그림판 */}
      <div className="panel relative min-h-[280px] flex-1 overflow-hidden">
        <DrawingCanvas
          planet={planet}
          revealed={result !== null}
          drawnRatio={result?.ratio ?? null}
          onStrokeComplete={handleStrokeComplete}
          onInvalidStroke={setNotice}
          soundOn={soundOn}
          reducedMotion={reducedMotion}
          keyboardMode={keyboardMode}
        />

        {notice && (
          <p
            role="status"
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-rust/90 px-4 py-2 text-sm text-void"
          >
            {notice}
          </p>
        )}
      </div>

      {/* 발판: 채점 결과 또는 입력 방식 안내 */}
      {result ? (
        <FeedbackPanel
          planet={planet}
          drawnRatio={result.ratio}
          score={result.score}
          isLast={isLast}
          onNext={onNext}
        />
      ) : (
        <div className="flex items-center justify-between gap-3 text-sm text-dust">
          <p>손가락이나 마우스로 한 바퀴 이어서 그리면 자동으로 채점돼요.</p>
          <Button variant="quiet" onClick={() => setKeyboardMode((v) => !v)} aria-pressed={keyboardMode}>
            {keyboardMode ? '그려서 답하기' : '키보드로 답하기'}
          </Button>
        </div>
      )}
    </div>
  );
}
