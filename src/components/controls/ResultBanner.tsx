import { type Component, Show } from 'solid-js';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';

export interface ResultBannerProps {
  won?: boolean;
  draw?: boolean;
  lastResigned?: boolean;
  winText?: string;
  lossText?: string;
  drawText?: string;
}

export const ResultBanner: Component<ResultBannerProps> = (props) => {
  const store = useGame();

  const isPlayerWinner = () => {
    if (props.won !== undefined) return props.won;
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => {
    if (props.draw !== undefined) return props.draw;
    return store.gameStatus() === 'draw';
  };

  const isResigned = () => {
    if (props.lastResigned !== undefined) return props.lastResigned;
    return store.lastResigned();
  };

  return (
    <div
      class={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all animate-fade-in ${
        isPlayerWinner()
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-950/30'
          : isDraw()
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/30'
      }`}
    >
      <Show
        when={isPlayerWinner()}
        fallback={
          <Show
            when={isDraw()}
            fallback={
              <span>
                💥 {props.lossText || (isResigned() ? 'Bạn đã nhận thua ván này' : 'Bot đã giành chiến thắng')}
              </span>
            }
          >
            <span>🤝 {props.drawText || 'Trận đấu hòa cờ!'}</span>
          </Show>
        }
      >
        <span>🎉 {props.winText || 'Xuất sắc! Bạn đã chiến thắng!'}</span>
      </Show>
    </div>
  );
};
