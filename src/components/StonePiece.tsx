import { type Component, Show } from 'solid-js';
import { BLACK, type Player } from '../game/types';

export interface StonePieceProps {
  color: Player;
  isWinning?: boolean;
  isLastMove?: boolean;
  stepNumber?: number | null;
  showStepNumber?: boolean;
  isGhost?: boolean;
}

export const StonePiece: Component<StonePieceProps> = (props) => {
  const isBlack = () => props.color === BLACK;
  const isWinning = () => props.isWinning === true;
  const isLast = () => props.isLastMove === true;
  const isGhost = () => props.isGhost === true;

  if (isGhost()) {
    return (
      <div
        class={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full opacity-40 transition-opacity pointer-events-none z-10 ${
          isBlack() ? 'stone-black' : 'stone-white'
        }`}
      />
    );
  }

  return (
    <div
      class={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full transition-all duration-200 flex items-center justify-center z-10 ${
        isBlack() ? 'stone-black text-slate-200' : 'stone-white text-slate-800'
      } ${isWinning() ? 'animate-win-glow scale-110' : ''}`}
    >
      {/* Hiển thị số thứ tự nước đi nếu bật */}
      <Show when={props.showStepNumber && props.stepNumber !== null && props.stepNumber !== undefined}>
        <span class="text-[8px] sm:text-[10px] md:text-xs font-bold font-mono select-none">
          {props.stepNumber}
        </span>
      </Show>

      {/* Đánh dấu nước đi cuối (Last move dot) */}
      <Show when={isLast() && !isWinning() && !props.showStepNumber}>
        <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shadow-sm animate-pulse" />
      </Show>

      {/* Vòng phát sáng Neon cho 5 quân chiến thắng */}
      <Show when={isWinning()}>
        <div class="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
        <div class="absolute -inset-1 rounded-full border-2 border-amber-300 shadow-lg shadow-amber-400/70 animate-pulse pointer-events-none z-10" />
      </Show>
    </div>
  );
};
