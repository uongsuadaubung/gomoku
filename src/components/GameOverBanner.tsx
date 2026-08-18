import { Component, Show } from 'solid-js';
import { Trophy, Frown, Equal } from 'lucide-solid';
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
        <div class="flex items-center space-x-3.5">
          {/* Status Icon */}
          <div
            class={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
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
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">
              <Show
                when={isPlayerWinner()}
                fallback={
                  <Show
                    when={isDraw()}
                    fallback={
                      <span>
                        {store.lastResigned() ? 'Bạn Đã Nhận Thua' : 'Bot Đã Giành Chiến Thắng!'}
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
      </div>
    </Show>
  );
};
