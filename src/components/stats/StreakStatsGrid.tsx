import { type Component } from 'solid-js';
import { Flame, Trophy } from 'lucide-solid';

export interface StreakStatsGridProps {
  currentStreak: number;
  bestStreak: number;
  variant?: 'compact' | 'cards';
}

export const StreakStatsGrid: Component<StreakStatsGridProps> = (props) => {
  const isCards = () => props.variant === 'cards';

  return (
    <div class="grid grid-cols-2 gap-2.5">
      {/* 1. Chuỗi thắng hiện tại */}
      <div
        class={`rounded-2xl border flex items-center transition-all ${
          isCards()
            ? 'p-3 bg-slate-900/90 border-slate-800 space-x-3'
            : 'p-3 bg-slate-950/60 border-slate-800 justify-between'
        }`}
      >
        <div class={isCards() ? 'p-2 rounded-xl bg-orange-500/15 text-orange-400' : ''}>
          <Flame size={isCards() ? 18 : 14} class={isCards() ? '' : 'text-amber-400 inline mr-1.5'} />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium block">
            Chuỗi thắng hiện tại
          </span>
          <span class="font-black text-amber-400 font-mono text-sm">
            {props.currentStreak} {isCards() ? 'ván' : ''}
          </span>
        </div>
      </div>

      {/* 2. Chuỗi thắng dài nhất */}
      <div
        class={`rounded-2xl border flex items-center transition-all ${
          isCards()
            ? 'p-3 bg-slate-900/90 border-slate-800 space-x-3'
            : 'p-3 bg-slate-950/60 border-slate-800 justify-between'
        }`}
      >
        <div class={isCards() ? 'p-2 rounded-xl bg-amber-500/15 text-amber-400' : ''}>
          <Trophy size={isCards() ? 18 : 14} class={isCards() ? '' : 'text-amber-500 inline mr-1.5'} />
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium block">
            Chuỗi thắng dài nhất
          </span>
          <span class="font-black text-amber-500 font-mono text-sm">
            {props.bestStreak} {isCards() ? 'ván' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
