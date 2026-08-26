import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_RATIO } from '../data/planets';
import { fitCircle } from '../utils/circleFit';
import { prepareStroke, strokeLength, type Point } from '../utils/smoothing';
import { sfx } from '../utils/sound';
import type { Planet } from '../types';

interface Props {
  planet: Planet;
  /** 정답을 공개하는 단계인지 */
  revealed: boolean;
  /** 학생이 확정한 배율 (정답 공개 화면에서 함께 그림) */
  drawnRatio: number | null;
  onStrokeComplete: (ratio: number, roundness: number, method: 'pointer' | 'keyboard') => void;
  onInvalidStroke: (message: string) => void;
  soundOn: boolean;
  reducedMotion: boolean;
  /** 키보드로 크기를 맞추는 모드 */
  keyboardMode: boolean;
}

/** 캔버스 화면 좌표계에서 지구 기준 원의 반지름을 정합니다. */
function earthRadiusFor(width: number, height: number): number {
  const shorter = Math.min(width, height);
  // 가장 큰 행성(목성)이 화면에 들어오도록 축척을 맞추되, 너무 작아지지 않게 최소값을 둡니다.
  return Math.max(9, Math.min(30, (shorter * 0.46) / MAX_RATIO));
}

export default function DrawingCanvas({
  planet,
  revealed,
  drawnRatio,
  onStrokeComplete,
  onInvalidStroke,
  soundOn,
  reducedMotion,
  keyboardMode,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 다시 그릴 때마다 값이 바뀌면 애니메이션 루프가 끊기므로 ref 로 보관합니다.
  const pointsRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });
  const revealStartRef = useRef<number | null>(null);
  const lastBeepRef = useRef(0);

  // 키보드 모드에서 조절 중인 배율
  const [keyboardRatio, setKeyboardRatio] = useState(1);
  const keyboardRatioRef = useRef(1);
  keyboardRatioRef.current = keyboardRatio;

  const revealedRef = useRef(revealed);
  const drawnRatioRef = useRef(drawnRatio);
  const planetRef = useRef(planet);
  const keyboardModeRef = useRef(keyboardMode);
  revealedRef.current = revealed;
  drawnRatioRef.current = drawnRatio;
  planetRef.current = planet;
  keyboardModeRef.current = keyboardMode;

  // 새 행성이 나오면 그림판을 비웁니다.
  useEffect(() => {
    pointsRef.current = [];
    revealStartRef.current = null;
    setKeyboardRatio(1);
  }, [planet.id]);

  useEffect(() => {
    if (revealed) revealStartRef.current = performance.now();
  }, [revealed]);

  // 키보드 모드로 바꾸면 바로 화살표 키를 쓸 수 있도록 포커스를 옮깁니다.
  useEffect(() => {
    if (keyboardMode) canvasRef.current?.focus();
  }, [keyboardMode]);

  /** 캔버스 실제 픽셀 크기를 화면 크기와 화면 배율에 맞춰 조정합니다. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  /** 매 프레임 화면을 다시 그립니다. */
  useEffect(() => {
    let raf = 0;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { w, h } = sizeRef.current;
      if (!ctx || w === 0) {
        raf = requestAnimationFrame(render);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const earthR = earthRadiusFor(w, h);
      const p = planetRef.current;

      ctx.clearRect(0, 0, w, h);

      // 1) 지구 기준 원 (항상 보임)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(cx - earthR * 0.3, cy - earthR * 0.3, 1, cx, cy, earthR);
      grad.addColorStop(0, '#9AD4FA');
      grad.addColorStop(1, '#1F5FA8');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#EAF0FF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.font = '13px Pretendard, system-ui, sans-serif';
      ctx.fillStyle = '#8E9BCB';
      ctx.textAlign = 'center';
      ctx.fillText('지구 (기준 1배)', cx, cy + earthR + 20);

      // 2) 그리는 중인 선
      const pts = pointsRef.current;
      if (pts.length > 1 && !revealedRef.current) {
        ctx.save();
        ctx.strokeStyle = '#5FE3D6';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = '#5FE3D6';
        ctx.shadowBlur = reducedMotion ? 0 : 10;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.restore();
      }

      // 3) 키보드 모드의 미리보기 원
      if (keyboardModeRef.current && !revealedRef.current) {
        const r = earthR * keyboardRatioRef.current;
        ctx.save();
        ctx.strokeStyle = '#5FE3D6';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4) 정답 공개 애니메이션
      if (revealedRef.current && drawnRatioRef.current) {
        const started = revealStartRef.current ?? performance.now();
        const duration = reducedMotion ? 1 : 800;
        const t = Math.min(1, (performance.now() - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // 처음 빠르고 끝에서 부드럽게

        // 학생이 그린 원 (점선)
        const studentR = earthR * drawnRatioRef.current;
        ctx.save();
        ctx.strokeStyle = '#FFC46B';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, studentR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 실제 크기 원 (지구에서 자라나며 커짐)
        const targetR = earthR * p.relativeDiameter;
        const currentR = earthR + (targetR - earthR) * eased;
        ctx.save();
        ctx.strokeStyle = p.colorLight;
        ctx.lineWidth = 4;
        ctx.shadowColor = p.colorLight;
        ctx.shadowBlur = reducedMotion ? 0 : 18;
        ctx.beginPath();
        ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = p.colorLight;
        ctx.fill();
        ctx.restore();

        // 두 원의 이름표
        ctx.font = '13px Pretendard, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFC46B';
        ctx.fillText(`내 원 ${drawnRatioRef.current.toFixed(2)}배`, cx + studentR + 8, cy - 6);
        if (t > 0.9) {
          ctx.fillStyle = p.colorLight;
          ctx.fillText(`실제 ${p.relativeDiameter}배`, cx + targetR + 8, cy + 14);
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  /** 화면 좌표를 캔버스 좌표로 바꿉니다. */
  const toLocal = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed || keyboardMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    pointsRef.current = [toLocal(e)];
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    pointsRef.current.push(toLocal(e));
    // 소리가 너무 자주 나지 않도록 간격을 둡니다.
    if (soundOn && performance.now() - lastBeepRef.current > 260) {
      lastBeepRef.current = performance.now();
      sfx.draw();
    }
  };

  /** 그리기를 끝내고 원으로 근사해 배율을 계산합니다. */
  const handleUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const raw = pointsRef.current;
    const { w, h } = sizeRef.current;
    const earthR = earthRadiusFor(w, h);

    if (strokeLength(raw) < 40) {
      pointsRef.current = [];
      onInvalidStroke('선이 너무 짧아요. 동그라미를 크게 한 바퀴 그려 주세요.');
      return;
    }

    const cleaned = prepareStroke(raw);
    const circle = fitCircle(cleaned);

    if (!circle || circle.roundness < 0.45) {
      pointsRef.current = [];
      onInvalidStroke('동그라미로 보이지 않아요. 한 바퀴 이어서 다시 그려 주세요.');
      return;
    }

    if (soundOn) sfx.submit();
    onStrokeComplete(circle.r / earthR, circle.roundness, 'pointer');
  }, [onInvalidStroke, onStrokeComplete, soundOn]);

  /** 키보드 모드: 위/아래 화살표로 크기 조절, Enter 로 제출 */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!keyboardMode || revealed) return;
    const step = e.shiftKey ? 0.5 : 0.1;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setKeyboardRatio((r) => Math.min(MAX_RATIO + 2, Math.round((r + step) * 100) / 100));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setKeyboardRatio((r) => Math.max(0.1, Math.round((r - step) * 100) / 100));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (soundOn) sfx.submit();
      onStrokeComplete(keyboardRatioRef.current, 1, 'keyboard');
    }
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none rounded-2xl"
        tabIndex={0}
        role="application"
        aria-label={
          keyboardMode
            ? `키보드 모드입니다. 위아래 화살표로 ${planet.name}의 크기를 지구의 ${keyboardRatio.toFixed(1)}배로 맞추고 엔터를 누르세요.`
            : `${planet.name}의 크기를 나타내는 원을 그리는 곳입니다. 화면에 손가락이나 마우스로 동그라미를 그려 주세요.`
        }
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKeyDown}
      />

      {keyboardMode && !revealed && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-edge bg-deep/90 px-4 py-2 text-sm">
          <span className="text-dust">현재 크기 </span>
          <span className="tabular font-display text-beam">지구의 {keyboardRatio.toFixed(1)}배</span>
          <span className="text-dust"> · ↑↓ 조절, Enter 제출</span>
        </div>
      )}
    </div>
  );
}
