/**
 * 날짜를 선택하는 인터랙티브 타임라인 UI.
 * 날짜를 바꾸면 상위 컴포넌트(App)로 알려서 3D 시각화와 학습 정보가 함께 갱신되게 한다.
 */
import { useMemo, useRef } from 'react';
import { addDays, isSameDay } from '../utils/moonPhaseUtils';

interface TimelineProps {
  /** 현재 선택된 날짜 */
  selectedDate: Date;
  /** 날짜가 바뀔 때 호출되는 콜백 */
  onChange: (date: Date) => void;
}

/** 슬라이더가 오늘을 기준으로 앞뒤로 이동할 수 있는 최대 일수 */
const SLIDER_RANGE_DAYS = 30;

/**
 * 날짜의 시(時)를 정오로 고정한 새 Date를 반환한다.
 * 자정 근처 시간대 오차로 날짜가 하루 밀리는 것을 방지하기 위함이다.
 * @param date 기준 날짜
 */
function toNoon(date: Date): Date {
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  return noon;
}

/** input[type=date]에 넣을 수 있는 "YYYY-MM-DD" 문자열로 변환한다. */
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Timeline({ selectedDate, onChange }: TimelineProps) {
  // 슬라이더의 기준(0일)이 되는 "오늘"은 컴포넌트가 처음 마운트될 때 한 번만 고정한다.
  const baseDateRef = useRef(toNoon(new Date()));
  const baseDate = baseDateRef.current;

  const today = useMemo(() => toNoon(new Date()), []);

  const sliderOffset = useMemo(() => {
    const diffDays = Math.round((selectedDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(-SLIDER_RANGE_DAYS, Math.min(SLIDER_RANGE_DAYS, diffDays));
  }, [selectedDate, baseDate]);

  function handleDateInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [year, month, day] = event.target.value.split('-').map(Number);
    if (!year || !month || !day) return;
    onChange(toNoon(new Date(year, month - 1, day)));
  }

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
    const offset = Number(event.target.value);
    onChange(toNoon(addDays(baseDate, offset)));
  }

  function shiftDay(delta: number) {
    onChange(toNoon(addDays(selectedDate, delta)));
  }

  return (
    <div className="timeline">
      <div className="timeline__row">
        <button type="button" className="timeline__step-button" onClick={() => shiftDay(-1)} aria-label="전날">
          ◀ 전날
        </button>

        <input
          type="date"
          className="timeline__date-input"
          value={toDateInputValue(selectedDate)}
          onChange={handleDateInputChange}
        />

        <button type="button" className="timeline__step-button" onClick={() => shiftDay(1)} aria-label="다음날">
          다음날 ▶
        </button>

        <button
          type="button"
          className={`timeline__today-button${isSameDay(selectedDate, today) ? ' timeline__today-button--active' : ''}`}
          onClick={() => onChange(today)}
        >
          오늘
        </button>
      </div>

      <div className="timeline__row">
        <input
          type="range"
          className="timeline__slider"
          min={-SLIDER_RANGE_DAYS}
          max={SLIDER_RANGE_DAYS}
          step={1}
          value={sliderOffset}
          onChange={handleSliderChange}
          aria-label="날짜 슬라이더"
        />
        <span className="timeline__slider-label">
          {sliderOffset === 0 ? '오늘' : sliderOffset > 0 ? `오늘로부터 ${sliderOffset}일 후` : `오늘로부터 ${-sliderOffset}일 전`}
        </span>
      </div>
    </div>
  );
}
