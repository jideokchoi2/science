import { PLANETS } from '../data/planets';

interface Props {
  currentIndex: number;
  scores: number[];
}

/**
 * 몇 번째 행성인지, 지금까지 어떤 행성을 마쳤는지 보여 줍니다.
 * 순서 자체가 태양에서 가까운 차례라서 점의 나열이 의미를 가집니다.
 */
export default function ProgressIndicator({ currentIndex, scores }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="tabular font-display text-sm text-dust">
        {currentIndex + 1} / {PLANETS.length}
      </span>
      <ol className="flex items-center gap-1.5" aria-label="진행 상황">
        {PLANETS.map((planet, i) => {
          const done = i < scores.length;
          const current = i === currentIndex;
          return (
            <li key={planet.id}>
              <span
                className={[
                  'block rounded-full transition-all',
                  current ? 'h-3 w-6 bg-beam' : 'h-3 w-3',
                  !current && done ? 'bg-flare/80' : '',
                  !current && !done ? 'bg-edge' : '',
                ].join(' ')}
                title={`${planet.name}${done ? ` ${scores[i]}점` : ''}`}
              />
              <span className="sr-only">
                {planet.name} {done ? `${scores[i]}점 완료` : current ? '진행 중' : '남음'}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
