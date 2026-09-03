/**
 * 학생이 직접 풀어보는 달 위상 퀴즈 게임.
 * 무작위 날짜의 달 위상을 보여주고, 올바른 위상 이름을 4지선다로 맞히게 한다.
 */
import { useState } from 'react';
import { calculateMoonPhase } from './PhaseCalculator';
import { PHASE_DEFINITIONS, addDays } from '../utils/moonPhaseUtils';

/** 한 판에 출제할 문제 수 */
const QUESTION_COUNT = 5;
/** 문제마다 제시할 보기(선택지) 수 */
const CHOICE_COUNT = 4;
/** 문제용 날짜를 뽑아올 범위 (오늘 기준 앞뒤 며칠까지) */
const RANDOM_DATE_RANGE_DAYS = 1500;

interface QuizQuestion {
  date: Date;
  correctIndex: number;
  choiceIndices: number[];
}

/** 배열을 무작위로 섞는다 (Fisher-Yates shuffle, 원본은 변경하지 않음). */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 오늘을 기준으로 무작위 날짜 하나를 뽑는다. */
function pickRandomDate(): Date {
  const offset = Math.floor(Math.random() * (RANDOM_DATE_RANGE_DAYS * 2 + 1)) - RANDOM_DATE_RANGE_DAYS;
  return addDays(new Date(), offset);
}

/** 정답 위상 인덱스 하나와, 오답 3개를 섞어 4지선다 문제 하나를 만든다. */
function generateQuestion(): QuizQuestion {
  const date = pickRandomDate();
  const correctIndex = calculateMoonPhase(date).phaseIndex;

  const wrongIndices = shuffle(
    PHASE_DEFINITIONS.map((phase) => phase.index).filter((index) => index !== correctIndex),
  ).slice(0, CHOICE_COUNT - 1);

  return {
    date,
    correctIndex,
    choiceIndices: shuffle([correctIndex, ...wrongIndices]),
  };
}

function generateQuestionSet(): QuizQuestion[] {
  return Array.from({ length: QUESTION_COUNT }, generateQuestion);
}

function formatDateKorean(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function QuizGame() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(generateQuestionSet);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedIndex !== null;

  function handleSelect(choiceIndex: number) {
    if (isAnswered) return;
    setSelectedIndex(choiceIndex);
    if (choiceIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  }

  function handleRestart() {
    setQuestions(generateQuestionSet());
    setCurrentIndex(0);
    setScore(0);
    setSelectedIndex(null);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="quiz-game quiz-game--finished">
        <h2 className="quiz-game__title">🎉 퀴즈 완료!</h2>
        <p className="quiz-game__result">
          {QUESTION_COUNT}문제 중 <strong>{score}문제</strong>를 맞혔어요.
        </p>
        <button type="button" className="quiz-game__button quiz-game__button--primary" onClick={handleRestart}>
          다시 풀기
        </button>
      </div>
    );
  }

  const correctDefinition = PHASE_DEFINITIONS[currentQuestion.correctIndex];

  return (
    <div className="quiz-game">
      <div className="quiz-game__header">
        <h2 className="quiz-game__title">🧩 달의 위상 퀴즈</h2>
        <span className="quiz-game__progress">
          {currentIndex + 1} / {questions.length}문제 · 점수 {score}
        </span>
      </div>

      <p className="quiz-game__question">
        <strong>{formatDateKorean(currentQuestion.date)}</strong>의 달은 다음 중 어떤 위상일까요?
      </p>
      <div className="quiz-game__preview" aria-hidden="true">
        {correctDefinition.emoji}
      </div>

      <div className="quiz-game__choices">
        {currentQuestion.choiceIndices.map((choiceIndex) => {
          const choice = PHASE_DEFINITIONS[choiceIndex];
          const isCorrectChoice = choiceIndex === currentQuestion.correctIndex;
          let choiceClassName = 'quiz-game__choice';
          if (isAnswered && isCorrectChoice) choiceClassName += ' quiz-game__choice--correct';
          if (isAnswered && selectedIndex === choiceIndex && !isCorrectChoice) choiceClassName += ' quiz-game__choice--wrong';

          return (
            <button
              key={choiceIndex}
              type="button"
              className={choiceClassName}
              onClick={() => handleSelect(choiceIndex)}
              disabled={isAnswered}
            >
              {choice.name}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="quiz-game__feedback">
          <p>
            {selectedIndex === currentQuestion.correctIndex
              ? '✅ 정답이에요!'
              : `❌ 아쉬워요! 정답은 "${correctDefinition.name}"예요.`}
          </p>
          <p className="quiz-game__feedback-description">{correctDefinition.description}</p>
          <button type="button" className="quiz-game__button quiz-game__button--primary" onClick={handleNext}>
            {currentIndex + 1 >= questions.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>
      )}
    </div>
  );
}
