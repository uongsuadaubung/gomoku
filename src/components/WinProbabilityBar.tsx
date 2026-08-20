import { type Component } from 'solid-js';

export interface WinProbabilityBarProps {
  playerWinRate: number;
  botWinRate: number;
}

export const WinProbabilityBar: Component<WinProbabilityBarProps> = (props) => {
  return (
    <div class="space-y-1 select-none">
      <div class="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
        <span class="text-emerald-400">Bạn: {props.playerWinRate}%</span>
        <span class="text-slate-500 font-mono text-[10px]">TƯƠNG QUAN THẾ TRẬN</span>
        <span class="text-rose-400">Bot: {props.botWinRate}%</span>
      </div>
      <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
        <div
          class="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${props.playerWinRate}%` }}
        />
        <div
          class="h-full bg-rose-500 transition-all duration-300"
          style={{ width: `${props.botWinRate}%` }}
        />
      </div>
    </div>
  );
};
