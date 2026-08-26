import { ALL_BADGES } from '../utils/badges';
import type { Badge } from '../types';

interface Props {
  earned: Badge[];
}

/** 획득한 배지는 밝게, 아직 못 얻은 배지는 흐리게 보여 줍니다. */
export default function BadgeShelf({ earned }: Props) {
  const earnedIds = new Set(earned.map((b) => b.id));

  return (
    <div>
      <h3 className="font-display text-lg">
        배지 <span className="tabular text-dust">{earned.length} / {ALL_BADGES.length}</span>
      </h3>

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALL_BADGES.map((badge) => {
          const has = earnedIds.has(badge.id);
          return (
            <li
              key={badge.id}
              className={`rounded-xl border p-3 text-center ${
                has ? 'border-flare/60 bg-flare/10' : 'border-edge/50 bg-deep/40 opacity-45'
              }`}
            >
              <div aria-hidden className="text-2xl">{badge.icon}</div>
              <p className="mt-1 font-display text-sm">{badge.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-dust">{badge.description}</p>
              <span className="sr-only">{has ? '획득함' : '아직 얻지 못함'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
