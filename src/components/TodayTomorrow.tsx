/**
 * 관찰 기능: 오늘과 내일의 달 위상을 카드 형태로 나란히 보여준다.
 * 실제 오늘 날짜를 기준으로 계산하며, 타임라인에서 선택한 날짜와는 별개로 항상 "지금"을 보여준다.
 */
import { useMemo } from 'react';
import { calculateMoonPhase } from './PhaseCalculator';
import { addDays } from '../utils/moonPhaseUtils';

export default function TodayTomorrow() {
  const { today, tomorrow } = useMemo(() => {
    const now = new Date();
    return {
      today: calculateMoonPhase(now),
      tomorrow: calculateMoonPhase(addDays(now, 1)),
    };
  }, []);

  return (
    <div className="today-tomorrow">
      <h2 className="today-tomorrow__title">🔭 오늘과 내일의 달</h2>
      <div className="today-tomorrow__cards">
        {[
          { label: '오늘', result: today },
          { label: '내일', result: tomorrow },
        ].map(({ label, result }) => (
          <div key={label} className="today-tomorrow__card">
            <span className="today-tomorrow__label">{label}</span>
            <span className="today-tomorrow__emoji" aria-hidden="true">
              {result.phaseDefinition.emoji}
            </span>
            <span className="today-tomorrow__name">{result.phaseDefinition.name}</span>
            <span className="today-tomorrow__illumination">밝기 {result.illumination.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
