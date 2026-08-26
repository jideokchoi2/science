import { directionHint, getGrade, percentError } from '../utils/scoring';
import type { Planet } from '../types';
import Button from './Button';

interface Props {
  planet: Planet;
  drawnRatio: number;
  score: number;
  isLast: boolean;
  onNext: () => void;
}

/**
 * 채점 직후 보여 주는 안내판.
 * 점수 → 얼마나 차이 났는지 → 과학 상식 순서로 읽히도록 배치했습니다.
 */
export default function FeedbackPanel({ planet, drawnRatio, score, isLast, onNext }: Props) {
  const grade = getGrade(score);
  const gap = percentError(drawnRatio, planet.relativeDiameter);

  return (
    <section className="panel animate-driftUp p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="tabular font-display text-4xl" style={{ color: grade.color }}>
            {score}
          </span>
          <span className="font-display text-lg" style={{ color: grade.color }}>
            {grade.label}
          </span>
        </div>

        <dl className="flex gap-5 text-sm">
          <div>
            <dt className="text-dust">내가 그린 크기</dt>
            <dd className="tabular font-display text-lg text-flare">지구의 {drawnRatio.toFixed(2)}배</dd>
          </div>
          <div>
            <dt className="text-dust">실제 크기</dt>
            <dd className="tabular font-display text-lg" style={{ color: planet.colorLight }}>
              지구의 {planet.relativeDiameter}배
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-3 text-sm text-chalk/90">
        {grade.message}{' '}
        <span className="text-dust">
          ({directionHint(drawnRatio, planet.relativeDiameter)} · 실제와 약 {gap}% 차이)
        </span>
      </p>

      <p className="mt-3 rounded-xl border border-edge/60 bg-deep/60 p-3 text-sm leading-relaxed text-chalk/90">
        <span className="mr-2 font-display text-beam">알고 가기</span>
        {planet.fact}
      </p>

      <div className="mt-4 flex justify-end">
        <Button onClick={onNext} autoFocus>
          {isLast ? '결과 보기' : '다음 행성으로'}
        </Button>
      </div>
    </section>
  );
}
