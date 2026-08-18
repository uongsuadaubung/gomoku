import { Component, Show } from 'solid-js';
import { Trophy, Frown, Equal, Play, RotateCcw } from 'lucide-solid';
import { GameStore } from '../store/gameStore';
import { BLACK, WHITE } from '../game/types';

interface GameOverBannerProps {
  store: GameStore;
}

export const GameOverBanner: Component<GameOverBannerProps> = props => {
  const { store } = props;

  const isGameOver = () =>
    store.gameStatus() === 'black_win' ||
    store.gameStatus() === 'white_win' ||
    store.gameStatus() === 'draw';

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  return (
    <Show when={isGameOver()}>
      <div class="w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl animate-scale-in">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Status Message */}
          <div class="flex items-center space-x-3.5">
            <div
              class={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                isPlayerWinner()
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isDraw()
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              <Show
                when={isPlayerWinner()}
                fallback={
                  <Show when={isDraw()} fallback={<Frown size={24} />}>
                    <Equal size={24} />
                  </Show>
                }
              >
                <Trophy size={24} />
              </Show>
            </div>

            <div>
              <h3 class="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                <Show
                  when={isPlayerWinner()}
                  fallback={
                    <Show
                      when={isDraw()}
                      fallback={
                        <span>
                          {store.winInfo() ? 'Bot Đã Giành Chiến Thắng!' : 'Bạn Đã Nhận Thua • Bot Thắng'}
                        </span>
                      }
                    >
                      <span>Trận Đấu Hòa Cờ!</span>
                    </Show>
                  }
                >
                  <span class="text-emerald-400">Xuất Sắc! Bạn Đã Chiến Thắng!</span>
                </Show>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Tổng cộng {store.moveHistory().length} nước đi đã được thực hiện.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={() => store.undoMove()}
              class="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Xem lại / Đi lại</span>
            </button>

            <button
              onClick={() => store.startNewGame(store.playerColor() === BLACK)}
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Play size={14} fill="currentColor" />
              <span>Ván Mới</span>
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
