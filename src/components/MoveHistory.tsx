import { Component, Show, For, createEffect } from 'solid-js';
import { History } from 'lucide-solid';
import { GameStore } from '../store/gameStore';
import { BLACK } from '../game/types';

interface MoveHistoryProps {
  store: GameStore;
}

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

export const MoveHistory: Component<MoveHistoryProps> = props => {
  const { store } = props;
  let scrollContainerRef: HTMLDivElement | undefined;

  const formatCoord = (r: number, c: number) => {
    return `${COL_LETTERS[c]}${15 - r}`;
  };

  // Nhóm các nước đi theo từng cặp lượt (Lượt 1: Đen, Trắng; Lượt 2: Đen, Trắng...)
  const groupedMoves = () => {
    const moves = store.moveHistory();
    const pairs: {
      turnNum: number;
      black?: { coord: string; step: number };
      white?: { coord: string; step: number };
    }[] = [];

    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const turnIndex = Math.floor(i / 2);
      if (!pairs[turnIndex]) {
        pairs[turnIndex] = { turnNum: turnIndex + 1 };
      }
      if (m.player === BLACK) {
        pairs[turnIndex].black = { coord: formatCoord(m.row, m.col), step: m.stepNumber };
      } else {
        pairs[turnIndex].white = { coord: formatCoord(m.row, m.col), step: m.stepNumber };
      }
    }
    return pairs;
  };

  // Tự động cuộn xuống dưới cùng khi có nước đi mới
  createEffect(() => {
    const len = store.moveHistory().length;
    if (len > 0 && scrollContainerRef) {
      setTimeout(() => {
        if (scrollContainerRef) {
          scrollContainerRef.scrollTop = scrollContainerRef.scrollHeight;
        }
      }, 50);
    }
  });

  return (
    <div class="w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col gap-2.5">
      {/* Header danh sách nước đi */}
      <div class="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-bold text-slate-300">
        <div class="flex items-center gap-1.5">
          <div class="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
            <History size={14} />
          </div>
          <span>Danh Sách Nước Đi ({store.moveHistory().length})</span>
        </div>
        <div class="flex items-center gap-3 text-[10px]">
          <span class="flex items-center gap-1 text-slate-400">
            <span class="w-2 h-2 rounded-full stone-black inline-block border border-slate-700" /> Đen
          </span>
          <span class="flex items-center gap-1 text-slate-400">
            <span class="w-2 h-2 rounded-full stone-white inline-block border border-slate-600" /> Trắng
          </span>
        </div>
      </div>

      {/* Bảng các nước đi có thanh cuộn mượt mà */}
      <div
        ref={scrollContainerRef}
        class="max-h-[160px] sm:max-h-[220px] overflow-y-auto history-scrollbar pr-1 space-y-1 select-none"
      >
        <Show
          when={groupedMoves().length > 0}
          fallback={
            <div class="py-5 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <span>Chưa có nước đi nào</span>
              <span class="text-[10px] text-slate-600 mt-0.5">Đặt quân lên bàn cờ để bắt đầu</span>
            </div>
          }
        >
          <For each={groupedMoves()}>
            {item => {
              const isLatestBlack = () =>
                item.black && item.black.step === store.moveHistory().length;
              const isLatestWhite = () =>
                item.white && item.white.step === store.moveHistory().length;

              return (
                <div class="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/50 font-mono transition-colors">
                  <span class="text-slate-500 font-semibold text-[10px] w-6">
                    #{item.turnNum}
                  </span>

                  {/* Nước Quân Đen */}
                  <div class="flex-1 flex items-center justify-center gap-1">
                    <span
                      class={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isLatestBlack()
                          ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300 shadow-sm'
                          : 'bg-slate-800/80 text-slate-200'
                      }`}
                    >
                      {item.black ? item.black.coord : '-'}
                    </span>
                  </div>

                  {/* Nước Quân Trắng */}
                  <div class="flex-1 flex items-center justify-center gap-1">
                    <span
                      class={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isLatestWhite()
                          ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300 shadow-sm'
                          : item.white
                          ? 'bg-slate-800/80 text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.white ? item.white.coord : '-'}
                    </span>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
};
