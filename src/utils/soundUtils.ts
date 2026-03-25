// ─── Click Sound (기존) ───
let clickAudio: HTMLAudioElement | null = null;

export function playClickSound() {
  try {
    if (!clickAudio) {
      clickAudio = new Audio('/sounds/click.mp3');
      clickAudio.volume = 0.5;
    }
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  } catch {}
}

// ─── Web Audio API 기반 사운드 시스템 ───

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 뮤트 상태
let isMuted = typeof localStorage !== 'undefined'
  ? localStorage.getItem('jamtalk-muted') === 'true'
  : false;

export function toggleMute(): boolean {
  isMuted = !isMuted;
  try { localStorage.setItem('jamtalk-muted', String(isMuted)); } catch {}
  return isMuted;
}

export function getIsMuted(): boolean {
  return isMuted;
}

// 유틸: 단일 톤 재생
function playTone(
  frequency: number,
  duration: number,
  startTime: number,
  ctx: AudioContext,
  gainNode: GainNode,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  osc.connect(gainNode);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ─── 정답 사운드: 상승 2음 (C5→E5) ───
export function playCorrectSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    gain.connect(ctx.destination);

    playTone(523.25, 0.15, ctx.currentTime, ctx, gain, 'sine');       // C5
    playTone(659.25, 0.2, ctx.currentTime + 0.12, ctx, gain, 'sine'); // E5
  } catch {}
}

// ─── 오답 사운드: 낮은 부저 ───
export function playWrongSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    gain.connect(ctx.destination);

    playTone(200, 0.25, ctx.currentTime, ctx, gain, 'square');
  } catch {}
}

// ─── 콤보 사운드: 3음 아르페지오 (C5→E5→G5) ───
export function playComboSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    gain.connect(ctx.destination);

    playTone(523.25, 0.15, ctx.currentTime, ctx, gain, 'sine');       // C5
    playTone(659.25, 0.15, ctx.currentTime + 0.1, ctx, gain, 'sine'); // E5
    playTone(783.99, 0.25, ctx.currentTime + 0.2, ctx, gain, 'sine'); // G5
  } catch {}
}

// ─── 게임 시작 사운드: 상승 팡파레 ───
export function playGameStartSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    gain.connect(ctx.destination);

    playTone(392.00, 0.12, ctx.currentTime, ctx, gain, 'triangle');        // G4
    playTone(523.25, 0.12, ctx.currentTime + 0.12, ctx, gain, 'triangle'); // C5
    playTone(659.25, 0.3, ctx.currentTime + 0.24, ctx, gain, 'triangle');  // E5
  } catch {}
}

// ─── 게임 종료 사운드: 완료 멜로디 ───
export function playGameEndSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    gain.connect(ctx.destination);

    playTone(523.25, 0.15, ctx.currentTime, ctx, gain, 'triangle');        // C5
    playTone(659.25, 0.15, ctx.currentTime + 0.15, ctx, gain, 'triangle'); // E5
    playTone(783.99, 0.15, ctx.currentTime + 0.3, ctx, gain, 'triangle');  // G5
    playTone(1046.50, 0.35, ctx.currentTime + 0.45, ctx, gain, 'triangle');// C6
  } catch {}
}
