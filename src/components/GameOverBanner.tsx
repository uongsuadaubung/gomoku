import { Component, Show, createSignal, createEffect, createMemo } from 'solid-js';
import { Trophy, Bot, Equal, X, Play, RotateCcw } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { BLACK, WHITE } from '../game/types';

export const GameOverBanner: Component = () => {
  const store = useGame();
  const [dismissed, setDismissed] = createSignal(false);

  createEffect(() => {
    if (store.matchStage() === 'playing') {
      setDismissed(false);
    }
  });

  const isGameOver = () => store.matchStage() === 'game_over' && !dismissed();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  // Tiêu đề kết quả trận đấu
  const titleInfo = createMemo<{ text: string; color: string }>(() => {
    const mode = store.gameMode();
    const won = isPlayerWinner();
    const draw = isDraw();

    if (mode === 'blitz') {
      if (won) return { text: 'Vượt Cấp Cờ Chớp! ⚡🎉', color: 'text-rose-400' };
      if (store.isBlitzTimeout()) return { text: 'Cháy Giờ (Timeout)! ⏱️💥', color: 'text-rose-400' };
      return { text: 'Thất Bại Cờ Chớp! 💥', color: 'text-rose-400' };
    }

    if (mode === 'puzzle') {
      if (won) return { text: 'Giải Thế Cờ Thành Công! 🎉', color: 'text-emerald-400' };
      return { text: 'Chưa Giải Được Thế Cờ! 💥', color: 'text-rose-400' };
    }

    if (won) return { text: 'Xuất Sắc! Bạn Đã Thắng! 🎉', color: 'text-emerald-400' };
    if (draw) return { text: 'Trận Đấu Hòa Cờ! 🤝', color: 'text-slate-200' };
    if (store.lastResigned()) return { text: 'Bạn Đã Nhận Thua 🏳️', color: 'text-rose-400' };
    return { text: 'Bot Đã Giành Chiến Thắng! 💥', color: 'text-rose-400' };
  });

  // Nội dung mô tả chi tiết
  const descriptionText = createMemo<string>(() => {
    const mode = store.gameMode();
    const won = isPlayerWinner();
    const botName = store.currentLevelConfig().vietnameseName;

    if (mode === 'blitz') {
      if (won) return `Chúc mừng bạn đã đánh bại Bot ${botName}! Tiến lên cấp tiếp theo!`;
      if (store.isBlitzTimeout()) return `Bạn đã hết ${store.blitzTimeLimit()}s suy nghĩ! Chuỗi cờ chớp đã dừng lại.`;
      return `Bot ${botName} đã chiến thắng! Chuỗi sinh tử kết thúc.`;
    }

    if (mode === 'puzzle') {
      if (won) return 'Xuất sắc! Bạn đã giải mã thành công thế cờ hóc búa này.';
      return 'Chưa giải được thế cờ! Hãy thử lại hoặc chuyển sang thế cờ mới.';
    }

    if (won) return 'Bạn đã hoàn thành chuỗi 5 quân cờ liên tiếp thành công!';
    if (store.lastResigned()) return 'Bạn đã đầu hàng ván đấu này. Hãy phục thù ở ván tiếp theo!';
    return 'Bot đã hoàn thành chuỗi 5 quân cờ liên tiếp!';
  });

  // Tên chế độ tóm tắt
  const modeSummaryText = createMemo<string>(() => {
    switch (store.gameMode()) {
      case 'blitz':
        return `Cờ Chớp (${store.blitzTimeLimit()}s - Cấp ${store.currentLevelConfig().id})`;
      case 'puzzle':
        return store.currentPuzzle()?.name || 'Thế Cờ Giữa Trận';
      case 'custom':
        return `Đấu Tập (Bot ${store.currentLevelConfig().vietnameseName})`;
      default:
        return `Chiến Dịch (Bot ${store.currentLevelConfig().vietnameseName})`;
    }
  });

  return (
    <Show when={isGameOver()}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
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

          {/* Tiêu đề & Mô tả */}
          <div>
            <h3 class={`text-xl sm:text-2xl font-black ${titleInfo().color}`}>
              {titleInfo().text}
            </h3>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              {descriptionText()}
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
                {modeSummaryText()}
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
          <div class="w-full flex flex-col gap-2 pt-1">
            {/* Chế độ Cờ Chớp */}
            <Show when={store.gameMode() === 'blitz'}>
              <Show
                when={isPlayerWinner()}
                fallback={
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDismissed(true);
                        store.startBlitzMode(store.blitzTimeLimit(), 1);
                      }}
                      class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      <span>Chơi Lại (Cấp 1)</span>
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
                    store.nextBlitzLevel();
                  }}
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer animate-subtle-glow"
                >
                  <Play size={18} fill="currentColor" />
                  <span>⚡ Đấu Cấp Tiếp Theo (Cấp {store.currentLevelConfig().id})</span>
                </button>
              </Show>
            </Show>

            {/* Chế độ Thế Cờ */}
            <Show when={store.gameMode() === 'puzzle'}>
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
                  <RotateCcw size={15} />
                  <span>Chơi Lại</span>
                </button>
              </div>
            </Show>

            {/* Chế độ Chiến Dịch & Đấu Tập */}
            <Show when={store.gameMode() === 'campaign' || store.gameMode() === 'custom'}>
              <button
                onClick={() => {
                  setDismissed(false);
                  store.startNextGame();
                }}
                class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer animate-subtle-glow"
              >
                <Play size={18} fill="currentColor" />
                <span>
                  {store.gameMode() === 'campaign' ? 'Ván Tiếp Theo' : 'Chơi Lại Ván Mới'}
                </span>
              </button>
            </Show>

            {/* Nút Về Menu Chính */}
            <Show when={store.gameMode() !== 'blitz' || isPlayerWinner()}>
              <button
                onClick={() => {
                  setDismissed(true);
                  store.goToMainMenu();
                }}
                class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
              >
                <span>🏠 Về Menu Chính</span>
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
