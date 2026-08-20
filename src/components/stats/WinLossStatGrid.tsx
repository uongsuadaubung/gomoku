import { type Component, type JSX, Show } from 'solid-js';

export interface WinLossStatGridProps {
  wins: number;
  losses: number;
  draws?: number;
  lossLabel?: string;
  thirdColLabel?: string;
  thirdColValue?: number;
  thirdColColor?: 'slate' | 'amber';
  thirdColIcon?: JSX.Element;
}

export const WinLossStatGrid: Component<WinLossStatGridProps> = (props) => {
  const lossLabel = () => props.lossLabel || 'Thua';
  const thirdColLabel = () => props.thirdColLabel || 'Hòa';
  const thirdColValue = () => props.thirdColValue ?? props.draws ?? 0;
  const isAmber = () => props.thirdColColor === 'amber';

  return (
    <div class="grid grid-cols-3 gap-2 text-center">
      {/* 1. Wins */}
      <div class="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
        <span class="text-[11px] text-emerald-400 font-semibold block mb-0.5">Thắng</span>
        <span class="text-base font-black text-emerald-400 font-mono">{props.wins}</span>
      </div>

      {/* 2. Losses */}
      <div class="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm">
        <span class="text-[11px] text-rose-400 font-semibold block mb-0.5">{lossLabel()}</span>
        <span class="text-base font-black text-rose-400 font-mono">{props.losses}</span>
      </div>

      {/* 3. Draws / Timeout */}
      <div
        class={`p-2.5 rounded-2xl border shadow-sm ${
          isAmber()
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-slate-800/40 border-slate-700/40'
        }`}
      >
        <span
          class={`text-[11px] font-semibold mb-0.5 flex items-center justify-center gap-1 ${
            isAmber() ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Show when={props.thirdColIcon}>
            {props.thirdColIcon}
          </Show>
          <span>{thirdColLabel()}</span>
        </span>
        <span
          class={`text-base font-black font-mono ${
            isAmber() ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          {thirdColValue()}
        </span>
      </div>
    </div>
  );
};
