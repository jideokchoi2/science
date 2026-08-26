import Button from './Button';

interface Props {
  roomCode: string;
  nickname: string;
  onSoloChallenge: () => void;
  onRandomMatch: () => void;
  onLeaderboard: () => void;
  onHallOfFame: () => void;
  onLeaveRoom: () => void;
}

/** 방에 들어온 뒤 어떤 방식으로 겨룰지 고르는 화면 */
export default function RoomLobbyScreen({
  roomCode,
  nickname,
  onSoloChallenge,
  onRandomMatch,
  onLeaderboard,
  onHallOfFame,
  onLeaveRoom,
}: Props) {
  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center gap-5 p-6">
      <div className="text-center">
        <p className="font-display text-sm tracking-[0.25em] text-beam">
          반 코드 <span className="tabular">{roomCode}</span>
        </p>
        <h1 className="mt-2 font-display text-3xl">
          안녕하세요, {nickname}님!
        </h1>
        <p className="mt-2 text-sm text-dust">어떤 방식으로 도전할까요?</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={onSoloChallenge}
          className="panel flex flex-col items-start gap-2 p-5 text-left transition hover:border-beam/60"
        >
          <span aria-hidden className="text-3xl">🏆</span>
          <span className="font-display text-lg">전체 순위전</span>
          <span className="text-sm text-dust">
            8행성을 풀고 총점을 반 순위표에 올려요
          </span>
        </button>

        <button
          onClick={onRandomMatch}
          className="panel flex flex-col items-start gap-2 p-5 text-left transition hover:border-beam/60"
        >
          <span aria-hidden className="text-3xl">⚔️</span>
          <span className="font-display text-lg">랜덤 대결</span>
          <span className="text-sm text-dust">
            무작위 친구와 한 행성으로 실시간 대결해요
          </span>
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ghost" onClick={onLeaderboard}>
          반 순위표 보기
        </Button>
        <Button variant="ghost" onClick={onHallOfFame}>
          명예의 전당
        </Button>
      </div>

      <Button variant="quiet" onClick={onLeaveRoom} className="mx-auto">
        방 나가기
      </Button>
    </main>
  );
}
