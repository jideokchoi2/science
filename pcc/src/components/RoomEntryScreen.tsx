import { useState, type FormEvent } from 'react';
import Button from './Button';
import { normalizeRoomCode } from '../utils/multiplayer';

interface Props {
  onEnter: (roomCode: string, nickname: string) => void;
  onBack: () => void;
}

/** 반 코드와 닉네임을 입력받아 같은 반 친구들과 만날 방에 입장합니다. */
export default function RoomEntryScreen({ onEnter, onBack }: Props) {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = normalizeRoomCode(roomCode);
    const name = nickname.trim().slice(0, 10);

    if (!code) return setError('반 코드를 입력해 주세요. (선생님이 알려준 코드)');
    if (!name) return setError('내 이름(닉네임)을 입력해 주세요.');

    setError(null);
    onEnter(code, name);
  };

  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-5 p-6">
      <div className="text-center">
        <p className="font-display text-sm tracking-[0.25em] text-beam">친구들과 경쟁하기</p>
        <h1 className="mt-2 font-display text-3xl">우리 반 방에 입장해요</h1>
        <p className="mt-2 text-sm text-dust">선생님이 알려준 반 코드를 입력하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-dust">반 코드</span>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="예: 6-2"
            maxLength={12}
            className="min-h-[52px] rounded-xl border border-edge bg-deep px-4 font-display text-xl tracking-wide text-chalk placeholder:text-dust/60 focus:border-beam"
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-dust">내 이름(닉네임)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 지현"
            maxLength={10}
            className="min-h-[52px] rounded-xl border border-edge bg-deep px-4 text-lg text-chalk placeholder:text-dust/60 focus:border-beam"
            autoComplete="off"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-rust">
            {error}
          </p>
        )}

        <Button type="submit">입장하기</Button>
        <Button type="button" variant="quiet" onClick={onBack}>
          첫 화면으로
        </Button>
      </form>
    </main>
  );
}
