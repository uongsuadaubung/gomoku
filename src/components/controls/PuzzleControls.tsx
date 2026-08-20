import { type Component, Show } from 'solid-js';
import { RotateCcw, Flag, Sparkles } from 'lucide-solid';
import { useGame } from '../../store/GameContext';

export const PuzzleControls: Component = () => {
  const store = useGame();
  const isMatchActive = () => store.matchStage() === 'playing';

  return (
    <div class="flex flex-col gap-2.5 animate-fade-in">
      {/* Tên thế cờ nghệ thuật */}
      <div class="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs shadow-inner">
        <span class="text-[11px] text-slate-400 font-medium">Thế cờ</span>
        <span class="font-black text-amber-300 tracking-wide">
          {store.currentPuzzle()?.name || 'Thế Cờ Giữa Trận'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        {/* Vị trí 1: Khi đang chơi là 'Đầu Hàng' -> Khi ván kết thúc chuyển thành 'Thế Cờ Mới' */}
        <Show
          when={isMatchActive()}
          fallback={
            <button
              onClick={() => store.nextPuzzleScenario()}
              class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-subtle-glow"
            >
              <Sparkles size={14} />
              <span>Thế Cờ Mới</span>
            </button>
          }
        >
          <button
            onClick={() => store.resignGame()}
            class="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Flag size={14} />
            <span>Đầu Hàng</span>
          </button>
        </Show>

        {/* Vị trí 2: Nút Chơi Lại thế cờ hiện tại */}
        <button
          onClick={() => store.restartCurrentPuzzle()}
          class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Chơi Lại</span>
        </button>
      </div>
    </div>
  );
};
