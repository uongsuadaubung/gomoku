import { type Component, Show } from 'solid-js';
import {
  RotateCcw,
  Play,
  User,
  Bot,
  Flag,
} from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import { BLACK, WHITE } from '../game/types';

interface GameControlsProps {
  store: GameStore;
}

export const GameControls: Component<GameControlsProps> = props => {
  const { store } = props;

  const isMatchActive = () => store.gameStatus() === 'playing';

  const canUndo = () => {
    return (
      store.moveHistory().length > 0 &&
      !store.isAiThinking() &&
      store.gameStatus() === 'playing'
    );
  };

  return (
    <div class="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3 transition-all">
      {/* Top Action Row: Ván Mới / Nhận Thua, Undo */}
      <div class="grid grid-cols-2 gap-2.5">
        {/* Nút Nhận Thua khi đang trong trận; Nút Ván Mới khi trận kết thúc */}
        <Show
          when={isMatchActive()}
          fallback={
            <button
              onClick={() => store.startNewGame(store.playerColor() === BLACK)}
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play size={16} fill="currentColor" />
              <span>Ván Mới</span>
            </button>
          }
        >
          <button
            onClick={() => store.resignGame()}
            disabled={store.isAiThinking()}
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-md shadow-rose-950/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Đầu hàng và chấp nhận kết quả ván đấu hiện tại"
          >
            <Flag size={16} />
            <span>Nhận Thua</span>
          </button>
        </Show>

        {/* Undo Button */}
        <button
          onClick={() => store.undoMove()}
          disabled={!canUndo()}
          class={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
            canUndo()
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
              : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
          }`}
        >
          <RotateCcw size={16} />
          <span>Đi Lại</span>
        </button>
      </div>

      {/* Bottom Option Row: Side Selector (Black / White) - Chỉ hiện khi ván đấu chưa bắt đầu hoặc đã kết thúc */}
      <Show when={!isMatchActive()}>
        <div class="pt-2 border-t border-slate-800/80 animate-fade-in">
          <div class="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => store.setPlayerSide(true)}
              class={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                store.playerColor() === BLACK
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bạn cầm quân Đen và đi nước đầu tiên"
            >
              <User size={14} />
              <span>Bạn Đi Trước</span>
            </button>

            <button
              onClick={() => store.setPlayerSide(false)}
              class={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                store.playerColor() === WHITE
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bot cầm quân Đen và đi nước đầu tiên"
            >
              <Bot size={14} />
              <span>Bot Đi Trước</span>
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
