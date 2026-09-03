import { useState, type ReactNode } from 'react';
import { MAX_RATIO, PLANETS, SUN, getPlanet } from '../data/planets';
import type { PlanetId } from '../types';
import PlanetGlyph from './PlanetGlyph';
import SunGlyph from './SunGlyph';

type SelectedId = PlanetId | 'sun';

/** 무대 안에서 가장 큰 행성(목성)을 이 크기(px)로 그려서, 이 값 기준 축척으로 나머지를 계산합니다. */
const STAGE_MAX_PX = 196;
const STAGE_UNIT = STAGE_MAX_PX / MAX_RATIO;

/** 하단 미니 열에서 가장 큰 행성(목성)을 이 크기(px)로 그립니다. */
const MINI_MAX_PX = 38;
const MINI_UNIT = MINI_MAX_PX / MAX_RATIO;

/** 태양이 선택됐을 때, 태양을 이 크기(px)로 그려서 얼마나 압도적으로 큰지 보여 줍니다. */
const SUN_MAX_PX = 280;

/**
 * "행성 크기 비교" 화면. 하단 탭에서 행성을 고르면 실제 상대 크기 그대로
 * 화면 가운데에 뿅 튀어나오고, 태양을 고르면 행성들이 작아지며 거대한 태양이 나타납니다.
 */
export default function PlanetSizeExplorer() {
  const [selected, setSelected] = useState<SelectedId>('earth');
  const isSun = selected === 'sun';
  const planet = isSun ? null : getPlanet(selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-64 overflow-hidden rounded-2xl border border-edge/60 bg-gradient-to-b from-deep/80 to-void sm:h-72">
        {/* 가운데 무대: 선택된 대상이 실제 비율대로 뿅 튀어나오는 자리 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isSun ? (
            <SunGlyph key="sun" size={SUN_MAX_PX} />
          ) : (
            planet && (
              <div key={planet.id} className="animate-popIn">
                <PlanetGlyph planet={planet} size={Math.max(8, planet.relativeDiameter * STAGE_UNIT)} />
              </div>
            )
          )}
        </div>

        {/* 여덟 행성 미니 열: 실제 비율을 유지한 채, 태양을 고르면 함께 확 작아집니다 */}
        <div
          className="absolute inset-x-0 bottom-3 flex items-end justify-center gap-2 transition-transform duration-700 ease-out"
          style={{ transform: isSun ? 'scale(0.4)' : 'scale(1)' }}
        >
          {PLANETS.map((p) => (
            <PlanetGlyph key={p.id} planet={p} size={Math.max(6, p.relativeDiameter * MINI_UNIT)} />
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="font-display text-xl text-beam">{isSun ? SUN.name : planet!.name}</p>
        <p className="mt-1 text-sm text-dust">
          {isSun
            ? `지구 지름의 약 ${SUN.relativeDiameter.toFixed(0)}배`
            : `지구 지름의 ${planet!.relativeDiameter.toFixed(2)}배`}
        </p>
        <p className="mt-2 text-sm text-chalk">{isSun ? SUN.fact : planet!.fact}</p>
      </div>

      {/* 하단 탭: 태양 + 여덟 행성 */}
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="행성과 태양 선택">
        <TabChip
          active={isSun}
          onClick={() => setSelected('sun')}
          label={SUN.name}
          activeClass="border-flare bg-flare/10"
          icon={<SunGlyph size={30} />}
        />
        {PLANETS.map((p) => (
          <TabChip
            key={p.id}
            active={selected === p.id}
            onClick={() => setSelected(p.id)}
            label={p.name}
            activeClass="border-beam bg-beam/10"
            icon={<PlanetGlyph planet={p} size={30} />}
          />
        ))}
      </div>
    </div>
  );
}

function TabChip({
  active,
  onClick,
  label,
  icon,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-1 font-body text-xs transition-colors ${
        active ? `${activeClass} text-chalk` : 'border-edge/70 bg-panel/50 text-dust hover:bg-panel'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
