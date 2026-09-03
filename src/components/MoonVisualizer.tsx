/**
 * 태양-지구-달의 위치 관계를 3D로 보여주는 컴포넌트.
 *
 * 화면 구성
 * ---------
 * - 메인 뷰(전체 화면): 지구를 중심으로 태양의 방향과 달의 공전 궤도를 보여준다.
 *   마우스/터치로 드래그하면 자유롭게 회전하며 관찰할 수 있다.
 * - 인셋 뷰(우측 하단 작은 화면): 실제로 지구에서 달을 바라볼 때 보이는 모양(위상)을
 *   그대로 보여준다. 지구 모형이 시야를 가리지 않도록 별도의 레이어로 숨긴다.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface MoonVisualizerProps {
  /** 0(신월) ~ 1 직전(다음 신월 직전) 사이의 위상값 */
  phaseFraction: number;
}

/** 지구 반지름 (장면 내 상대적인 크기, 실제 비율이 아님) */
const EARTH_RADIUS = 1;
/** 달 반지름 */
const MOON_RADIUS = 0.27;
/** 달의 공전 궤도 반지름 (지구 중심으로부터 거리) */
const ORBIT_RADIUS = 6;
/** 태양 모형(장식용 구)의 반지름 */
const SUN_VISUAL_RADIUS = 1.3;
/** 태양이 위치한 방향으로 얼마나 멀리 배치할지 (태양광은 평행광으로 처리) */
const SUN_DISTANCE = 14;

/** 지구/태양 모형과 궤도선을 숨기기 위한 전용 레이어 번호 (인셋 카메라는 이 레이어를 보지 않음) */
const OVERVIEW_ONLY_LAYER = 1;

/** 메인(전체 궤도) 카메라 시야각 */
const MAIN_CAMERA_FOV = 45;
/** 인셋(지구에서 본 달) 카메라 시야각 - 달이 화면을 적당히 채우도록 좁게 설정 */
const INSET_CAMERA_FOV = 8.5;
/** 인셋 뷰가 캔버스에서 차지하는 한 변의 픽셀 크기 */
const INSET_SIZE_PX = 160;
/** 인셋 뷰와 캔버스 가장자리 사이 여백 (픽셀) */
const INSET_MARGIN_PX = 16;

/** 지구 텍스처의 바다/육지/극지방 색상 */
const EARTH_OCEAN_COLOR = '#2e6da8';
const EARTH_OCEAN_COLOR_DEEP = '#1d4a7d';
const EARTH_LAND_COLOR = '#4c8c4a';
const EARTH_LAND_COLOR_DARK = '#3a6e3c';
const EARTH_ICE_COLOR = '#eef4f8';

/** 달 텍스처의 표면/바다(마리아)/크레이터 색상 */
const MOON_SURFACE_COLOR = '#d8d5d0';
const MOON_MARIA_COLOR = '#9c968d';
const MOON_CRATER_SHADOW_COLOR = '#78736b';
const MOON_CRATER_RIM_COLOR = '#f0eee9';

/** 태양 모형(장식용 구)의 색상 - 빨간 태양 */
const SUN_COLOR = 0xef4444;
const BACKGROUND_COLOR = 0x03040a;
const STAR_COUNT = 900;

/** 절차적 텍스처(지구/달)를 그릴 캔버스의 가로/세로 픽셀 크기 */
const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 256;

/**
 * 시드값을 기반으로 항상 같은 순서의 난수를 생성하는 간단한 의사난수 생성기.
 * 지구의 대륙이나 달의 크레이터가 새로고침할 때마다 바뀌지 않고 고정되도록 사용한다.
 * @param seed 난수 시퀀스를 결정하는 시드값
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 지구처럼 보이도록 바다 위에 대륙 모양 얼룩과 극지방을 그린 텍스처를 만든다.
 * 실제 대륙의 정확한 모양/위치가 아니라, 학습용으로 "지구를 닮은" 느낌을 주기 위한 절차적 텍스처다.
 */
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 바다 (위아래로 살짝 어두워지는 그라디언트)
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT);
  oceanGradient.addColorStop(0, EARTH_OCEAN_COLOR_DEEP);
  oceanGradient.addColorStop(0.5, EARTH_OCEAN_COLOR);
  oceanGradient.addColorStop(1, EARTH_OCEAN_COLOR_DEEP);
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // 대륙처럼 보이는 불규칙한 얼룩들을 원을 여러 개 겹쳐서 그린다.
  const random = createSeededRandom(42);
  const continentCenters = [
    { u: 0.12, v: 0.4, scale: 1.2 },
    { u: 0.22, v: 0.62, scale: 0.9 },
    { u: 0.46, v: 0.34, scale: 1.0 },
    { u: 0.52, v: 0.58, scale: 0.8 },
    { u: 0.7, v: 0.32, scale: 1.3 },
    { u: 0.86, v: 0.66, scale: 0.7 },
  ];
  continentCenters.forEach(({ u, v, scale }) => {
    const cx = u * TEXTURE_WIDTH;
    const cy = v * TEXTURE_HEIGHT;
    const blobCount = 6 + Math.floor(random() * 4);
    ctx.fillStyle = random() > 0.5 ? EARTH_LAND_COLOR : EARTH_LAND_COLOR_DARK;
    for (let i = 0; i < blobCount; i += 1) {
      const angle = random() * Math.PI * 2;
      const dist = random() * 30 * scale;
      const radius = (14 + random() * 22) * scale;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 극지방 얼음
  const iceHeight = TEXTURE_HEIGHT * 0.08;
  ctx.fillStyle = EARTH_ICE_COLOR;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, iceHeight);
  ctx.fillRect(0, TEXTURE_HEIGHT - iceHeight, TEXTURE_WIDTH, iceHeight);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 달 표면처럼 보이도록 크레이터(운석 구덩이)와 어두운 바다(마리아)를 그린 텍스처를 만든다.
 * 크레이터 무늬 덕분에 지구와 헷갈리지 않고 한눈에 "달"임을 알아볼 수 있다.
 */
function createMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = MOON_SURFACE_COLOR;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  const random = createSeededRandom(7);

  // 달의 바다(마리아) - 크고 부드러운 어두운 얼룩
  const mariaCenters = [
    { u: 0.28, v: 0.42, radius: 46 },
    { u: 0.4, v: 0.58, radius: 34 },
    { u: 0.55, v: 0.4, radius: 40 },
    { u: 0.62, v: 0.62, radius: 26 },
  ];
  mariaCenters.forEach(({ u, v, radius }) => {
    const cx = u * TEXTURE_WIDTH;
    const cy = v * TEXTURE_HEIGHT;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, MOON_MARIA_COLOR);
    gradient.addColorStop(1, MOON_SURFACE_COLOR);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // 크레이터 - 테두리는 밝고 안쪽은 어둡게 그려서 오목한 구덩이처럼 보이게 한다.
  const craterCount = 46;
  for (let i = 0; i < craterCount; i += 1) {
    const cx = random() * TEXTURE_WIDTH;
    const cy = random() * TEXTURE_HEIGHT;
    const radius = 3 + random() * 13;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = MOON_CRATER_SHADOW_COLOR;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx - radius * 0.15, cy - radius * 0.15, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = MOON_SURFACE_COLOR;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = MOON_CRATER_RIM_COLOR;
    ctx.lineWidth = Math.max(1, radius * 0.15);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 위상값으로부터 장면 안에서 달이 위치해야 할 좌표를 계산한다.
 * theta=0(신월)일 때 태양과 같은 방향(-X), theta=π(보름달)일 때 태양 반대 방향(+X)에 위치한다.
 * @param phaseAngleRad 0~2π 사이의 위상각
 */
function computeMoonPosition(phaseAngleRad: number): THREE.Vector3 {
  const x = -ORBIT_RADIUS * Math.cos(phaseAngleRad);
  const z = ORBIT_RADIUS * Math.sin(phaseAngleRad);
  return new THREE.Vector3(x, 0, z);
}

/** 배경을 채울 랜덤한 별 포인트 지오메트리를 생성한다. */
function createStarField(): THREE.Points {
  const positions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i += 1) {
    const radius = 40 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true });
  return new THREE.Points(geometry, material);
}

export default function MoonVisualizer({ phaseFraction }: MoonVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const insetCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // 장면 초기화 (마운트 시 한 번만 실행)
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return undefined;
    // TypeScript는 중첩 함수(animate 등) 안에서 위 null 체크를 계속 narrowing 하지 못하므로
    // null이 아님이 보장된 참조를 별도 변수에 담아 사용한다.
    const container: HTMLDivElement = containerEl;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.add(createStarField());

    // 지구
    const earthTexture = createEarthTexture();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 48, 48),
      new THREE.MeshStandardMaterial({ map: earthTexture, roughness: 0.85 }),
    );
    earth.layers.set(OVERVIEW_ONLY_LAYER);
    scene.add(earth);

    // 태양(장식용 모형 - 실제 광원과 별개)
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_VISUAL_RADIUS, 32, 32),
      new THREE.MeshBasicMaterial({ color: SUN_COLOR }),
    );
    sunMesh.position.set(-SUN_DISTANCE, 0, 0);
    sunMesh.layers.set(OVERVIEW_ONLY_LAYER);
    scene.add(sunMesh);

    // 달의 공전 궤도를 보여주는 얇은 원형 가이드라인
    const orbitLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 128 }, (_, i) => {
          const t = (i / 128) * Math.PI * 2;
          return new THREE.Vector3(-ORBIT_RADIUS * Math.cos(t), 0, ORBIT_RADIUS * Math.sin(t));
        }),
      ),
      new THREE.LineBasicMaterial({ color: 0x2a3550, transparent: true, opacity: 0.6 }),
    );
    orbitLine.layers.set(OVERVIEW_ONLY_LAYER);
    scene.add(orbitLine);

    // 달 (크레이터 무늬 텍스처를 입혀서 지구와 구분되도록 한다)
    const moonTexture = createMoonTexture();
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(MOON_RADIUS, 32, 32),
      new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.95 }),
    );
    scene.add(moon);
    moonRef.current = moon;

    // 태양광 (평행광 - 실제 태양처럼 아주 멀리서 오는 빛으로 근사)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.copy(sunMesh.position);
    sunLight.target.position.set(0, 0, 0);
    scene.add(sunLight);
    scene.add(sunLight.target);
    lightRef.current = sunLight;

    // 은은한 지구반사광 느낌의 보조광 (달의 어두운 면이 완전히 안 보이지 않도록)
    scene.add(new THREE.AmbientLight(0x30354a, 0.35));

    // 메인 카메라 (자유 회전 가능한 전체 궤도 뷰)
    const mainCamera = new THREE.PerspectiveCamera(MAIN_CAMERA_FOV, 1, 0.1, 200);
    mainCamera.position.set(8, 5, 11);
    mainCamera.layers.enable(OVERVIEW_ONLY_LAYER);

    // 인셋 카메라 (지구 위치에서 달을 바라보는 실제 관측 시점)
    const insetCamera = new THREE.PerspectiveCamera(INSET_CAMERA_FOV, 1, 0.1, 50);
    insetCameraRef.current = insetCamera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setScissorTest(true);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);

    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      mainCamera.aspect = width / height;
      mainCamera.updateProjectionMatrix();
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let animationFrameId = 0;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      controls.autoRotate = autoRotateRef.current;
      controls.autoRotateSpeed = 1.1;
      controls.update();

      // 인셋 카메라는 항상 원점(지구)에서 달을 바라본다.
      insetCamera.position.set(0, 0, 0.001);
      insetCamera.lookAt(moon.position);

      const width = container.clientWidth;
      const height = container.clientHeight;

      renderer.setViewport(0, 0, width, height);
      renderer.setScissor(0, 0, width, height);
      renderer.render(scene, mainCamera);

      const insetX = width - INSET_SIZE_PX - INSET_MARGIN_PX;
      const insetY = INSET_MARGIN_PX;
      renderer.setViewport(insetX, insetY, INSET_SIZE_PX, INSET_SIZE_PX);
      renderer.setScissor(insetX, insetY, INSET_SIZE_PX, INSET_SIZE_PX);
      renderer.render(scene, insetCamera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      earthTexture.dispose();
      moonTexture.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineLoop) {
          obj.geometry.dispose();
          const material = obj.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
  }, []);

  // 위상값이 바뀔 때마다 달의 위치를 갱신 (장면을 다시 만들지 않고 위치만 갱신)
  useEffect(() => {
    const moon = moonRef.current;
    if (!moon) return;
    const phaseAngleRad = phaseFraction * Math.PI * 2;
    moon.position.copy(computeMoonPosition(phaseAngleRad));
  }, [phaseFraction]);

  return (
    <div className="moon-visualizer">
      <div ref={containerRef} className="moon-visualizer__canvas" />
      <button
        type="button"
        className="moon-visualizer__toggle"
        onClick={() => setAutoRotate((prev) => !prev)}
      >
        {autoRotate ? '⏸ 자동 회전 끄기' : '▶ 자동 회전 켜기'}
      </button>
      <p className="moon-visualizer__hint">드래그로 회전 · 스크롤로 확대/축소 · 우측 아래는 지구에서 본 달의 실제 모습</p>
    </div>
  );
}
