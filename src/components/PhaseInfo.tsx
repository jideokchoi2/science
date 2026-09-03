/**
 * 선택된 날짜의 달 위상에 대한 학습 정보를 보여주는 컴포넌트.
 * 위상 이름, 설명, 조도, 달의 나이와 함께 8단계 위상을 한눈에 비교할 수 있는 참고 행을 표시한다.
 */
import { MoonPhaseResult } from './PhaseCalculator';
import { PHASE_DEFINITIONS } from '../utils/moonPhaseUtils';

interface PhaseInfoProps {
  phaseResult: MoonPhaseResult;
}

export default function PhaseInfo({ phaseResult }: PhaseInfoProps) {
  const { phaseDefinition, illumination, ageDays } = phaseResult;

  return (
    <div className="phase-info">
      <div className="phase-info__headline">
        <span className="phase-info__emoji" aria-hidden="true">
          {phaseDefinition.emoji}
        </span>
        <div>
          <h2 className="phase-info__name">{phaseDefinition.name}</h2>
          <p className="phase-info__english-name">{phaseDefinition.englishName}</p>
        </div>
      </div>

      <p className="phase-info__description">{phaseDefinition.description}</p>

      <div className="phase-info__stats">
        <div className="phase-info__stat">
          <span className="phase-info__stat-label">밝게 보이는 비율</span>
          <div className="phase-info__illumination-bar">
            <div className="phase-info__illumination-fill" style={{ width: `${illumination}%` }} />
          </div>
          <span className="phase-info__stat-value">{illumination.toFixed(0)}%</span>
        </div>
        <div className="phase-info__stat">
          <span className="phase-info__stat-label">신월 이후 경과일</span>
          <span className="phase-info__stat-value">{ageDays.toFixed(1)}일 / 29.5일</span>
        </div>
      </div>

      <div className="phase-info__reference" role="list" aria-label="달의 8단계 위상">
        {PHASE_DEFINITIONS.map((phase) => (
          <div
            key={phase.index}
            role="listitem"
            className={`phase-info__reference-item${phase.index === phaseDefinition.index ? ' phase-info__reference-item--active' : ''}`}
            title={phase.name}
          >
            <span className="phase-info__reference-emoji" aria-hidden="true">
              {phase.emoji}
            </span>
            <span className="phase-info__reference-name">{phase.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
