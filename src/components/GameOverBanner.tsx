import { Component, Show, createSignal, createEffect, createMemo } from 'solid-js';
import { X, Play, RotateCcw, Sparkles } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { BLACK, WHITE } from '../game/types';
import { BotAvatar } from './BotAvatar';
import { GameOverPresentationContext } from '../game/strategies/types';

export const GameOverBanner: Component = () => {
  const store = useGame();
  const [dismissed, setDismissed] = createSignal(false);

  createEffect(() => {
    if (store.matchStage() === 'playing') {
      setDismissed(false);
    }
  });

  // CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ GIA SƯ (TUTOR MODE), CÁC CHẾ ĐỘ KHÁC HOÀN TOÀN KHÔNG HIỆN POPUP
  const isGameOver = () => store.gameMode() === 'tutor' && store.matchStage() === 'game_over' && !dismissed();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  const presentationCtx = createMemo<GameOverPresentationContext>(() => ({
    won: isPlayerWinner(),
    draw: isDraw(),
    lastResigned: store.lastResigned(),
    botConfig: store.currentLevelConfig(),
  }));

  // Tiêu đề kết quả trận đấu
  const titleInfo = createMemo<{ text: string; color: string }>(() => {
    return store.currentStrategy().getGameOverTitle(presentationCtx());
  });

  return (
    <Show when={isGameOver()}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
        <div class="absolute inset-0" />

        {/* Thẻ Modal Tổng Kết Sau Trận Của Gia Sư Gomo */}
        <div class="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col items-center text-center gap-4 animate-scale-in">
          {/* Nút đóng (X) */}
          <button
            onClick={() => setDismissed(true)}
            class="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng để xem lại bàn cờ"
          >
            <X size={18} />
          </button>

          <Show when={store.tutorMatchReview()}>
            {review => (
              <div class="w-full flex flex-col items-center gap-3 animate-fade-in">
                {/* Header Tutor với Avatar Gia Sư Gomo */}
                <div class="flex items-center gap-3 w-full justify-start border-b border-slate-800/80 pb-2.5">
                  <div class="w-11 h-11 flex items-center justify-center text-3xl shrink-0">
                    <BotAvatar name={isPlayerWinner() ? (review().accuracy >= 85 ? 'party' : 'cool') : isDraw() ? 'thinking' : 'chill'} />
                  </div>
                  <div class="text-left flex-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-black text-amber-300">Gia Sư Gomo</span>
                      <span class="text-[10px] text-slate-400 font-medium">• Tổng Kết Học Viện Gomo</span>
                    </div>
                    <h3 class={`text-lg sm:text-xl font-black ${titleInfo().color}`}>
                      {titleInfo().text}
                    </h3>
                  </div>
                </div>

                {/* Accuracy & Grade Card */}
                <div class="w-full rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3 flex items-center justify-between shadow-inner">
                  <div class="flex flex-col text-left pl-1">
                    <span class="text-[11px] font-semibold text-slate-400">Độ Chính Xác Nước Cờ</span>
                    <span class="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight font-mono">
                      {review().accuracy}%
                    </span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${review().gradeBadgeClass}`}>
                      Hạng {review().grade} • {review().gradeTitle}
                    </span>
                  </div>
                </div>

                {/* 4-Stat Tactical Grid */}
                <div class="w-full grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                    <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-amber-400">🌟</span> Nước Cờ Vàng
                    </span>
                    <span class="font-bold text-amber-300 font-mono">{review().brilliantMoves}</span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                    <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-emerald-400">✨</span> Nước Đi Tốt
                    </span>
                    <span class="font-bold text-emerald-300 font-mono">{review().goodMoves}</span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                    <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-rose-400">⚠️</span> Sơ Hở
                    </span>
                    <span class={`font-bold font-mono ${review().blunders > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {review().blunders}
                    </span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70">
                    <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-sky-400">🎯</span> Bỏ Lỡ Sát Cục
                    </span>
                    <span class={`font-bold font-mono ${review().missedWins > 0 ? 'text-sky-400' : 'text-slate-400'}`}>
                      {review().missedWins}
                    </span>
                  </div>
                </div>

                {/* Gomo's Tactical Debrief Callout */}
                <div class="w-full text-left p-3 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950/80 to-slate-900/80 border border-amber-500/30 shadow-inner">
                  <div class="flex items-center gap-1 text-[11px] font-bold text-amber-400 mb-1">
                    <Sparkles size={12} /> Lời Khuyên Của Gia Sư Gomo:
                  </div>
                  <p class="text-xs text-amber-100/90 leading-relaxed font-medium">
                    {review().summaryAdvice}
                  </p>
                </div>

                {/* Action Buttons for Tutor Mode */}
                <div class="w-full flex flex-col gap-2 pt-1">
                  <Show
                    when={isPlayerWinner()}
                    fallback={
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setDismissed(true);
                            store.startTutorMode(store.currentLevelConfig().id);
                          }}
                          class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <RotateCcw size={15} />
                          <span>Thử Lại Trận Này</span>
                        </button>
                        <button
                          onClick={() => {
                            setDismissed(true);
                            store.goToMainMenu();
                          }}
                          class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <span>🏠 Về Menu</span>
                        </button>
                      </div>
                    }
                  >
                    <button
                      onClick={() => {
                        setDismissed(true);
                        store.nextTutorLevel();
                      }}
                      class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer animate-subtle-glow"
                    >
                      <Play size={18} fill="currentColor" />
                      <span>Tiếp Tục Cấp {Math.min(12, store.currentLevelConfig().id + 1)}</span>
                    </button>

                    <div class="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setDismissed(true);
                          store.startTutorMode(store.currentLevelConfig().id);
                        }}
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>Đấu Lại Cấp Này</span>
                      </button>
                      <button
                        onClick={() => {
                          setDismissed(true);
                          store.goToMainMenu();
                        }}
                        class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>🏠 Về Menu</span>
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>
        </div>
      </div>
    </Show>
  );
};
