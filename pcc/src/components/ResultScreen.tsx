import { getPlanet } from '../data/planets';
import { getGrade } from '../utils/scoring';
import type { Attempt, Badge } from '../types';
import BadgeShelf from './BadgeShelf';
import Button from './Button';
import PlanetSizeCompare from './PlanetSizeCompare';

interface Props {
  attempts: Attempt[];
  badges: Badge[];
  onReplay: () => void;
  onHome: () => void;
  onTeacher: () => void;
  /** 경쟁 모드로 들어와 있을 때만 채워집니다. */
  roomCode?: string;
  onViewLeaderboard?: () => void;
  onRoomLobby?: () => void;
}

/** 한 판을 마친 뒤의 성적표. 행성별로 어디서 어긋났는지 한눈에 보이게 정리합니다. */
export default function ResultScreen({
  attempts,
  badges,
  onReplay,
  onHome,
  onTeacher,
  roomCode,
  onViewLeaderboard,
  onRoomLobby,
}: Props) {
  const total = attempts.reduce((sum, a) => sum + a.score, 0);
  const average = attempts.length ? Math.round(total / attempts.length) : 0;
  const grade = getGrade(average);
  const best = attempts.length
    ? attempts.reduce((max, a) => (a.score > max.score ? a : max))
    : null;

  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <header className="panel animate-popIn p-5 text-center">
        <p className="font-display text-sm tracking-[0.25em] text-beam">관측 완료</p>
        <p className="tabular mt-2 font-display text-6xl" style={{ color: grade.color }}>
          {total}
        </p>
        <p className="text-dust">
          총점 (8행성 · 평균 <span className="tabular">{average}</span>점)
        </p>
        <p className="mt-2 font-display text-xl" style={{ color: grade.color }}>
          {grade.label}
        </p>
        {best && (
          <p className="mt-1 text-sm text-dust">
            가장 잘 맞힌 행성은 {getPlanet(best.planetId).name} ({best.score}점)이에요.
          </p>
        )}
      </header>

      <section className="panel animate-driftUp p-4 sm:p-5">
        <h2 className="font-display text-lg">한눈에 비교하기</h2>
        <p className="mt-1 text-sm text-dust">
          여덟 행성을 나란히 놓고, 내가 그린 원과 실제 크기가 얼마나 가까웠는지 확인해 보세요.
        </p>
        <div className="mt-3">
          <PlanetSizeCompare attempts={attempts} />
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <h2 className="font-display text-lg">행성별 기록</h2>
        <ul className="mt-3 space-y-2">
          {attempts.map((attempt) => {
            const planet = getPlanet(attempt.planetId);
            return (
              <li key={attempt.planetId} className="flex items-center gap-3">
                <span className="w-14 shrink-0 font-display text-sm">{planet.name}</span>

                {/* 점수 막대 */}
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-deep">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${attempt.score}%`, background: getGrade(attempt.score).color }}
                  />
                </div>

                <span className="tabular w-11 text-right font-display text-sm">{attempt.score}</span>
                <span className="tabular w-32 shrink-0 text-right text-xs text-dust">
                  {attempt.drawnRatio.toFixed(2)}배 → 실제 {attempt.trueRatio}배
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel p-4 sm:p-5">
        <BadgeShelf earned={badges} />
      </section>

      {roomCode && (
        <p className="rounded-xl border border-beam/40 bg-beam/10 p-3 text-center text-sm text-chalk/90">
          🏆 <span className="tabular">{roomCode}</span> 반 순위표에 총점 {total}점을 제출했어요!
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3 pb-6">
        <Button onClick={onReplay}>다시 도전하기</Button>
        {roomCode ? (
          <>
            <Button variant="ghost" onClick={onViewLeaderboard}>
              반 순위표 보기
            </Button>
            <Button variant="quiet" onClick={onRoomLobby}>
              방 로비로
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onHome}>
              첫 화면으로
            </Button>
            <Button variant="quiet" onClick={onTeacher}>
              선생님 화면
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
