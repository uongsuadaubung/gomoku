import { type Component, Show, Switch, Match, For, createSignal } from 'solid-js';
import {
  Zap,
  Flag,
  RotateCcw,
  Timer,
  ChevronRight,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';
import { BotPreviewCard } from '../BotPreviewCard';
import { SideSelector } from '../SideSelector';

export const BlitzControls: Component = () => {
  const store = useGame();
  const isMatchActive = () => store.matchStage() === 'playing';

  // Thời gian suy nghĩ được chọn (5s / 10s / 15s - Mặc định theo store)
  const [selectedTime, setSelectedTime] = createSignal<5 | 10 | 15>(
    store.blitzTimeLimit() || 10
  );

  const handleSelectTime = (sec: 5 | 10 | 15) => {
    setSelectedTime(sec);
    store.setBlitzTimeLimit(sec);
  };

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  return (
    <Switch>
      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 1: READY (Thiết lập Cờ Chớp - Chọn thời gian & Chọn bên đi trước) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'ready'}>
        <div class="w-full flex flex-col gap-3 p-4 rounded-3xl bg-slate-900/95 border border-rose-500/30 shadow-xl animate-fade-in select-none">
          {/* Header */}
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Zap size={14} class="text-rose-400" />
              <span>Thiết lập Thách Đấu Cờ Chớp:</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Zap size={10} /> Cấp {store.currentLevelConfig().id}
            </span>
          </div>

          {/* Thẻ xem trước đối thủ hiện tại */}
          <BotPreviewCard
            bot={store.currentLevelConfig()}
            theme="rose"
          />

          {/* 1. Chọn thời gian suy nghĩ mỗi nước */}
          <div class="flex flex-col gap-1.5 pt-0.5">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span class="flex items-center gap-1">
                <Timer size={13} class="text-rose-400" />
                <span>Thời gian suy nghĩ / nước:</span>
              </span>
              <span class="text-rose-400 font-mono text-[10px]">
                {selectedTime() === 5 ? '⚡ Cực Nhanh' : selectedTime() === 10 ? '⏱️ Tiêu Chuẩn' : '⏳ Thư Thả'}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-1.5">
              <For each={[5, 10, 15] as const}>
                {sec => (
                  <button
                    type="button"
                    onClick={() => handleSelectTime(sec)}
                    class={`py-2 px-1 rounded-2xl font-mono text-xs font-extrabold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      selectedTime() === sec
                        ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white border-rose-400 shadow-md shadow-rose-500/30 scale-[1.02]'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span class="text-sm">{sec}s</span>
                    <span class="text-[9px] font-sans font-medium opacity-80">
                      {sec === 5 ? '5 Giây' : sec === 10 ? '10 Giây' : '15 Giây'}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* 2. Chọn bên đi trước & Bắt đầu trận đấu */}
          <div class="border-t border-slate-800/80 pt-0.5">
            <SideSelector
              onSelectSide={(isBlack) => store.startBlitzMatch(selectedTime(), isBlack)}
              theme="rose"
            />
          </div>

          {/* Nút Trở Về Menu */}
          <button
            type="button"
            onClick={() => store.goToMainMenu()}
            class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer mt-0.5"
          >
            <span>🏠 Trở Về Menu</span>
          </button>
        </div>
      </Match>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 2: PLAYING & GAME OVER (Đang trong trận đấu hoặc kết thúc trận) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'playing' || store.matchStage() === 'game_over'}>
        <div class="flex flex-col gap-2.5 animate-fade-in select-none">
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
                        type="button"
                        onClick={() => store.enterBlitzMode(1)}
                        class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>Thử Thách Lại (Cấp 1)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => store.goToMainMenu()}
                        class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>🏠 Về Menu</span>
                      </button>
                    </div>
                  }
                >
                  <button
                    type="button"
                    onClick={() => store.nextBlitzLevel()}
                    class="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-subtle-glow"
                  >
                    <Zap size={15} />
                    <span>⚡ Đấu Cấp Tiếp Theo (Cấp {store.currentLevelConfig().id})</span>
                    <ChevronRight size={15} />
                  </button>
                </Show>
              </div>
            }
          >
            <button
              type="button"
              onClick={() => store.resignGame()}
              class="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Flag size={14} />
              <span>Đầu Hàng (Dừng chuỗi)</span>
            </button>
          </Show>
        </div>
      </Match>
    </Switch>
  );
};
