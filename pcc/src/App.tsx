import { lazy, Suspense, useCallback, useState } from 'react';
import GameScreen from './components/GameScreen';
import InstructionModal from './components/InstructionModal';
import PlanetSizeChart from './components/PlanetSizeChart';
import ResultScreen from './components/ResultScreen';
import StarField from './components/StarField';
import StartScreen from './components/StartScreen';
import TeacherDashboard from './components/TeacherDashboard';
import { PLANETS } from './data/planets';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSettings } from './hooks/useSettings';
import { evaluateBadges } from './utils/badges';
import { sfx } from './utils/sound';
import { loadSessions, saveSession } from './utils/storage';
import type { Attempt, Badge, GameSession, Screen } from './types';

/**
 * 경쟁 모드는 Firebase(약 200KB)를 함께 불러옵니다.
 * 혼자 푸는 학생은 이 용량을 받지 않도록 실제로 버튼을 누를 때만 불러옵니다.
 */
const RoomEntryScreen = lazy(() => import('./components/RoomEntryScreen'));
const RoomLobbyScreen = lazy(() => import('./components/RoomLobbyScreen'));
const LeaderboardScreen = lazy(() => import('./components/LeaderboardScreen'));
const MatchmakingScreen = lazy(() => import('./components/MatchmakingScreen'));

function ScreenLoading() {
  return (
    <div className="relative z-10 flex min-h-[100dvh] items-center justify-center">
      <p className="text-dust">불러오는 중...</p>
    </div>
  );
}

interface MultiplayerSession {
  roomCode: string;
  playerId: string;
  nickname: string;
}

/** 화면 전환과 한 판의 기록을 관리하는 최상위 컴포넌트 */
export default function App() {
  const { settings, toggle } = useSettings();
  const reducedMotion = useReducedMotion();

  const [screen, setScreen] = useState<Screen>('start');
  const [previousScreen, setPreviousScreen] = useState<Screen>('start');
  const [showHowTo, setShowHowTo] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [sessions, setSessions] = useState<GameSession[]>(() => loadSessions());
  const [badges, setBadges] = useState<Badge[]>([]);

  // 경쟁 모드(반 코드로 입장했을 때만 값이 채워집니다)
  const [mp, setMp] = useState<MultiplayerSession | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'score' | 'wins'>('score');

  const startGame = useCallback(() => {
    setIndex(0);
    setAttempts([]);
    setBadges([]);
    setStartedAt(Date.now());
    setScreen('game');
  }, []);

  const handleAttempt = useCallback((attempt: Attempt) => {
    setAttempts((prev) => [...prev, attempt]);
  }, []);

  /** 다음 행성으로 넘어가거나, 마지막이면 한 판을 마무리합니다. */
  const handleNext = useCallback(() => {
    if (index < PLANETS.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    const total = attempts.reduce((sum, a) => sum + a.score, 0);
    const session: GameSession = {
      id: `${startedAt}`,
      startedAt,
      finishedAt: Date.now(),
      attempts,
      totalScore: total,
      averageScore: attempts.length ? total / attempts.length : 0,
    };

    setBadges(evaluateBadges(attempts, sessions));
    setSessions(saveSession(session));
    if (settings.sound) sfx.finish();

    // 경쟁 모드 중이었다면 반 순위표에도 총점을 올립니다.
    if (mp) {
      void import('./utils/multiplayer').then(({ submitLeaderboardScore }) =>
        submitLeaderboardScore(mp.roomCode, mp.playerId, mp.nickname, total),
      );
    }

    setScreen('result');
  }, [attempts, index, mp, sessions, settings.sound, startedAt]);

  const openTeacher = useCallback(() => {
    setPreviousScreen(screen);
    setScreen('teacher');
  }, [screen]);

  const handleEnterRoom = useCallback(async (roomCode: string, nickname: string) => {
    const { getPlayerId } = await import('./utils/multiplayer');
    setMp({ roomCode, playerId: getPlayerId(roomCode), nickname });
    setScreen('roomLobby');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setMp(null);
    setScreen('start');
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <StarField count={reducedMotion ? 45 : 90} />

      {screen === 'start' && (
        <StartScreen
          soundOn={settings.sound}
          highContrast={settings.highContrast}
          onStart={startGame}
          onHowTo={() => setShowHowTo(true)}
          onShowSizes={() => setShowSizeChart(true)}
          onTeacher={openTeacher}
          onCompete={() => setScreen(mp ? 'roomLobby' : 'roomEntry')}
          onToggleSound={() => toggle('sound')}
          onToggleContrast={() => toggle('highContrast')}
        />
      )}

      {screen === 'roomEntry' && (
        <Suspense fallback={<ScreenLoading />}>
          <RoomEntryScreen onEnter={handleEnterRoom} onBack={() => setScreen('start')} />
        </Suspense>
      )}

      {screen === 'roomLobby' && mp && (
        <Suspense fallback={<ScreenLoading />}>
          <RoomLobbyScreen
            roomCode={mp.roomCode}
            nickname={mp.nickname}
            onSoloChallenge={startGame}
            onRandomMatch={() => setScreen('matchmaking')}
            onLeaderboard={() => {
              setLeaderboardTab('score');
              setScreen('leaderboard');
            }}
            onHallOfFame={() => {
              setLeaderboardTab('wins');
              setScreen('leaderboard');
            }}
            onLeaveRoom={handleLeaveRoom}
          />
        </Suspense>
      )}

      {screen === 'leaderboard' && mp && (
        <Suspense fallback={<ScreenLoading />}>
          <LeaderboardScreen
            roomCode={mp.roomCode}
            myPlayerId={mp.playerId}
            initialTab={leaderboardTab}
            onBack={() => setScreen('roomLobby')}
          />
        </Suspense>
      )}

      {screen === 'matchmaking' && mp && (
        <Suspense fallback={<ScreenLoading />}>
          <MatchmakingScreen
            roomCode={mp.roomCode}
            playerId={mp.playerId}
            nickname={mp.nickname}
            soundOn={settings.sound}
            reducedMotion={reducedMotion}
            onBack={() => setScreen('roomLobby')}
          />
        </Suspense>
      )}

      {screen === 'game' && (
        <GameScreen
          index={index}
          attempts={attempts}
          soundOn={settings.sound}
          reducedMotion={reducedMotion}
          onAttempt={handleAttempt}
          onNext={handleNext}
          onQuit={() => setScreen(mp ? 'roomLobby' : 'start')}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          attempts={attempts}
          badges={badges}
          onReplay={startGame}
          onHome={() => setScreen('start')}
          onTeacher={openTeacher}
          roomCode={mp?.roomCode}
          onViewLeaderboard={() => {
            setLeaderboardTab('score');
            setScreen('leaderboard');
          }}
          onRoomLobby={() => setScreen('roomLobby')}
        />
      )}

      {screen === 'teacher' && (
        <TeacherDashboard
          sessions={sessions}
          onBack={() => setScreen(previousScreen)}
          onCleared={() => setSessions([])}
        />
      )}

      {showHowTo && <InstructionModal onClose={() => setShowHowTo(false)} />}
      {showSizeChart && <PlanetSizeChart onClose={() => setShowSizeChart(false)} />}
    </div>
  );
}
