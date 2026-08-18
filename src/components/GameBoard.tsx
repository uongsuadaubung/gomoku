import { type Component, For, Show, createSignal } from 'solid-js';
import type { GameStore } from '../store/gameStore';
import { BOARD_SIZE, EMPTY, BLACK, WHITE } from '../game/types';
import { STAR_POINTS } from '../game/constants';

interface GameBoardProps {
  store: GameStore;
}

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
const ROW_NUMBERS = Array.from({ length: 15 }, (_, i) => 15 - i); // 15 down to 1

export const GameBoard: Component<GameBoardProps> = props => {
  const { store } = props;
  const [hoverPos, setHoverPos] = createSignal<{ row: number; col: number } | null>(null);

  const isStarPoint = (r: number, c: number) => {
    return STAR_POINTS.some(([sr, sc]) => sr === r && sc === c);
  };

  const isWinningCell = (r: number, c: number) => {
    const win = store.winInfo();
    if (!win) return false;
    return win.line.some(([wr, wc]) => wr === r && wc === c);
  };

  const isLastMove = (r: number, c: number) => {
    const lm = store.lastMove();
    return lm ? lm.row === r && lm.col === c : false;
  };

  const getStepNumber = (r: number, c: number) => {
    const item = store.moveHistory().find(m => m.row === r && m.col === c);
    return item ? item.stepNumber : null;
  };

  const canPlay = () => {
    return (
      store.gameStatus() === 'playing' &&
      !store.isAiThinking() &&
      store.currentTurn() === store.playerColor()
    );
  };

  const handleCellClick = (r: number, c: number) => {
    if (!canPlay()) {
      if (store.gameStatus() === 'idle' || !store.isSeriesActive()) {
        store.triggerTaunt('CLICK_BEFORE_START', 50);
      }
      return;
    }
    if (store.board()[r][c] !== EMPTY) {
      store.triggerTaunt('CLICK_OCCUPIED_CELL', 100);
      return;
    }
    store.makePlayerMove(r, c);
  };

  const themeClass = () => {
    const t = store.theme();
    if (t === 'paper') return 'board-paper border-stone-400/90 shadow-stone-900/40';
    if (t === 'jade') return 'board-jade border-emerald-600/70 shadow-emerald-950/60';
    if (t === 'cyber') return 'board-cyber border-cyan-500/60 shadow-cyan-950/80';
    if (t === 'slate') return 'board-slate border-slate-700/80 shadow-slate-950/70';
    return 'board-wood border-amber-950/60 shadow-amber-950/70';
  };

  const lineBg = () => {
    const t = store.theme();
    if (t === 'paper') return 'bg-slate-400/80';
    if (t === 'jade') return 'bg-emerald-300/60';
    if (t === 'cyber') return 'bg-cyan-400/40';
    if (t === 'slate') return 'bg-slate-400/40';
    return 'bg-amber-950/60';
  };

  const cellBorderColor = () => {
    const t = store.theme();
    if (t === 'paper') return 'border-slate-300 hover:bg-sky-500/10 active:bg-sky-500/20';
    if (t === 'jade') return 'border-emerald-500/25 hover:bg-emerald-500/10 active:bg-emerald-500/20';
    if (t === 'cyber') return 'border-cyan-500/25 hover:bg-cyan-500/10 active:bg-cyan-500/20';
    if (t === 'slate') return 'border-slate-500/25 hover:bg-slate-500/10 active:bg-slate-500/20';
    return 'border-amber-950/30 hover:bg-amber-950/10 active:bg-amber-950/20';
  };

  const starPointBg = () => {
    const t = store.theme();
    if (t === 'paper') return 'bg-slate-900';
    if (t === 'jade') return 'bg-emerald-300 shadow-[0_0_6px_#34d399]';
    if (t === 'cyber') return 'bg-cyan-300 shadow-[0_0_6px_#38bdf8]';
    if (t === 'slate') return 'bg-slate-200';
    return 'bg-amber-950';
  };

  const coordTextColor = () => {
    const t = store.theme();
    if (t === 'paper') return 'text-slate-800 font-extrabold';
    if (t === 'jade') return 'text-emerald-300/80 font-bold';
    if (t === 'cyber') return 'text-cyan-400/70';
    if (t === 'slate') return 'text-slate-400';
    return 'text-amber-950/70 font-bold';
  };

  return (
    <div class="w-full flex flex-col items-center justify-center select-none touch-manipulation">
      {/* Khung viền Bàn cờ chính */}
      <div
        class={`w-full max-w-[min(96vw,560px)] md:max-w-[600px] aspect-square p-1.5 sm:p-3.5 md:p-5 rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-300 flex flex-col shadow-2xl relative ${themeClass()}`}
      >
        {/* Tọa độ cột trên (A - O) */}
        <div class={`w-full flex justify-between px-0.5 sm:px-1 mb-0.5 sm:mb-1 text-[8px] sm:text-[10px] md:text-xs font-mono select-none ${coordTextColor()}`}>
          <For each={COL_LETTERS}>
            {letter => <span class="w-[6.66%] text-center">{letter}</span>}
          </For>
        </div>

        {/* Thân bàn cờ ở giữa: Tọa độ trái + Lưới 15x15 + Tọa độ phải */}
        <div class="flex-1 w-full flex items-center justify-between relative">
          {/* Tọa độ hàng trái (15 - 1) */}
          <div class={`h-full flex flex-col justify-between py-0.5 sm:py-1 mr-0.5 sm:mr-1 text-[8px] sm:text-[10px] md:text-xs font-mono select-none ${coordTextColor()}`}>
            <For each={ROW_NUMBERS}>
              {num => <span class="h-[6.66%] flex items-center justify-center">{num}</span>}
            </For>
          </div>

          {/* Lưới 15x15 pixel-perfect */}
          <div
            class={`flex-1 h-full aspect-square relative ${
              store.boardStyle() === 'cells' ? 'border border-amber-950/40 rounded-md sm:rounded-lg overflow-hidden' : ''
            }`}
            style={{
              display: 'grid',
              'grid-template-columns': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              'grid-template-rows': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              'touch-action': 'manipulation',
            }}
          >
            <For each={store.board()}>
              {(row, r) => (
                <For each={row}>
                  {(cell, c) => {
                    const rIdx = r();
                    const cIdx = c();
                    const isHovered = () =>
                      hoverPos()?.row === rIdx && hoverPos()?.col === cIdx && cell === EMPTY && canPlay();
                    const winCell = () => isWinningCell(rIdx, cIdx);
                    const last = () => isLastMove(rIdx, cIdx);
                    const stepNum = () => getStepNumber(rIdx, cIdx);
                    const isIntersections = () => store.boardStyle() === 'intersections';

                    return (
                      <div
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        onMouseEnter={() => setHoverPos({ row: rIdx, col: cIdx })}
                        onMouseLeave={() => setHoverPos(null)}
                        class={`relative w-full h-full transition-all touch-manipulation ${
                          canPlay() && cell === EMPTY
                            ? 'cursor-pointer hover:scale-[1.02] active:scale-95'
                            : 'cursor-default'
                        } ${
                          !isIntersections() ? `border ${cellBorderColor()}` : ''
                        }`}
                      >
                        {/* 1. Phong cách A: Đường kẻ giao điểm (Intersections) */}
                        <Show when={isIntersections()}>
                          {/* Đường ngang */}
                          <div
                            class={`absolute top-1/2 -translate-y-1/2 h-[1px] pointer-events-none ${lineBg()} ${
                              cIdx === 0
                                ? 'left-1/2 right-0'
                                : cIdx === BOARD_SIZE - 1
                                ? 'left-0 right-1/2'
                                : 'left-0 right-0'
                            }`}
                          />

                          {/* Đường dọc */}
                          <div
                            class={`absolute left-1/2 -translate-x-1/2 w-[1px] pointer-events-none ${lineBg()} ${
                              rIdx === 0
                                ? 'top-1/2 bottom-0'
                                : rIdx === BOARD_SIZE - 1
                                ? 'top-0 bottom-1/2'
                                : 'top-0 bottom-0'
                            }`}
                          />
                        </Show>

                        {/* 2. Điểm sao (Star Points) - Dùng absolute luôn cố định ở tâm */}
                        <Show when={isStarPoint(rIdx, cIdx) && cell === EMPTY}>
                          <div
                            class={`absolute w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 ${
                              isIntersections() ? starPointBg() : `opacity-40 ${starPointBg()}`
                            }`}
                          />
                        </Show>

                        {/* 3. Quân cờ thực tế đã đánh - Căn tâm tuyệt đối */}
                        <Show when={cell !== EMPTY}>
                          <div
                            class={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full transition-all duration-200 flex items-center justify-center z-10 ${
                              cell === BLACK ? 'stone-black text-slate-200' : 'stone-white text-slate-800'
                            } ${winCell() ? 'animate-win-glow scale-110' : ''}`}
                          >
                            {/* Hiển thị số thứ tự nước đi nếu bật */}
                            <Show when={store.showStepNumbers() && stepNum() !== null}>
                              <span class="text-[8px] sm:text-[10px] md:text-xs font-bold font-mono select-none">
                                {stepNum()}
                              </span>
                            </Show>

                            {/* Đánh dấu nước đi cuối (Last move dot) */}
                            <Show when={last() && !winCell() && !store.showStepNumbers()}>
                              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shadow-sm animate-pulse" />
                            </Show>

                            {/* Vòng phát sáng cho 5 quân chiến thắng */}
                            <Show when={winCell()}>
                              <div class="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                            </Show>
                          </div>
                        </Show>

                        {/* 4. Ghost Stone khi Hover - Căn tâm tuyệt đối đè lên điểm sao */}
                        <Show when={isHovered()}>
                          <div
                            class={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full opacity-40 transition-opacity pointer-events-none z-10 ${
                              store.playerColor() === BLACK ? 'stone-black' : 'stone-white'
                            }`}
                          />
                        </Show>
                      </div>
                    );
                  }}
                </For>
              )}
            </For>
          </div>

          {/* Tọa độ hàng phải (15 - 1) */}
          <div class={`h-full flex flex-col justify-between py-0.5 sm:py-1 ml-0.5 sm:ml-1 text-[8px] sm:text-[10px] md:text-xs font-mono select-none ${coordTextColor()}`}>
            <For each={ROW_NUMBERS}>
              {num => <span class="h-[6.66%] flex items-center justify-center">{num}</span>}
            </For>
          </div>
        </div>

        {/* Tọa độ cột dưới (A - O) */}
        <div class={`w-full flex justify-between px-0.5 sm:px-1 mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] md:text-xs font-mono select-none ${coordTextColor()}`}>
          <For each={COL_LETTERS}>
            {letter => <span class="w-[6.66%] text-center">{letter}</span>}
          </For>
        </div>
      </div>
    </div>
  );
};
