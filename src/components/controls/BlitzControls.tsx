import { type Component, Show } from 'solid-js';
import { Zap, Flag, RotateCcw } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';

export const BlitzControls: Component = () => {
  const store = useGame();
  const isMatchActive = () => store.matchStage() === 'playing';

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  return (
    <div class="flex flex-col gap-2.5 animate-fade-in">
      {/* Blitz Status & Live Countdown Bar */}
      <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-inner">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-bold text-rose-400">
            <Zap size={14} />
            <span>Bot Cấp {store.currentLevelConfig().id} ({store.currentLevelConfig().vietnameseName})</span>
          </div>
          <div class="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">
            <span>🔥 Chuỗi: {store.stats().blitz?.currentStreak || 0}</span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div>
          <div class="flex justify-between items-center text-[11px] mb-1">
            <span class="text-slate-400 font-medium">
              {store.currentTurn() === store.playerColor() && isMatchActive()
                ? '⏱️ Đến lượt bạn đi:'
                : '🤖 Bot đang suy nghĩ...'}
            </span>
            <span
              class={`font-mono font-black text-sm ${
                store.blitzRemainingTime() <= 3 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {store.blitzRemainingTime().toFixed(1)}s
            </span>
          </div>

          <div class="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              class={`h-full transition-all duration-100 ${
                store.blitzRemainingTime() <= 3
                  ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                  : store.blitzRemainingTime() <= 6
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (store.blitzRemainingTime() / store.blitzTimeLimit()) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Blitz Action Buttons */}
      <Show
        when={isMatchActive()}
        fallback={
          <div class="flex flex-col gap-2">
            <Show
              when={isPlayerWinner()}
              fallback={
                <div class="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => store.startBlitzMode(store.blitzTimeLimit(), 1)}
                    class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Chơi Lại (Cấp 1)</span>
                  </button>
                  <button
                    onClick={() => store.goToMainMenu()}
                    class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🏠 Về Menu</span>
                  </button>
                </div>
              }
            >
              <button
                onClick={() => store.nextBlitzLevel()}
                class="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-subtle-glow"
              >
                <Zap size={15} />
                <span>⚡ Đấu Cấp Tiếp Theo (Cấp {store.currentLevelConfig().id})</span>
              </button>
            </Show>
          </div>
        }
      >
        <button
          onClick={() => store.resignGame()}
          class="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Flag size={14} />
          <span>Đầu Hàng (Dừng chuỗi)</span>
        </button>
      </Show>
    </div>
  );
};
