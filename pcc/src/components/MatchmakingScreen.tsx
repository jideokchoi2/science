import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlanet } from '../data/planets';
import { calculateScore, getGrade } from '../utils/scoring';
import {
  joinQueue,
  leaveQueue,
  listenMatch,
  listenMyQueueStatus,
  submitMatchScore,
} from '../utils/multiplayer';
import { sfx } from '../utils/sound';
import type { MatchDoc } from '../types';
import Button from './Button';
import DrawingCanvas from './DrawingCanvas';
import PlanetGlyph from './PlanetGlyph';

interface Props {
  roomCode: string;
  playerId: string;
  nickname: string;
  soundOn: boolean;
  reducedMotion: boolean;
  onBack: () => void;
}

type Stage = 'idle' | 'waiting' | 'playing' | 'result';

const MATCH_SECONDS = 20;

/** 대기열 → 실시간 1:1 대결 → 결과까지 한 화면에서 진행합니다. */
export default function MatchmakingScreen({
  roomCode,
  playerId,
  nickname,
  soundOn,
  reducedMotion,
  onBack,
}: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchDoc | null>(null);
  const [myRatio, setMyRatio] = useState<number | null>(null);
  const [mySubmitted, setMySubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(MATCH_SECONDS);

  const stageRef = useRef(stage);
  stageRef.current = stage;
  const mySubmittedRef = useRef(false);
  mySubmittedRef.current = mySubmitted;

  // 대기열 상태 구독 (다른 학생이 나를 매칭해 줄 때까지)
  useEffect(() => {
    if (stage !== 'waiting') return;
    const unsub = listenMyQueueStatus(roomCode, playerId, (id) => {
      setMatchId(id);
      setStage('playing');
    });
    return unsub;
  }, [stage, roomCode, playerId]);

  // 매치 문서 구독
  useEffect(() => {
    if (!matchId) return;
    const unsub = listenMatch(roomCode, matchId, (m) => {
      setMatch(m);
      if (m?.status === 'done') setStage('result');
    });
    return unsub;
  }, [matchId, roomCode]);

  // 컴포넌트를 벗어나면 대기열에서 빠집니다.
  useEffect(() => {
    return () => {
      if (stageRef.current === 'waiting') void leaveQueue(roomCode, playerId);
    };
  }, [roomCode, playerId]);

  // 20초 카운트다운. 시간이 다 되면 아직 안 그렸어도 0점으로 자동 제출합니다.
  useEffect(() => {
    if (stage !== 'playing' || !match) return;
    const tick = () => {
      const elapsed = (Date.now() - match.createdAt) / 1000;
      const left = Math.max(0, Math.ceil(MATCH_SECONDS - elapsed));
      setSecondsLeft(left);
      if (left === 0 && !mySubmittedRef.current) {
        mySubmittedRef.current = true;
        setMySubmitted(true);
        setMyRatio(0);
        void submitMatchScore(roomCode, matchId!, playerId, 0);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [stage, match, roomCode, matchId, playerId]);

  const handleStart = useCallback(async () => {
    setNotice(null);
    setMySubmitted(false);
    setMyRatio(null);
    setMatch(null);
    const id = await joinQueue(roomCode, playerId, nickname);
    if (id) {
      setMatchId(id);
      setStage('playing');
    } else {
      setStage('waiting');
    }
  }, [roomCode, playerId, nickname]);

  const handleCancelWaiting = useCallback(async () => {
    await leaveQueue(roomCode, playerId);
    setStage('idle');
  }, [roomCode, playerId]);

  const handleStroke = useCallback(
    (ratio: number) => {
      if (mySubmittedRef.current || !matchId) return;
      mySubmittedRef.current = true;
      setMySubmitted(true);
      setMyRatio(ratio);
      const planet = getPlanet(match!.planetId);
      const score = calculateScore(ratio, planet.relativeDiameter);
      if (soundOn) (score >= 85 ? sfx.great : sfx.soft)();
      void submitMatchScore(roomCode, matchId, playerId, score);
    },
    [match, matchId, roomCode, playerId, soundOn],
  );

  const opponentName = match
    ? match.player1Id === playerId
      ? match.player2Name
      : match.player1Name
    : '';

  // ── 대기 중 ──────────────────────────────────────────────
  if (stage === 'idle') {
    return (
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
        <span aria-hidden className="text-5xl">⚔️</span>
        <h1 className="font-display text-3xl">랜덤 대결</h1>
        <p className="text-dust">
          같은 반 친구와 무작위로 짝지어져서
          <br />
          같은 행성을 20초 안에 그려요. 점수가 높은 쪽이 승리!
        </p>
        <Button onClick={handleStart}>매칭 시작</Button>
        <Button variant="quiet" onClick={onBack}>
          로비로
        </Button>
      </main>
    );
  }

  if (stage === 'waiting') {
    return (
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
        <span aria-hidden className="animate-twinkle text-5xl">
          🔭
        </span>
        <h1 className="font-display text-2xl">상대를 찾는 중...</h1>
        <p className="text-dust">같은 반 친구가 매칭 버튼을 누르면 바로 시작돼요.</p>
        <Button variant="ghost" onClick={handleCancelWaiting}>
          취소
        </Button>
      </main>
    );
  }

  // ── 대결 중 / 결과 ───────────────────────────────────────
  if (!match) {
    return (
      <main className="relative z-10 flex min-h-[100dvh] items-center justify-center">
        <p className="text-dust">연결하는 중...</p>
      </main>
    );
  }

  const planet = getPlanet(match.planetId);

  if (stage === 'result') {
    const myScore = match.player1Id === playerId ? match.player1Score : match.player2Score;
    const opponentScore = match.player1Id === playerId ? match.player2Score : match.player1Score;
    const iWon = match.winnerId === playerId;
    const isDraw = match.winnerId === 'draw';

    return (
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
        <PlanetGlyph planet={planet} size={72} />
        <p className="text-dust">{planet.name} 대결</p>
        <h1 className="font-display text-4xl" style={{ color: isDraw ? '#F0DCA8' : iWon ? '#5FE3D6' : '#E4794C' }}>
          {isDraw ? '무승부!' : iWon ? '승리했어요! 🎉' : '아쉬워요'}
        </h1>

        <div className="panel flex w-full items-center justify-around p-4">
          <div>
            <p className="text-sm text-dust">{nickname}</p>
            <p className="tabular font-display text-3xl text-beam">{myScore ?? 0}</p>
          </div>
          <span className="text-dust">vs</span>
          <div>
            <p className="text-sm text-dust">{opponentName}</p>
            <p className="tabular font-display text-3xl text-flare">{opponentScore ?? 0}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleStart}>다시 대결하기</Button>
          <Button variant="ghost" onClick={onBack}>
            로비로
          </Button>
        </div>
      </main>
    );
  }

  // stage === 'playing'
  return (
    <div className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-3xl flex-col gap-3 p-3 sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm text-dust">
          {nickname} <span className="text-dust/60">vs</span> {opponentName}
        </p>
        <span
          className={`tabular font-display text-2xl ${secondsLeft <= 5 ? 'text-rust' : 'text-beam'}`}
          aria-live="polite"
        >
          {secondsLeft}초
        </span>
      </header>

      <section className="panel flex items-center gap-4 p-3 sm:p-4">
        <PlanetGlyph planet={planet} size={56} />
        <div>
          <p className="text-sm text-dust">태양에서 {planet.orderFromSun}번째 행성</p>
          <h2 className="font-display text-xl">{planet.name}은(는) 지구보다 얼마나 클까요?</h2>
        </div>
      </section>

      <div className="panel relative min-h-[240px] flex-1 overflow-hidden">
        <DrawingCanvas
          planet={planet}
          revealed={mySubmitted}
          drawnRatio={myRatio}
          onStrokeComplete={handleStroke}
          onInvalidStroke={setNotice}
          soundOn={soundOn}
          reducedMotion={reducedMotion}
          keyboardMode={false}
        />
        {notice && !mySubmitted && (
          <p
            role="status"
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-rust/90 px-4 py-2 text-sm text-void"
          >
            {notice}
          </p>
        )}
      </div>

      {mySubmitted ? (
        <p className="rounded-xl border border-edge/60 bg-deep/60 p-3 text-center text-sm">
          제출 완료! (내 점수 {getGrade(calculateScore(myRatio ?? 0, planet.relativeDiameter)).label}) {opponentName}
          님을 기다리는 중...
        </p>
      ) : (
        <p className="text-center text-sm text-dust">
          한 바퀴 이어서 그리면 바로 채점되고 제출돼요. 시간 안에 그려 주세요!
        </p>
      )}
    </div>
  );
}
