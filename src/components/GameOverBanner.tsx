import { Component, Show, createSignal, createEffect } from 'solid-js';
import { Trophy, Bot, Equal, X, Play, Eye } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { BLACK, WHITE } from '../game/types';

export const GameOverBanner: Component = () => {
  const store = useGame();
  const [dismissed, setDismissed] = createSignal(false);

  // Reset trạng thái dismissed khi ván cờ mới bắt đầu
  createEffect(() => {
    if (store.matchStage() === 'playing') {
      setDismissed(false);
    }
  });

  const isGameOver = () =>
    store.matchStage() === 'game_over' && !dismissed();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  const handleNextGame = () => {
    setDismissed(false);
    store.startNextGame();
  };

  return (
    <Show when={isGameOver()}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
        {/* Backdrop che mờ nền (không ẩn khi ấn ra ngoài) */}
        <div class="absolute inset-0" />

        {/* Thẻ Modal thông báo kết thúc trận đấu */}
        <div class="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col items-center text-center gap-4 animate-scale-in">
          {/* Nút đóng (X) */}
          <button
            onClick={() => setDismissed(true)}
            class="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng để xem lại bàn cờ"
          >
            <X size={18} />
          </button>

          {/* Biểu tượng trạng thái kết quả */}
          <div
            class={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 transition-transform duration-300 ${
              isPlayerWinner()
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20 scale-105'
                : isDraw()
                ? 'bg-slate-800 text-slate-300 border-slate-700 shadow-slate-900/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/20'
            }`}
          >
            <Show
              when={isPlayerWinner()}
              fallback={
                <Show when={isDraw()} fallback={<Bot size={38} class="text-rose-400" />}>
                  <Equal size={38} class="text-slate-300" />
                </Show>
              }
            >
              <Trophy size={38} class="text-amber-400 animate-bounce" />
            </Show>
          </div>

          {/* Tiêu đề kết quả */}
          <div>
            <h3 class="text-xl sm:text-2xl font-black text-white">
              <Show
                when={store.gameMode() === 'puzzle'}
                fallback={
                  <Show
                    when={isPlayerWinner()}
                    fallback={
                      <Show
                        when={isDraw()}
                        fallback={
                          <span class="text-rose-400">
                            {store.lastResigned() ? 'Bạn Đã Nhận Thua' : 'Bot Đã Giành Chiến Thắng!'}
                          </span>
                        }
                      >
                        <span class="text-slate-200">Trận Đấu Hòa Cờ!</span>
                      </Show>
                    }
                  >
                    <span class="text-emerald-400">Xuất Sắc! Bạn Đã Thắng! 🎉</span>
                  </Show>
                }
              >
                <Show
                  when={isPlayerWinner()}
                  fallback={<span class="text-rose-400">Chưa Giải Được Thế Cờ! 💥</span>}
                >
                  <span class="text-emerald-400">
                    Giải Thế Cờ Thành Công! 🎉
                  </span>
                </Show>
              </Show>
            </h3>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              <Show
                when={store.gameMode() === 'puzzle'}
                fallback={
                  isPlayerWinner()
                    ? 'Bạn đã hoàn thành chuỗi 5 quân cờ liên tiếp thành công!'
                    : store.lastResigned()
                    ? 'Bạn đã đầu hàng ván đấu này. Hãy phục thù ở ván tiếp theo!'
                    : 'Bot đã hoàn thành chuỗi 5 quân cờ liên tiếp!'
                }
              >
                <Show
                  when={isPlayerWinner()}
                  fallback={'Chưa giải được thế cờ! Hãy thử lại hoặc chuyển sang thế cờ mới.'}
                >
                  {'Xuất sắc! Bạn đã giải mã thành công thế cờ hóc búa này.'}
                </Show>
              </Show>
            </p>
          </div>

          {/* Bảng thống kê tóm tắt ván đấu */}
          <div class="w-full grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800/80 text-xs">
            <div class="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
              <span class="text-[11px] text-slate-400 font-medium">Số nước đi</span>
              <span class="text-sm sm:text-base font-bold text-amber-300 font-mono mt-0.5">
                {store.gameMode() === 'puzzle'
                  ? `${store.moveHistory().length - (store.currentPuzzle()?.initialMoveHistory.length || 0)} nước thêm`
                  : `${store.moveHistory().length} nước`}
              </span>
            </div>

            <div class="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
              <span class="text-[11px] text-slate-400 font-medium">Chế độ</span>
              <span class="text-xs font-bold text-slate-200 mt-0.5 truncate max-w-[120px]">
                {store.gameMode() === 'puzzle'
                  ? (store.currentPuzzle()?.name || 'Thế Cờ Giữa Trận')
                  : store.gameMode() === 'custom'
                  ? `Đấu Tập (Bot ${store.currentLevelConfig().vietnameseName})`
                  : `Chiến Dịch (Bot ${store.currentLevelConfig().vietnameseName})`}
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
          <div class="w-full flex flex-col gap-2 pt-1">
            <Show
              when={store.gameMode() === 'puzzle'}
              fallback={
                <button
                  onClick={handleNextGame}
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer animate-subtle-glow"
                >
                  <Play size={18} fill="currentColor" />
                  <span>
                    {store.gameMode() === 'campaign' ? 'Ván Tiếp Theo' : 'Chơi Lại Ván Mới'}
                  </span>
                </button>
              }
            >
              <div class="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDismissed(true);
                    store.nextPuzzleScenario();
                  }}
                  class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>🎲 Câu Đố Mới</span>
                </button>
                <button
                  onClick={() => {
                    setDismissed(true);
                    store.restartCurrentPuzzle();
                  }}
                  class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs sm:text-sm border border-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  <span>🔄 Chơi Lại</span>
                </button>
              </div>
            </Show>

            {/* Nút Về Menu Chính */}
            <button
              onClick={() => {
                setDismissed(true);
                store.goToMainMenu();
              }}
              class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
            >
              <span>🏠 Về Menu Chính</span>
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
