import { useEffect, useState } from 'react';
import type { LeaderboardEntry, WinEntry } from '../types';
import { listenLeaderboard, listenWins } from '../utils/multiplayer';
import Button from './Button';

interface Props {
  roomCode: string;
  myPlayerId: string;
  initialTab: 'score' | 'wins';
  onBack: () => void;
}

/** 반 전체 순위표와 랜덤 대결 승수 랭킹을 실시간으로 보여 줍니다. */
export default function LeaderboardScreen({ roomCode, myPlayerId, initialTab, onBack }: Props) {
  const [tab, setTab] = useState<'score' | 'wins'>(initialTab);
  const [scoreRows, setScoreRows] = useState<LeaderboardEntry[] | null>(null);
  const [winRows, setWinRows] = useState<WinEntry[] | null>(null);

  useEffect(() => listenLeaderboard(roomCode, setScoreRows), [roomCode]);
  useEffect(() => listenWins(roomCode, setWinRows), [roomCode]);

  const scoreLoading = scoreRows === null;
  const winLoading = winRows === null;

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-dust">
            반 코드 <span className="tabular">{roomCode}</span>
          </p>
          <h1 className="font-display text-2xl">랭킹</h1>
        </div>
        <Button variant="ghost" onClick={onBack}>
          로비로
        </Button>
      </header>

      <div className="flex gap-2">
        <TabButton active={tab === 'score'} onClick={() => setTab('score')}>
          🏆 전체 순위전
        </TabButton>
        <TabButton active={tab === 'wins'} onClick={() => setTab('wins')}>
          ⚔️ 명예의 전당
        </TabButton>
      </div>

      {tab === 'score' && (
        <section className="panel p-4 sm:p-5">
          {scoreLoading ? (
            <p className="py-6 text-center text-dust">불러오는 중...</p>
          ) : scoreRows.length === 0 ? (
            <p className="py-6 text-center text-dust">아직 아무도 점수를 제출하지 않았어요.</p>
          ) : (
            <ol className="space-y-2">
              {scoreRows.map((row, i) => (
                <li
                  key={row.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    row.id === myPlayerId ? 'bg-beam/10 ring-1 ring-beam/40' : ''
                  }`}
                >
                  <RankBadge rank={i + 1} />
                  <span className="flex-1 truncate font-display">{row.nickname}</span>
                  <span className="tabular font-display text-lg text-flare">{row.totalScore}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {tab === 'wins' && (
        <section className="panel p-4 sm:p-5">
          {winLoading ? (
            <p className="py-6 text-center text-dust">불러오는 중...</p>
          ) : winRows.length === 0 ? (
            <p className="py-6 text-center text-dust">아직 대결 기록이 없어요. 랜덤 대결에서 승리해 보세요!</p>
          ) : (
            <ol className="space-y-2">
              {winRows.map((row, i) => (
                <li
                  key={row.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    row.id === myPlayerId ? 'bg-beam/10 ring-1 ring-beam/40' : ''
                  }`}
                >
                  <RankBadge rank={i + 1} />
                  <span className="flex-1 truncate font-display">{row.nickname}</span>
                  <span className="tabular text-xs text-dust">{row.matches}전</span>
                  <span className="tabular font-display text-lg text-flare">{row.wins}승</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] flex-1 rounded-xl font-display text-sm transition ${
        active ? 'bg-beam text-void' : 'panel text-dust hover:text-chalk'
      }`}
    >
      {children}
    </button>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <span className="tabular flex w-8 shrink-0 items-center justify-center font-display text-sm text-dust">
      {medal ?? rank}
    </span>
  );
}
