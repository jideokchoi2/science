/**
 * 달의 위상 학습 웹앱의 최상위 컴포넌트.
 * 선택된 날짜 상태를 관리하며, 3D 시각화 / 학습 정보 / 타임라인 / 관찰 / 퀴즈 영역을 조립한다.
 */
import { useMemo, useState } from 'react';
import MoonVisualizer from './components/MoonVisualizer';
import Timeline from './components/Timeline';
import PhaseInfo from './components/PhaseInfo';
import TodayTomorrow from './components/TodayTomorrow';
import QuizGame from './components/QuizGame';
import { calculateMoonPhase } from './components/PhaseCalculator';

/** 오늘 정오를 기준 날짜로 만든다 (시간대 경계에서 날짜가 밀리는 것을 방지). */
function todayAtNoon(): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(todayAtNoon);
  const [showQuiz, setShowQuiz] = useState(false);

  const phaseResult = useMemo(() => calculateMoonPhase(selectedDate), [selectedDate]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>🌙 달의 위상 학습</h1>
        <p>태양-지구-달의 위치 관계를 3D로 살펴보고, 날짜에 따라 달라지는 달의 모양을 배워봐요.</p>
      </header>

      <main className="app__main">
        <section className="app__visual-section">
          <MoonVisualizer phaseFraction={phaseResult.phaseFraction} />
          <Timeline selectedDate={selectedDate} onChange={setSelectedDate} />
        </section>

        <section className="app__info-section">
          <PhaseInfo phaseResult={phaseResult} />
        </section>
      </main>

      <section className="app__observation-section">
        <TodayTomorrow />
      </section>

      <section className="app__quiz-section">
        <button type="button" className="app__quiz-toggle" onClick={() => setShowQuiz((prev) => !prev)}>
          {showQuiz ? '퀴즈 접기 ▲' : '🧩 퀴즈 풀어보기 ▼'}
        </button>
        {showQuiz && <QuizGame />}
      </section>

      <footer className="app__footer">
        <p>초등 과학 · 달의 위상 학습을 위한 인터랙티브 웹앱</p>
      </footer>
    </div>
  );
}
