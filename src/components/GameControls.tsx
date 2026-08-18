import { type Component, Show } from 'solid-js';
import {
  RotateCcw,
  Play,
  User,
  Bot,
  Flag,
  RotateCw,
  Sparkles,
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

  const nextSideText = () =>
    store.nextSeriesPlayerSide() ? 'Bạn Đi Trước (Quân Đen)' : 'Bot Đi Trước (Quân Đen)';

  return (
    <div class="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3 transition-all">
      {/* 1. TRẠNG THÁI TRẬN ĐẤU ĐANG DIỄN RA */}
      <Show when={isMatchActive()}>
        <div class="grid grid-cols-2 gap-2.5">
          {/* Nút Nhận Thua */}
          <button
            onClick={() => store.resignGame()}
            disabled={store.isAiThinking()}
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-md shadow-rose-950/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
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
            <span>Ván #{store.seriesGameNumber() || 1}</span>
          </span>
          <span>
            {store.playerColor() === BLACK ? 'Bạn cầm Đen (Đi trước)' : 'Bạn cầm Trắng (Đi sau)'}
          </span>
        </div>
      </Show>

      {/* 2. TRẠNG THÁI VÁN KẾT THÚC TỰ NHIÊN (Thắng/Thua/Hòa) */}
      <Show when={!isMatchActive() && store.isSeriesActive() && !store.lastResigned()}>
        <div>
          {/* Nút Ván Tiếp Theo (Tự động đảo bên) */}
          <button
            onClick={() => store.startNextGame()}
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            <span>Ván Tiếp Theo</span>
          </button>
        </div>


        {/* Báo lượt đi tiếp theo */}
        <div class="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-1.5 text-slate-300 text-center sm:text-left">
            <RotateCw size={13} class="text-amber-400 shrink-0" />
            <span>
              Ván tiếp theo: <strong class="text-amber-400 font-semibold">{nextSideText()}</strong>
            </span>
          </div>

          <button
            onClick={() => store.resetSeries()}
            class="text-[11px] text-slate-400 hover:text-amber-400 hover:underline transition-all"
          >
            Chọn lại lượt đi
          </button>
        </div>
      </Show>

      {/* 3. TRẠNG THÁI BẮT ĐẦU (Lần đầu vào game hoặc sau khi đầu hàng) */}
      <Show when={!isMatchActive() && (!store.isSeriesActive() || store.lastResigned())}>
        <div class="flex flex-col gap-2.5 animate-fade-in">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} class="text-amber-400" />
              <span>Chọn lượt đi trước để bắt đầu:</span>
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => store.startNewSeries(true)}
              class="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-amber-400 text-xs font-bold shadow-md active:scale-95 transition-all group"
            >
              <div class="flex items-center gap-1.5">
                <User size={15} class="group-hover:scale-110 transition-transform" />
                <span>Bạn Đi Trước</span>
              </div>
              <span class="text-[10px] opacity-75 font-normal">Bạn cầm quân Đen (●)</span>
            </button>

            <button
              onClick={() => store.startNewSeries(false)}
              class="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-amber-400 text-xs font-bold shadow-md active:scale-95 transition-all group"
            >
              <div class="flex items-center gap-1.5">
                <Bot size={15} class="group-hover:scale-110 transition-transform" />
                <span>Bot Đi Trước</span>
              </div>
              <span class="text-[10px] opacity-75 font-normal">Bot cầm quân Đen (●)</span>
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

