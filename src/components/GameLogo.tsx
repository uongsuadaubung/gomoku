import { type Component, Show } from 'solid-js';

export interface GameLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

export const GameLogo: Component<GameLogoProps> = (props) => {
  const showText = () => props.showText !== false;

  const iconBoxSize = () => {
    switch (props.size) {
      case 'sm':
        return 'w-7 h-7';
      case 'lg':
        return 'w-10 h-10';
      case 'md':
      default:
        return 'w-8 h-8 sm:w-9 sm:h-9';
    }
  };

  const titleSize = () => {
    switch (props.size) {
      case 'sm':
        return 'text-sm font-extrabold';
      case 'lg':
        return 'text-xl sm:text-2xl font-black';
      case 'md':
      default:
        return 'text-base sm:text-lg md:text-xl font-extrabold';
    }
  };

  return (
    <button
      type="button"
      onClick={() => props.onClick?.()}
      class="flex items-center space-x-2 hover:opacity-90 transition-opacity text-left cursor-pointer"
    >
      {/* 3D Stones Icon Badge */}
      <div class={`flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 p-1 shrink-0 ${iconBoxSize()}`}>
        <svg viewBox="0 0 512 512" class="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="gameLogoBlackStone" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#64748b"/>
              <stop offset="30%" stop-color="#334155"/>
              <stop offset="70%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#020617"/>
            </radialGradient>
            <radialGradient id="gameLogoWhiteStone" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="50%" stop-color="#f8fafc"/>
              <stop offset="80%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#94a3b8"/>
            </radialGradient>
          </defs>
          <circle cx="190" cy="320" r="75" fill="url(#gameLogoBlackStone)"/>
          <ellipse cx="170" cy="295" rx="28" ry="16" fill="#ffffff" opacity="0.3" transform="rotate(-30 170 295)"/>
          <circle cx="320" cy="190" r="75" fill="url(#gameLogoWhiteStone)"/>
          <ellipse cx="300" cy="165" rx="30" ry="19" fill="#ffffff" opacity="0.8" transform="rotate(-30 300 165)"/>
          <path d="M256 210 Q260 245 295 256 Q260 267 256 302 Q252 267 217 256 Q252 245 256 210Z" fill="#fbbf24"/>
          <circle cx="256" cy="256" r="7" fill="#ffffff"/>
        </svg>
      </div>

      {/* Brand Text */}
      <Show when={showText()}>
        <h1 class={`hidden sm:flex tracking-tight text-white items-center gap-0.5 ${titleSize()}`}>
          <span class="tracking-tight">GoMock</span>
          <span class="text-amber-400 font-black">U</span>
        </h1>
      </Show>
    </button>
  );
};
