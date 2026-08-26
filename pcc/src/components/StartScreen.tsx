import { PLANETS } from '../data/planets';
import Button from './Button';
import PlanetGlyph from './PlanetGlyph';

interface Props {
  soundOn: boolean;
  highContrast: boolean;
  onStart: () => void;
  onHowTo: () => void;
  onTeacher: () => void;
  onCompete: () => void;
  onToggleSound: () => void;
  onToggleContrast: () => void;
}

/** 첫 화면. 게임의 핵심 동작(원 그리기)을 그림으로 먼저 보여 줍니다. */
export default function StartScreen({
  soundOn,
  highContrast,
  onStart,
  onHowTo,
  onTeacher,
  onCompete,
  onToggleSound,
  onToggleContrast,
}: Props) {
  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      {/* 지구를 감싼 손그림 원 = 이 게임이 하는 일 그 자체 */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle
            cx="80"
            cy="80"
            r="66"
            fill="none"
            stroke="#5FE3D6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="404"
            strokeDashoffset="26"
            transform="rotate(-95 80 80)"
            opacity="0.9"
          />
        </svg>
        <PlanetGlyph planet={PLANETS[2]} size={68} />
      </div>

      <div>
        <p className="font-display text-sm tracking-[0.3em] text-beam">초등 과학 · 태양계와 별</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">행성 크기 그리기 챌린지</h1>
        <p className="mt-3 text-base text-dust sm:text-lg">
          지구를 기준으로 여덟 행성의 크기를 손으로 그려 보며
          <br className="hidden sm:block" /> 상대적인 크기를 몸으로 익혀요.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onStart} className="px-10">
          시작하기
        </Button>
        <Button variant="ghost" onClick={onHowTo}>
          게임 방법
        </Button>
      </div>

      <Button variant="ghost" onClick={onCompete} className="px-8">
        ⚔️ 친구들과 경쟁하기
      </Button>

      <div className="panel flex flex-wrap items-center justify-center gap-2 p-2">
        <Button variant="quiet" onClick={onToggleSound} aria-pressed={soundOn}>
          {soundOn ? '🔊 소리 켜짐' : '🔈 소리 꺼짐'}
        </Button>
        <Button variant="quiet" onClick={onToggleContrast} aria-pressed={highContrast}>
          {highContrast ? '◐ 고대비 켜짐' : '◑ 고대비 꺼짐'}
        </Button>
        <Button variant="quiet" onClick={onTeacher}>
          선생님 화면
        </Button>
      </div>
    </main>
  );
}
