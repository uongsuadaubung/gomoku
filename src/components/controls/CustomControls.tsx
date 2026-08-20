import { type Component, Show, Switch, Match } from 'solid-js';
import {
  RotateCcw,
  Play,
  Flag,
  Sparkles,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';

export const CustomControls: Component = () => {
  const store = useGame();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  const canUndo = () => {
    return (
      store.matchStage() === 'playing' &&
      !store.isAiThinking() &&
      store.currentStrategy().canUndo() &&
      store.moveHistory().some(m => m.player === store.playerColor())
    );
  };

  let undoHoverStartTime = 0;
  let lastUndoHesitationTime = 0;

  const handleUndoMouseEnter = () => {
    if (!canUndo()) return;
    undoHoverStartTime = Date.now();
  };

  const handleUndoMouseLeave = () => {
    const now = Date.now();
    if (
      undoHoverStartTime > 0 &&
      now - undoHoverStartTime >= 2000 &&
      now - lastUndoHesitationTime > 45000 &&
      store.matchStage() === 'playing'
    ) {
      store.triggerTaunt('HOVER_UNDO_HESITATION', 200);
      lastUndoHesitationTime = now;
    }
    undoHoverStartTime = 0;
  };

  return (
    <Switch>
      {/* GIAI ĐOẠN 1: PLAYING (Đang trong trận đấu tùy chọn) */}
      <Match when={store.matchStage() === 'playing'}>
        <div class="flex flex-col gap-3 animate-fade-in">
          <div class="grid grid-cols-2 gap-2.5">
            {/* Nút Nhận Thua */}
            <button
              onClick={() => store.resignGame()}
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-md shadow-rose-950/40 active:scale-95 transition-all cursor-pointer"
              title="Đầu hàng và nhận thua ván đấu"
            >
              <Flag size={16} />
              <span>Nhận Thua</span>
            </button>

            {/* Nút Đi Lại (Undo) */}
            <button
              onClick={() => {
                undoHoverStartTime = 0;
                store.undoMove();
              }}
              onMouseEnter={handleUndoMouseEnter}
              onMouseLeave={handleUndoMouseLeave}
              disabled={!canUndo()}
              class={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                canUndo()
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={16} />
              <span>Đi Lại</span>
            </button>
          </div>

          {/* Thông tin ván đấu */}
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
            <span class="flex items-center gap-1.5 text-amber-400/90">
              <Sparkles size={13} />
              <span>Đấu Tập (Bot {store.currentLevelConfig().vietnameseName})</span>
            </span>
            <span>
              {store.playerColor() === BLACK ? 'Bạn cầm Đen' : 'Bạn cầm Trắng'}
            </span>
          </div>
        </div>
      </Match>

      {/* GIAI ĐOẠN 2: GAME_OVER (Ván đấu kết thúc) */}
      <Match when={store.matchStage() === 'game_over'}>
        <div class="flex flex-col gap-2.5 animate-fade-in">
          {/* Huy hiệu thông báo kết quả inline */}
          <div
            class={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm ${
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
                <Show when={isDraw()} fallback={<span>💥 {store.lastResigned() ? 'Bạn đã nhận thua ván này' : 'Bot đã giành chiến thắng'}</span>}>
                  <span>🤝 Trận đấu hòa cờ!</span>
                </Show>
              }
            >
              <span>🎉 Xuất sắc! Bạn đã chiến thắng!</span>
            </Show>
          </div>

          <button
            onClick={() => store.startNextGame()}
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer animate-start-pulse"
          >
            <Play size={16} fill="currentColor" />
            <span>Chơi Lại Ván Mới</span>
          </button>

          <button
            onClick={() => store.goToMainMenu()}
            class="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🏠 Về Menu Chính</span>
          </button>
        </div>
      </Match>
    </Switch>
  );
};
