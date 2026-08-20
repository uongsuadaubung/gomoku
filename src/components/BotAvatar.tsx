import { type Component, type JSX, Show, createSignal, onMount, onCleanup } from 'solid-js';

export type BotExpressionName =
  | 'eye_roll'
  | 'smug'
  | 'disdain'
  | 'clown'
  | 'cool'
  | 'thinking'
  | 'laugh'
  | 'sleepy'
  | 'detective'
  | 'evil'
  | 'panic'
  | 'party'
  | 'muted'
  | 'angry'
  | 'chill';

export interface BotAvatarProps {
  /** Tên biểu cảm (ví dụ: 'eye_roll', 'smug', 'clown', 'cool', 'thinking', 'laugh', 'sleepy', 'detective', 'evil', 'panic', 'party', 'muted', 'angry', 'chill') hoặc Mood name */
  name?: BotExpressionName | string;
  /** Giữ tương thích ngược nếu truyền emoji hoặc alias */
  emoji?: string;
  class?: string;
  /** Bật/tắt chuyển động sống động (Mặc định: true) */
  animated?: boolean;
}

const EXPRESSION_NAME_MAP: Record<string, BotExpressionName> = {
  // Canonical names
  eye_roll: 'eye_roll',
  smug: 'smug',
  disdain: 'disdain',
  clown: 'clown',
  cool: 'cool',
  thinking: 'thinking',
  laugh: 'laugh',
  sleepy: 'sleepy',
  detective: 'detective',
  evil: 'evil',
  panic: 'panic',
  party: 'party',
  muted: 'muted',
  shush: 'muted',
  angry: 'angry',
  rage: 'angry',
  chill: 'chill',
  bored: 'chill',
  lightning: 'cool',
  default: 'eye_roll',
  idle: 'eye_roll',

  // Emoji glyphs (Tương thích ngược)
  '🙄': 'eye_roll',
  '😏': 'smug',
  '😒': 'disdain',
  '🤡': 'clown',
  '😎': 'cool',
  '🤔': 'thinking',
  '🤣': 'laugh',
  '😂': 'laugh',
  '😴': 'sleepy',
  '🧐': 'detective',
  '😈': 'evil',
  '😱': 'panic',
  '🥳': 'party',
  '🤐': 'muted',
  '🤫': 'muted',
  '😤': 'angry',
  '🤬': 'angry',
  '😡': 'angry',
  '☕': 'chill',
  '😌': 'chill',
  '🥱': 'chill',
  '⚡': 'cool',
};

export function normalizeBotExpression(val?: string): BotExpressionName {
  if (!val) return 'eye_roll';
  return EXPRESSION_NAME_MAP[val.toLowerCase()] || EXPRESSION_NAME_MAP[val] || 'eye_roll';
}

interface GazeTarget {
  x: number;
  y: number;
  brow: number;
  weight: number;
}

// Tập hợp điểm nhìn tự nhiên cho mặt đảo mắt (🙄)
const GAZE_PRESETS: GazeTarget[] = [
  { x: 2.5, y: -3.2, brow: -0.6, weight: 35 }, // Ngước trên-phải
  { x: -2.6, y: -3.2, brow: -0.6, weight: 22 }, // Liếc trên-trái
  { x: 0, y: -3.6, brow: -1.2, weight: 16 },    // Ngước thẳng trần nhà
  { x: 0, y: 2.4, brow: 0.8, weight: 20 },      // Nhìn thẳng bàn cờ
  { x: -2.5, y: 1.5, brow: 0.5, weight: 12 },   // Liếc góc trái-dưới
  { x: 2.5, y: 1.5, brow: 0.5, weight: 12 },    // Liếc góc phải-dưới
  { x: 2.8, y: -0.8, brow: 0, weight: 10 },     // Liếc ngang phải
  { x: -2.8, y: -0.8, brow: 0, weight: 10 },    // Liếc ngang trái
];

/**
 * HỆ THỐNG BIỂU CẢM VECTOR CHUẨN EMOJI ICON (Iconic Emoji-Authentic Vector Face Rig):
 * Nhận trực tiếp prop `name` (như 'smug', 'clown', 'angry', 'thinking', 'eye_roll'...)
 * Tái hiện chân thực 100% các nét đặc trưng của từng Emoji kết hợp xương mặt mượt mà!
 */
export const BotAvatar: Component<BotAvatarProps> = (props) => {
  const isAnimated = () => props.animated !== false;

  // Chuẩn hóa nhận diện kiểu biểu cảm theo tên (Name-First)
  const expressionKey = (): BotExpressionName => {
    return normalizeBotExpression(props.name || props.emoji);
  };

  // Tọa độ con ngươi và chân mày khi ở trạng thái đảo mắt tự nhiên (Eye Roll)
  const [gaze, setGaze] = createSignal<{ x: number; y: number; brow: number }>({
    x: 2.5,
    y: -3.2,
    brow: -0.6,
  });
  const [transitionSpeed, setTransitionSpeed] = createSignal(280);

  // Hệ thống chớp mắt sinh học tự nhiên (Natural Blink Engine)
  const [isBlinking, setIsBlinking] = createSignal(false);

  onMount(() => {
    if (!isAnimated()) return;

    let timer: number | null = null;
    let blinkTimer: number | null = null;
    let isDisposed = false;
    const totalWeight = GAZE_PRESETS.reduce((acc, p) => acc + p.weight, 0);

    const pickRandomGaze = () => {
      let rand = Math.random() * totalWeight;
      for (const preset of GAZE_PRESETS) {
        if (rand < preset.weight) {
          const jitterX = (Math.random() - 0.5) * 0.5;
          const jitterY = (Math.random() - 0.5) * 0.5;
          return {
            x: Math.max(-3.2, Math.min(3.2, preset.x + jitterX)),
            y: Math.max(-3.8, Math.min(3.0, preset.y + jitterY)),
            brow: preset.brow,
          };
        }
        rand -= preset.weight;
      }
      return GAZE_PRESETS[0];
    };

    const scheduleNextGaze = () => {
      if (isDisposed) return;
      const isQuickDoubleTake = Math.random() < 0.22;
      const dwellTime = isQuickDoubleTake
        ? 350 + Math.random() * 300
        : 1400 + Math.random() * 2600;
      const speed = isQuickDoubleTake ? 160 : 220 + Math.floor(Math.random() * 80);
      setTransitionSpeed(speed);
      setGaze(pickRandomGaze());
      timer = window.setTimeout(scheduleNextGaze, dwellTime);
    };

    // Chu kỳ chớp mắt ngẫu nhiên 3.2s - 5.5s
    const scheduleNextBlink = () => {
      if (isDisposed) return;
      const nextDelay = 3200 + Math.random() * 2400;
      blinkTimer = window.setTimeout(() => {
        if (isDisposed) return;
        setIsBlinking(true);
        window.setTimeout(() => {
          if (!isDisposed) setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, nextDelay);
    };

    timer = window.setTimeout(scheduleNextGaze, 1000);
    scheduleNextBlink();

    onCleanup(() => {
      isDisposed = true;
      if (timer !== null) clearTimeout(timer);
      if (blinkTimer !== null) clearTimeout(blinkTimer);
    });
  });

  // Helper tính độ mở mí mắt (kết hợp nháy mắt chớp tự nhiên)
  const applyBlink = (baseScale: number) => {
    if (baseScale <= 0.15) return baseScale; // Mắt đang nhắm cười/ngủ thì giữ nguyên
    return isBlinking() ? 0.05 : baseScale;
  };

  // Tính toán động trạng thái cử động hình thể của các bộ phận ngũ quan (Morphing Rig Parameters)
  const faceRig = () => {
    const key = expressionKey();
    const g = gaze();

    switch (key) {
      case 'smug':
        return {
          leftBrow: { y: 1.5, rot: 5 }, // Chân mày trái hạ nhẹ
          rightBrow: { y: -2.8, rot: -8 }, // Chân mày phải nhướng cao hoài nghi/ngạo nghễ
          leftEyeScaleY: applyBlink(0.65), // Mí mắt nheo nghi ngờ
          rightEyeScaleY: applyBlink(0.65),
          pupil: { x: 2.8, y: 0.4, scale: 0.95 }, // Con ngươi liếc xéo sang phải
          mouth: { d: 'M 18 34 Q 24 36 32 28.5', stroke: '#78350f', strokeWidth: '2.6', fill: 'none' }, // Khóe miệng phải nhếch lên thành nụ cười khẩy
          faceFill: 'url(#botFaceGrad)',
          accessory: 'smug_crease',
        };

      case 'disdain':
        return {
          leftBrow: { y: 2.6, rot: -3 }, // Chân mày sụp phẳng
          rightBrow: { y: 2.6, rot: 3 },
          leftEyeScaleY: applyBlink(0.55), // Mí mắt sụp khinh bỉ
          rightEyeScaleY: applyBlink(0.55),
          pupil: { x: 3.2, y: 0.8, scale: 0.9 }, // Liếc ngang bất cần
          mouth: { d: 'M 17 35.5 Q 24 32.5 31 35.5', stroke: '#78350f', strokeWidth: '2.6', fill: 'none' }, // Miệng trĩu xuống
          faceFill: 'url(#botFaceGrad)',
          accessory: 'none',
        };

      case 'clown':
        return {
          leftBrow: { y: -2.2, rot: -8 }, // Chân mày uốn cao ngộ nghĩnh
          rightBrow: { y: -2.2, rot: 8 },
          leftEyeScaleY: applyBlink(1.0),
          rightEyeScaleY: applyBlink(1.0),
          pupil: { x: 0, y: 0, scale: 1.0 },
          mouth: { d: 'M 14 31 Q 24 43 34 31', stroke: '#dc2626', strokeWidth: '3.2', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'clown',
        };

      case 'cool':
        return {
          leftBrow: { y: 0, rot: 0 },
          rightBrow: { y: -1.5, rot: -4 },
          leftEyeScaleY: applyBlink(0.9),
          rightEyeScaleY: applyBlink(0.9),
          pupil: { x: 0, y: 0, scale: 1.0 },
          mouth: { d: 'M 17 34 Q 24 38 31 34', stroke: '#78350f', strokeWidth: '2.6', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'cool_glasses',
        };

      case 'thinking':
        return {
          leftBrow: { y: -2.5, rot: -10 }, // Chân mày trái nhướng cao tò mò
          rightBrow: { y: 1.8, rot: 6 }, // Chân mày phải nhíu lại
          leftEyeScaleY: applyBlink(0.85),
          rightEyeScaleY: applyBlink(0.85),
          pupil: { x: 2.5, y: -3.2, scale: 0.95 }, // Ngước lên suy tính
          mouth: { d: 'M 19 33 Q 24 34 28 32', stroke: '#78350f', strokeWidth: '2.5', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'thinking_hand',
        };

      case 'laugh':
        return {
          leftBrow: { y: -1.2, rot: 0 },
          rightBrow: { y: -1.2, rot: 0 },
          leftEyeScaleY: 0, // Mắt nhắm tít cười ><
          rightEyeScaleY: 0,
          pupil: { x: 0, y: 0, scale: 0 },
          mouth: { d: 'M 14 28 Q 24 43 34 28 Z', stroke: '#78350f', strokeWidth: '2.0', fill: '#991b1b' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'laugh_tears',
        };

      case 'sleepy':
        return {
          leftBrow: { y: 1.0, rot: 0 },
          rightBrow: { y: 1.0, rot: 0 },
          leftEyeScaleY: 0, // Mắt nhắm ngủ u u
          rightEyeScaleY: 0,
          pupil: { x: 0, y: 0, scale: 0 },
          mouth: { d: 'M 21 32 Q 24 36 27 32 Q 24 28 21 32', stroke: '#78350f', strokeWidth: '2.0', fill: '#78350f' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'sleepy_zzz',
        };

      case 'detective':
        return {
          leftBrow: { y: 1.5, rot: 4 },
          rightBrow: { y: -3.8, rot: -10 }, // Chân mày kính lúp nhướng cực cao
          leftEyeScaleY: applyBlink(0.8),
          rightEyeScaleY: applyBlink(1.15), // Mắt phải mở to qua kính lúp
          pupil: { x: 2.0, y: 0.5, scale: 1.0 },
          mouth: { d: 'M 18 34 Q 24 33 29 34', stroke: '#78350f', strokeWidth: '2.4', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'detective_monocle',
        };

      case 'evil':
        return {
          leftBrow: { y: 0, rot: 24 }, // Chân mày nhọn hình chữ V ác quỷ
          rightBrow: { y: 0, rot: -24 },
          leftEyeScaleY: applyBlink(0.75),
          rightEyeScaleY: applyBlink(0.75),
          pupil: { x: 1.5, y: 0.5, scale: 0.95 },
          mouth: { d: 'M 15 28 Q 24 40 33 28 Z', stroke: '#3b0764', strokeWidth: '2.0', fill: '#3b0764' },
          faceFill: 'url(#evilFaceGrad)',
          accessory: 'evil_horns',
        };

      case 'panic':
        return {
          leftBrow: { y: -4.0, rot: -16 }, // Chân mày hoảng hốt chếch lên
          rightBrow: { y: -4.0, rot: 16 },
          leftEyeScaleY: applyBlink(1.2), // Mắt mở to tròn thảng thốt
          rightEyeScaleY: applyBlink(1.2),
          pupil: { x: 0, y: 0, scale: 0.55 }, // Con ngươi co nhỏ lại
          mouth: { d: 'M 18 29 Q 24 45 30 29 Q 24 23 18 29 Z', stroke: '#0369a1', strokeWidth: '1.5', fill: '#082f49' },
          faceFill: 'url(#panicFaceGrad)',
          accessory: 'panic_hands',
        };

      case 'party':
        return {
          leftBrow: { y: -1.5, rot: 0 },
          rightBrow: { y: -1.5, rot: 0 },
          leftEyeScaleY: 0,
          rightEyeScaleY: 0,
          pupil: { x: 0, y: 0, scale: 0 },
          mouth: { d: 'M 17 31 Q 24 38 31 31', stroke: '#78350f', strokeWidth: '2.4', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'party_hat',
        };

      case 'muted':
        return {
          leftBrow: { y: 0, rot: 0 },
          rightBrow: { y: 0, rot: 0 },
          leftEyeScaleY: applyBlink(1.0),
          rightEyeScaleY: applyBlink(1.0),
          pupil: { x: 0, y: 0, scale: 1.0 },
          mouth: { d: 'M 14 33 L 34 33', stroke: '#475569', strokeWidth: '3.5', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'muted_zipper',
        };

      case 'angry':
        return {
          leftBrow: { y: 1.8, rot: 22 }, // Chân mày nhíu sắc lẹm hình chữ V
          rightBrow: { y: 1.8, rot: -22 },
          leftEyeScaleY: applyBlink(0.65), // Mắt nhắm nghiến tức giận
          rightEyeScaleY: applyBlink(0.65),
          pupil: { x: 0, y: 0.5, scale: 0.9 },
          mouth: { d: 'M 18 34.5 Q 24 32.5 30 34.5', stroke: '#450a0a', strokeWidth: '2.8', fill: 'none' },
          faceFill: 'url(#angryFaceGrad)', // Mặt đỏ rực lửa 😡/😤
          accessory: 'angry_steam',
        };

      case 'chill':
        return {
          leftBrow: { y: 0.5, rot: 0 },
          rightBrow: { y: 0.5, rot: 0 },
          leftEyeScaleY: 0,
          rightEyeScaleY: 0,
          pupil: { x: 0, y: 0, scale: 0 },
          mouth: { d: 'M 19 31 Q 24 35 29 31', stroke: '#78350f', strokeWidth: '2.4', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'chill_coffee',
        };

      case 'eye_roll':
      default:
        return {
          leftBrow: { y: isAnimated() ? g.brow : 0, rot: 0 },
          rightBrow: { y: isAnimated() ? g.brow : 0, rot: 0 },
          leftEyeScaleY: applyBlink(1.0),
          rightEyeScaleY: applyBlink(1.0),
          pupil: { x: isAnimated() ? g.x : 2.5, y: isAnimated() ? g.y : -3.2, scale: 1.0 },
          mouth: { d: 'M 18 34.5 Q 24 33.5 30 34', stroke: '#78350f', strokeWidth: '2.6', fill: 'none' },
          faceFill: 'url(#botFaceGrad)',
          accessory: 'none',
        };
    }
  };

  // Helper tính style cho phụ kiện overlay
  const accessoryStyle = (name: string): JSX.CSSProperties => {
    const isCurrent = faceRig().accessory === name;
    return {
      opacity: isCurrent ? 1 : 0,
      transform: isCurrent ? 'scale(1)' : 'scale(0.6)',
      'pointer-events': isCurrent ? 'auto' : 'none',
      visibility: isCurrent ? 'visible' : 'hidden',
    };
  };

  // Lớp hoạt ảnh nhịp điệu của toàn bộ khuôn mặt theo từng trạng thái
  const avatarMotionClass = () => {
    if (!isAnimated()) return '';
    const key = expressionKey();
    switch (key) {
      case 'laugh':
        return 'animate-laugh-rocking';
      case 'sleepy':
        return 'animate-sleepy-nod';
      case 'angry':
        return 'animate-angry-tremble';
      case 'cool':
        return 'animate-cool-nod';
      default:
        return 'animate-bot-face-idle';
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      class={`inline-block w-[1.15em] h-[1.15em] align-middle select-none shrink-0 overflow-visible ${avatarMotionClass()} ${props.class || ''}`}
      aria-label={`Bot Avatar - ${expressionKey()}`}
    >
        <defs>
          {/* 3D Warm Yellow Gradient for Face */}
          <radialGradient id="botFaceGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#fef08a" style={{ 'stop-color': '#fef08a' }} />
            <stop offset="55%" stop-color="#f59e0b" style={{ 'stop-color': '#f59e0b' }} />
            <stop offset="100%" stop-color="#d97706" style={{ 'stop-color': '#d97706' }} />
          </radialGradient>

          {/* 3D Purple Gradient for Evil Face 😈 */}
          <radialGradient id="evilFaceGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#d8b4fe" style={{ 'stop-color': '#d8b4fe' }} />
            <stop offset="55%" stop-color="#9333ea" style={{ 'stop-color': '#9333ea' }} />
            <stop offset="100%" stop-color="#581c87" style={{ 'stop-color': '#581c87' }} />
          </radialGradient>

          {/* 3D Blue Shock Gradient for Panic Face 😱 */}
          <radialGradient id="panicFaceGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#bae6fd" style={{ 'stop-color': '#bae6fd' }} />
            <stop offset="50%" stop-color="#38bdf8" style={{ 'stop-color': '#38bdf8' }} />
            <stop offset="100%" stop-color="#0284c7" style={{ 'stop-color': '#0284c7' }} />
          </radialGradient>

          {/* Eye Shadow Gradient */}
          <linearGradient id="eyeShadowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.6" style={{ 'stop-color': '#cbd5e1', 'stop-opacity': 0.6 }} />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="1" style={{ 'stop-color': '#ffffff', 'stop-opacity': 1 }} />
          </linearGradient>

          {/* Sunglasses Dark Gradient */}
          <linearGradient id="sunglassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155" style={{ 'stop-color': '#334155' }} />
            <stop offset="50%" stop-color="#0f172a" style={{ 'stop-color': '#0f172a' }} />
            <stop offset="100%" stop-color="#020617" style={{ 'stop-color': '#020617' }} />
          </linearGradient>

          {/* Gold Monocle Gradient */}
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a" style={{ 'stop-color': '#fef08a' }} />
            <stop offset="50%" stop-color="#eab308" style={{ 'stop-color': '#eab308' }} />
            <stop offset="100%" stop-color="#a16207" style={{ 'stop-color': '#a16207' }} />
          </linearGradient>

          {/* 3D Fiery Red Gradient for Angry / Rage Face 😤 / 😡 */}
          <radialGradient id="angryFaceGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#fca5a5" style={{ 'stop-color': '#fca5a5' }} />
            <stop offset="40%" stop-color="#ef4444" style={{ 'stop-color': '#ef4444' }} />
            <stop offset="75%" stop-color="#dc2626" style={{ 'stop-color': '#dc2626' }} />
            <stop offset="100%" stop-color="#991b1b" style={{ 'stop-color': '#991b1b' }} />
          </radialGradient>

          {/* Steam Puff Gradient 😤 */}
          <linearGradient id="steamGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" style={{ 'stop-color': '#ffffff', 'stop-opacity': 0.95 }} />
            <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.75" style={{ 'stop-color': '#cbd5e1', 'stop-opacity': 0.75 }} />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* 1. KHUÔN ĐẦU CƠ SỞ (Chuyển màu mượt mà khi đổi sang Quỷ/Panic/Angry) */}
        {/* ========================================================================= */}
        <circle cx="24" cy="24" r="21" fill={faceRig().faceFill || '#f59e0b'} class="avatar-base-head" />
        <path d="M 10 16 A 18 18 0 0 1 38 16 A 21 21 0 0 0 10 16" fill="#ffffff" opacity="0.28" />

        {/* Trán toát mồ hôi xanh đậm khi Panic 😱 */}
        <path
          d="M 10 16 A 18 18 0 0 1 38 16 Q 24 24 10 16"
          fill="#0284c7"
          class="avatar-accessory"
          style={{ opacity: faceRig().accessory === 'panic_hands' ? 0.45 : 0 }}
        />

        {/* ========================================================================= */}
        {/* 2. CHÂN MÀY BIẾN DẠNG THEO XƯƠNG (Left & Right Eyebrow Morphing) */}
        {/* ========================================================================= */}
        {/* Chân mày trái */}
        <g
          class="avatar-brow-left"
          style={{
            transform: `translate(0px, ${faceRig().leftBrow.y}px) rotate(${faceRig().leftBrow.rot}deg)`,
            'transform-origin': '16.5px 11.5px',
          }}
        >
          <path
            d="M 11 11.5 Q 16.5 9 21.5 12"
            stroke={expressionKey() === 'evil' ? '#3b0764' : expressionKey() === 'angry' ? '#450a0a' : '#78350f'}
            stroke-width="2.2"
            stroke-linecap="round"
            fill="none"
          />
        </g>

        {/* Chân mày phải */}
        <g
          class="avatar-brow-right"
          style={{
            transform: `translate(0px, ${faceRig().rightBrow.y}px) rotate(${faceRig().rightBrow.rot}deg)`,
            'transform-origin': '31.5px 11.5px',
          }}
        >
          <path
            d="M 26.5 12 Q 31.5 9 37 11.5"
            stroke={expressionKey() === 'evil' ? '#3b0764' : expressionKey() === 'angry' ? '#450a0a' : '#78350f'}
            stroke-width="2.2"
            stroke-linecap="round"
            fill="none"
          />
        </g>

        {/* ========================================================================= */}
        {/* 3. MẮT MỞ / NHEO MẮT / HÍP MẮT (Eye Sclera Morphing) */}
        {/* ========================================================================= */}
        {/* Tròng trắng mắt trái */}
        <g
          class="avatar-eye-group"
          style={{
            transform: `scale(1, ${faceRig().leftEyeScaleY})`,
            'transform-origin': '16.5px 20.5px',
          }}
        >
          <ellipse cx="16.5" cy="20.5" rx="5.8" ry="6.6" fill="#ffffff" />
          <ellipse cx="16.5" cy="20.5" rx="5.8" ry="6.6" fill="url(#eyeShadowGrad)" />
        </g>

        {/* Tròng trắng mắt phải (Thám tử soi to hơn qua kính) */}
        <g
          class="avatar-eye-group"
          style={{
            transform: `scale(1, ${faceRig().rightEyeScaleY})`,
            'transform-origin': '31.5px 20.5px',
          }}
        >
          <ellipse cx="31.5" cy="20.5" rx="5.8" ry="6.6" fill="#ffffff" />
          <ellipse cx="31.5" cy="20.5" rx="5.8" ry="6.6" fill="url(#eyeShadowGrad)" />
        </g>

        {/* ========================================================================= */}
        {/* 4. CON NGƯƠI LƯỚT MƯỢT TỪ VỊ TRÍ CŨ SANG HƯỚNG MỚI (Pupil Glide Rig) */}
        {/* ========================================================================= */}
        <g
          class="avatar-pupil-group"
          style={{
            transform: `translate(${faceRig().pupil.x}px, ${faceRig().pupil.y}px) scale(${faceRig().pupil.scale})`,
            'transform-origin': '24px 20.5px',
            opacity: faceRig().leftEyeScaleY <= 0.1 ? 0 : 1,
          }}
        >
          {/* Con ngươi trái */}
          <circle cx="16.5" cy="20.5" r="3.2" fill={expressionKey() === 'evil' ? '#1e1b4b' : expressionKey() === 'angry' ? '#450a0a' : '#1e293b'} />
          <circle cx="15.3" cy="19.3" r="0.9" fill="#ffffff" opacity="0.9" />

          {/* Con ngươi phải */}
          <circle cx="31.5" cy="20.5" r="3.2" fill={expressionKey() === 'evil' ? '#1e1b4b' : expressionKey() === 'angry' ? '#450a0a' : '#1e293b'} />
          <circle cx="30.3" cy="19.3" r="0.9" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Mắt nhắm cười / nhắm ngủ khi scaleY === 0 (Laugh / Sleep / Party / Chill) */}
        <g
          class="avatar-accessory"
          style={{
            opacity: faceRig().leftEyeScaleY <= 0.1 ? 1 : 0,
          }}
        >
          <Show
            when={expressionKey() === 'laugh'}
            fallback={
              <>
                <path d="M 12 21 Q 16.5 17 21 21" stroke="#78350f" stroke-width="2.4" stroke-linecap="round" fill="none" />
                <path d="M 27 21 Q 31.5 17 36 21" stroke="#78350f" stroke-width="2.4" stroke-linecap="round" fill="none" />
              </>
            }
          >
            {/* Mắt cười tít >< */}
            <path d="M 11 17 L 17 21 L 11 25" stroke="#78350f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <path d="M 37 17 L 31 21 L 37 25" stroke="#78350f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </Show>
        </g>

        {/* ========================================================================= */}
        {/* 5. KHÓE MIỆNG UỐN CONG THAY ĐỔI TRỰC TIẾP (Mouth Curve Morphing) */}
        {/* ========================================================================= */}
        <path
          class="avatar-mouth-path"
          d={faceRig().mouth.d}
          stroke={faceRig().mouth.stroke}
          stroke-width={faceRig().mouth.strokeWidth}
          fill={faceRig().mouth.fill}
          stroke-linecap="round"
        />

        {/* Chi tiết bên trong miệng cười to (Răng + Lưỡi cho Laugh 🤣) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-laugh-mouth' : ''}`} style={accessoryStyle('laugh_tears')}>
          <path d="M 19 36 Q 24 33 29 36 Q 24 42 19 36 Z" fill="#fb7185" />
          <path d="M 16 28 Q 24 30 32 28" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" />
        </g>

        {/* Khóe má nhăn đắc thắng (Smug Crease 😏) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-smug-crease' : ''}`} style={accessoryStyle('smug_crease')}>
          <path d="M 32 28.5 Q 34 26.5 34 29.5" stroke="#78350f" stroke-width="2.2" stroke-linecap="round" fill="none" />
        </g>

        {/* Răng nhọn của Quỷ Tím (Evil Teeth 😈) */}
        <g class="avatar-accessory" style={accessoryStyle('evil_horns')}>
          <path d="M 17 29 L 19 32 L 21 29 L 23 32 L 25 29 L 27 32 L 29 29 L 31 32" stroke="#ffffff" stroke-width="1.5" fill="none" />
        </g>

        {/* Răng khóa kéo kim loại (Zipper Teeth 🤐) */}
        <g class="avatar-accessory" style={accessoryStyle('muted_zipper')}>
          <line x1="16" y1="31" x2="16" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="19" y1="31" x2="19" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="22" y1="31" x2="22" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="25" y1="31" x2="25" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="28" y1="31" x2="28" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="31" y1="31" x2="31" y2="35" stroke="#e2e8f0" stroke-width="1.2" />
          <rect x="22" y="31" width="4" height="6" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="1" class={isAnimated() ? 'animate-zipper-pull' : ''} />
        </g>

        {/* ========================================================================= */}
        {/* 6. CÁC ĐẶC TRƯNG CHUẨN ICON (Iconic Features & Props) */}
        {/* ========================================================================= */}
        
        {/* 🤡 CHÚ HỀ (Clown: Tóc xanh xù 2 bên, vệt mắt trắng, mũi đỏ bóng 3D, má hồng) */}
        <g class="avatar-accessory" style={accessoryStyle('clown')}>
          {/* Tóc xoăn xanh trái nhấp nhô */}
          <g class={isAnimated() ? 'animate-clown-hair-left' : ''}>
            <circle cx="5.5" cy="15" r="5" fill="#2563eb" />
            <circle cx="4" cy="22" r="5" fill="#3b82f6" />
            <circle cx="5" cy="28" r="4.5" fill="#1d4ed8" />
          </g>
          {/* Tóc xoăn xanh phải nhấp nhô */}
          <g class={isAnimated() ? 'animate-clown-hair-right' : ''}>
            <circle cx="42.5" cy="15" r="5" fill="#2563eb" />
            <circle cx="44" cy="22" r="5" fill="#3b82f6" />
            <circle cx="43" cy="28" r="4.5" fill="#1d4ed8" />
          </g>

          {/* Vệt hóa trang mắt trắng */}
          <ellipse cx="16.5" cy="20.5" rx="7.5" ry="8.5" fill="#ffffff" opacity="0.9" />
          <ellipse cx="31.5" cy="20.5" rx="7.5" ry="8.5" fill="#ffffff" opacity="0.9" />
          {/* Con ngươi đen trên nền trắng chú hề */}
          <circle cx="16.5" cy="20.5" r="3" fill="#1e293b" />
          <circle cx="31.5" cy="20.5" r="3" fill="#1e293b" />

          {/* Má hồng tròn to chuẩn icon */}
          <circle cx="10" cy="29" r="4" fill="#f43f5e" opacity="0.65" />
          <circle cx="38" cy="29" r="4" fill="#f43f5e" opacity="0.65" />

          {/* Mũi tròn đỏ bóp bíp nhịp nhàng */}
          <g class={isAnimated() ? 'animate-clown-nose' : ''}>
            <circle cx="24" cy="24" r="5.5" fill="#ef4444" stroke="#dc2626" stroke-width="0.8" />
            <circle cx="22" cy="22" r="1.8" fill="#ffffff" opacity="0.85" />
          </g>
        </g>

        {/* 😤 TỨC GIẬN PHÌ KHÓI (Angry: 2 luồng khói bốc phì cuồn cuộn 2 bên 😤) */}
        <g class="avatar-accessory" style={accessoryStyle('angry_steam')}>
          {/* Luồng khói bốc sang cánh trái */}
          <g class={isAnimated() ? 'animate-steam-left' : ''}>
            <path
              d="M 21 28 C 17 26 12 28 9 32 C 7 35 9 39 13 39 C 17 39 19 36 22 31 Z"
              fill="url(#steamGrad)"
              stroke="#cbd5e1"
              stroke-width="0.8"
            />
            <circle cx="12" cy="34" r="3.5" fill="#ffffff" opacity="0.95" />
            <circle cx="16" cy="31" r="2.8" fill="#ffffff" opacity="0.95" />
          </g>

          {/* Luồng khói bốc sang cánh phải */}
          <g class={isAnimated() ? 'animate-steam-right' : ''}>
            <path
              d="M 27 28 C 31 26 36 28 39 32 C 41 35 39 39 35 39 C 31 39 29 36 26 31 Z"
              fill="url(#steamGrad)"
              stroke="#cbd5e1"
              stroke-width="0.8"
            />
            <circle cx="36" cy="34" r="3.5" fill="#ffffff" opacity="0.95" />
            <circle cx="32" cy="31" r="2.8" fill="#ffffff" opacity="0.95" />
          </g>
        </g>

        {/* 😎 KÍNH RÂM SIÊU NGẦU (Cool Sunglasses) */}
        <g class="avatar-accessory" style={accessoryStyle('cool_glasses')}>
          <path d="M 10 18 Q 17 17 22 19 L 21 26 Q 16 29 10 26 Z" fill="url(#sunglassGrad)" stroke="#090d16" stroke-width="1.2" />
          <path d="M 26 19 Q 31 17 38 18 L 38 26 Q 32 29 27 26 Z" fill="url(#sunglassGrad)" stroke="#090d16" stroke-width="1.2" />
          <path d="M 21 19 Q 24 18 27 19" stroke="#090d16" stroke-width="2" stroke-linecap="round" fill="none" />
          <g class={isAnimated() ? 'animate-sunglasses-glint' : ''}>
            <path d="M 13 19 L 16 26" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
            <path d="M 29 19 L 32 26" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
          </g>
        </g>

        {/* 🧐 THÁM TỬ KÍNH ĐƠN (Detective Monocle) */}
        <g class="avatar-accessory" style={accessoryStyle('detective_monocle')}>
          <circle cx="31.5" cy="19" r="7.5" fill="none" stroke="url(#goldGrad)" stroke-width="2.2" />
          <path d="M 28 15 A 6 6 0 0 1 35 15" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.8" class={isAnimated() ? 'animate-monocle-gleam' : ''} />
          <path d="M 39 23 Q 41 30 38 38" stroke="url(#goldGrad)" stroke-width="1.4" stroke-linecap="round" fill="none" stroke-dasharray="1.5 1.5" />
        </g>

        {/* 🤔 TAY CHỐNG CẰM GÕ NHỊP (Thinking Hand) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-thinking-hand' : ''}`} style={accessoryStyle('thinking_hand')}>
          {/* Ngón trỏ chỉ lên má */}
          <path d="M 14 36 Q 16 28 20 29 Q 22 33 20 38 Q 15 41 14 36 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
          {/* Ngón cái và mu bàn tay chống dưới cằm */}
          <path d="M 20 32 Q 25 31 29 32 Q 30 36 26 37 L 20 37" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
        </g>

        {/* 😈 SỪNG ÁC QUỶ RUNG RINH (Devil Horns) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-evil-horns' : ''}`} style={accessoryStyle('evil_horns')}>
          <path d="M 11 14 L 8 4 L 17 10 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.2" />
          <path d="M 37 14 L 40 4 L 31 10 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.2" />
        </g>

        {/* 😱 TAY ÔM MÁ HOẢNG HỐT RUN RẨY & GIỌT MỒ HÔI CHẢY RÒNG (Panic Hands & Sweat Drop) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-panic-jitter' : ''}`} style={accessoryStyle('panic_hands')}>
          {/* Bàn tay xanh nhạt ôm má trái */}
          <path d="M 6 22 C 4 25 5 32 8 35 C 10 33 11 27 9 22 Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.2" />
          <line x1="6" y1="26" x2="9" y2="27" stroke="#0284c7" stroke-width="0.8" />
          <line x1="6" y1="30" x2="9" y2="31" stroke="#0284c7" stroke-width="0.8" />

          {/* Bàn tay xanh nhạt ôm má phải */}
          <path d="M 42 22 C 44 25 43 32 40 35 C 38 33 37 27 39 22 Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.2" />
          <line x1="42" y1="26" x2="39" y2="27" stroke="#0284c7" stroke-width="0.8" />
          <line x1="42" y1="30" x2="39" y2="31" stroke="#0284c7" stroke-width="0.8" />

          {/* Giọt mồ hôi xanh chảy ròng từ trán xuống má 😱 */}
          <g class={isAnimated() ? 'animate-sweat-drop' : ''}>
            <path
              d="M 37 13 C 37 10 39.5 8 39.5 8 C 39.5 8 42 10 42 13 C 42 15.5 39.5 17 39.5 17 C 39.5 17 37 15.5 37 13 Z"
              fill="#38bdf8"
              stroke="#0284c7"
              stroke-width="0.7"
            />
            <circle cx="39" cy="12" r="0.7" fill="#ffffff" opacity="0.9" />
          </g>
        </g>

        {/* 🥳 NÓN TIỆC & KÈN GIẤY THỔI PHỒNG (Party Hat & Horn) */}
        <g class="avatar-accessory" style={accessoryStyle('party_hat')}>
          <path d="M 16 11 L 28 2 L 32 14 Z" fill="#ec4899" stroke="#be185d" stroke-width="1" />
          <circle cx="28" cy="2" r="2.5" fill="#facc15" />
          <circle cx="12" cy="27" r="3" fill="#fb7185" opacity="0.7" />
          <circle cx="36" cy="27" r="3" fill="#fb7185" opacity="0.7" />
          <g class={isAnimated() ? 'animate-party-horn' : ''}>
            <path d="M 28 32 Q 38 32 44 26 Q 43 23 39 25 L 28 30 Z" fill="#22c55e" stroke="#15803d" stroke-width="1" />
            <circle cx="44" cy="25" r="2" fill="#ef4444" />
          </g>
        </g>

        {/* 🤣 GIỌT NƯỚC MẮT CƯỜI NHẤP NHÔ (Laugh Tears) */}
        <g class={`avatar-accessory ${isAnimated() ? 'animate-tear-jiggle' : ''}`} style={accessoryStyle('laugh_tears')}>
          <path d="M 7 22 C 7 19 10 18 10 22 C 10 24 7 24 7 22 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="0.6" />
          <path d="M 41 22 C 41 19 38 18 38 22 C 38 24 41 24 41 22 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="0.6" />
        </g>

        {/* 😴 CHỮ ZZZ BAY LƠ LỬNG (Sleepy Zzz) */}
        <g class="avatar-accessory" style={accessoryStyle('sleepy_zzz')}>
          <g class={isAnimated() ? 'animate-float-zzz-1' : ''}>
            <text x="32" y="16" font-family="sans-serif" font-weight="900" font-size="9" fill="#38bdf8">Z</text>
          </g>
          <g class={isAnimated() ? 'animate-float-zzz-2' : ''}>
            <text x="37" y="10" font-family="sans-serif" font-weight="900" font-size="7" fill="#60a5fa">z</text>
          </g>
        </g>

        {/* ☕ TÁCH CÀ PHÊ ẤM ÁP BỐC KHÓI (Chill Coffee) */}
        <g class="avatar-accessory" style={accessoryStyle('chill_coffee')}>
          <rect x="29" y="30" width="10" height="9" rx="2" fill="#ffffff" stroke="#78350f" stroke-width="1.2" />
          <path d="M 39 32 Q 43 34 39 37" stroke="#78350f" stroke-width="1.2" fill="none" />
          <g class={isAnimated() ? 'animate-coffee-vapor' : ''}>
            <path d="M 32 29 Q 34 26 32 24" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" fill="none" />
            <path d="M 36 29 Q 38 26 36 24" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" fill="none" />
          </g>
        </g>
      </svg>
  );
};
