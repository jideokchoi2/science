import { useMemo, useState } from 'react';
import { buildAnalytics } from '../utils/analytics';
import { clearSessions } from '../utils/storage';
import type { GameSession } from '../types';
import Button from './Button';

interface Props {
  sessions: GameSession[];
  onBack: () => void;
  onCleared: () => void;
}

/**
 * 교사용 화면. 이 기기에 저장된 기록만 모아 보여 줍니다.
 * 학생 이름 같은 개인 정보는 저장하지 않습니다.
 */
export default function TeacherDashboard({ sessions, onBack, onCleared }: Props) {
  const stats = useMemo(() => buildAnalytics(sessions), [sessions]);
  const [confirming, setConfirming] = useState(false);

  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">선생님 화면</h1>
          <p className="text-sm text-dust">이 기기에 저장된 기록으로 만든 학습 분석이에요.</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          돌아가기
        </Button>
      </header>

      {sessions.length === 0 ? (
        <p className="panel p-6 text-center text-dust">
          아직 저장된 기록이 없어요. 한 판을 끝까지 마치면 여기에 결과가 쌓입니다.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-3">
            <Metric label="플레이한 판" value={`${stats.sessionCount}`} />
            <Metric label="전체 문항 수" value={`${stats.attemptCount}`} />
            <Metric label="평균 점수" value={`${stats.overallAverage}`} />
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="font-display text-lg">행성별 정확도</h2>
            <p className="mt-1 text-sm text-dust">
              막대는 평균 점수, 오른쪽 숫자는 실제보다 크게 그린 학생의 비율이에요.
            </p>

            <ul className="mt-3 space-y-2">
              {stats.planetStats.map((row) => (
                <li key={row.planetId} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-display text-sm">{row.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-deep">
                    <div
                      className="h-full rounded-full bg-beam"
                      style={{ width: `${row.averageScore}%` }}
                    />
                  </div>
                  <span className="tabular w-24 shrink-0 text-right text-xs text-dust">
                    {row.attempts ? `${row.averageScore}점 · ${row.attempts}회` : '기록 없음'}
                  </span>
                  <span className="tabular w-24 shrink-0 text-right text-xs text-flare">
                    {row.attempts ? `크게 ${row.overestimateRate}%` : '-'}
                  </span>
                </li>
              ))}
            </ul>

            {stats.weakestPlanet && (
              <p className="mt-4 rounded-xl border border-edge/60 bg-deep/60 p-3 text-sm">
                <span className="mr-2 font-display text-beam">수업 참고</span>
                평균이 가장 낮은 행성은 <b>{stats.weakestPlanet.name}</b>(
                {stats.weakestPlanet.averageScore}점)이에요. 지구와 몇 배 차이인지 다시 짚어 주면 좋겠어요.
              </p>
            )}
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="font-display text-lg">판별 평균 추이</h2>
            <div className="mt-4 flex h-32 items-end gap-2">
              {stats.trend.map((point, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="tabular text-[11px] text-dust">{point.average}</span>
                  <div
                    className="w-full rounded-t bg-flare/70"
                    style={{ height: `${Math.max(2, point.average)}%` }}
                    title={`${point.label} 평균 ${point.average}점`}
                  />
                  <span className="text-[11px] text-dust">{point.label}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 pb-6">
            {confirming ? (
              <>
                <span className="self-center text-sm text-dust">모든 기록을 지울까요?</span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearSessions();
                    setConfirming(false);
                    onCleared();
                  }}
                >
                  네, 지웁니다
                </Button>
                <Button variant="quiet" onClick={() => setConfirming(false)}>
                  취소
                </Button>
              </>
            ) : (
              <Button variant="quiet" onClick={() => setConfirming(true)}>
                기록 모두 지우기
              </Button>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4 text-center">
      <p className="tabular font-display text-3xl text-beam">{value}</p>
      <p className="mt-1 text-xs text-dust">{label}</p>
    </div>
  );
}
