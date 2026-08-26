/**
 * 소리는 오디오 파일 없이 Web Audio API로 직접 만듭니다.
 * (배포 용량이 늘지 않고, 인터넷이 없어도 재생됩니다.)
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function beep(frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.06) {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  vol.gain.setValueAtTime(gain, audio.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(vol).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export const sfx = {
  draw: () => beep(520, 0.06, 'triangle', 0.03),
  submit: () => beep(660, 0.12, 'sine'),
  great: () => {
    beep(660, 0.12);
    setTimeout(() => beep(880, 0.16), 110);
    setTimeout(() => beep(1180, 0.22), 230);
  },
  soft: () => beep(320, 0.18, 'sine', 0.05),
  finish: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.2), i * 120));
  },
};
