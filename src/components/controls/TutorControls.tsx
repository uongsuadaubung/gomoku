import { type Component, For, Show, Switch, Match } from 'solid-js';
import {
  RotateCcw,
  Play,
  Flag,
  Sparkles,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Trophy,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';
import { AI_LEVELS } from '../../game/constants';

export const TutorControls: Component = () => {
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

  const highestUnlockedLevel = () => store.stats().tutor?.highestLevel || 1;

  return (
    <Switch>
      {/* GIAI ĐOẠN 1: PLAYING (Đang trong trận đấu Gia Sư) */}
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
              onClick={() => store.undoMove()}
              disabled={!canUndo()}
              class={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                canUndo()
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
              title="Đi lại nước cờ để sửa sai cùng Gia sư"
            >
              <RotateCcw size={16} />
              <span>Đi Lại (Undo)</span>
            </button>
          </div>

          {/* Chọn cấp độ đối thủ */}
          <div class="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <label class="text-[11px] font-bold text-amber-300/90 flex items-center gap-1 shrink-0">
              <GraduationCap size={13} />
              <span>Cấp đối thủ:</span>
            </label>
            <div class="relative flex-1">
              <select
                value={store.selectedOpponentLevel()}
                onChange={e => {
                  const lvl = Number(e.currentTarget.value);
                  store.startTutorMode(lvl);
                }}
                class="w-full py-1.5 px-2.5 pr-7 rounded-lg bg-slate-900 text-slate-200 font-bold text-xs border border-slate-700 hover:border-amber-500/60 focus:outline-none appearance-none cursor-pointer"
              >
                <For each={AI_LEVELS}>
                  {lvl => (
                    <option value={lvl.id} class="bg-slate-900 text-slate-200">
                      Cấp {lvl.id} - {lvl.vietnameseName} {lvl.id > highestUnlockedLevel() ? '🔒' : '✓'}
                    </option>
                  )}
                </For>
              </select>
              <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={13} />
              </div>
            </div>
          </div>
        </div>
      </Match>

      {/* GIAI ĐOẠN 2: GAME OVER (Kết thúc ván đấu) */}
      <Match when={store.matchStage() === 'game_over'}>
        <div class="flex flex-col gap-3 animate-fade-in">
          {/* Thông báo kết quả */}
          <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-400">Kết quả trận đấu</div>
              <div class={`text-sm font-extrabold ${isPlayerWinner() ? 'text-emerald-400' : isDraw() ? 'text-slate-300' : 'text-rose-400'}`}>
                {isPlayerWinner() ? '🎉 Bạn Đã Thắng Đối Thủ!' : isDraw() ? '🤝 Hòa Cờ' : '💥 Đối Thủ Chiến Thắng'}
              </div>
            </div>
            <Show when={isPlayerWinner()}>
              <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Trophy size={18} />
              </div>
            </Show>
          </div>

          {/* Các nút hành động sau trận */}
          <div class="flex flex-col gap-2">
            <Show
              when={isPlayerWinner()}
              fallback={
                <button
                  onClick={() => store.startTutorMode(store.selectedOpponentLevel())}
                  class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Phục Thù Ván Này</span>
                </button>
              }
            >
              <button
                onClick={() => store.nextTutorLevel()}
                class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Tiến Lên Cấp Tiếp Theo ({Math.min(12, store.selectedOpponentLevel() + 1)})</span>
                <ChevronRight size={16} />
              </button>
            </Show>

            <button
              onClick={() => store.goToMainMenu()}
              class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <span>Trở Về Menu Chính</span>
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};
