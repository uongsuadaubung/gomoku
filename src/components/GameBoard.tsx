import { type Component, For, Show, createSignal, createMemo, onCleanup } from 'solid-js';
import type { GameStore } from '../store/gameStore';
import { useGame } from '../store/GameContext';
import { BOARD_SIZE, EMPTY, BLACK, WHITE, type Player } from '../game/types';
import { STAR_POINTS, COL_LETTERS, ROW_NUMBERS } from '../game/constants';
import { interactionTracker } from '../services/interactionTracker';
import { StonePiece } from './StonePiece';

interface ThemeConfig {
  board: string;
  line: string;
  cellBorder: string;
  starPoint: string;
  coordText: string;
}

const THEME_CONFIG: Record<string, ThemeConfig> = {
  paper: {
    board: 'board-paper border-stone-400/90 shadow-stone-900/40',
    line: 'bg-slate-400/80',
    cellBorder: 'border-slate-300 hover:bg-sky-500/10 active:bg-sky-500/20',
    starPoint: 'bg-slate-900',
    coordText: 'text-slate-800 font-extrabold',
  },
  jade: {
    board: 'board-jade border-emerald-600/70 shadow-emerald-950/60',
    line: 'bg-emerald-300/60',
    cellBorder: 'border-emerald-500/25 hover:bg-emerald-500/10 active:bg-emerald-500/20',
    starPoint: 'bg-emerald-300 shadow-[0_0_6px_#34d399]',
    coordText: 'text-emerald-300/80 font-bold',
  },
  cyber: {
    board: 'board-cyber border-cyan-500/60 shadow-cyan-950/80',
    line: 'bg-cyan-400/40',
    cellBorder: 'border-cyan-500/25 hover:bg-cyan-500/10 active:bg-cyan-500/20',
    starPoint: 'bg-cyan-300 shadow-[0_0_6px_#38bdf8]',
    coordText: 'text-cyan-400/70',
  },
  slate: {
    board: 'board-slate border-slate-700/80 shadow-slate-950/70',
    line: 'bg-slate-400/40',
    cellBorder: 'border-slate-500/25 hover:bg-slate-500/10 active:bg-slate-500/20',
    starPoint: 'bg-slate-200',
    coordText: 'text-slate-400',
  },
  wood: {
    board: 'board-wood border-amber-950/60 shadow-amber-950/70',
    line: 'bg-amber-950/60',
    cellBorder: 'border-amber-950/30 hover:bg-amber-950/10 active:bg-amber-950/20',
    starPoint: 'bg-amber-950',
    coordText: 'text-amber-950/70 font-bold',
  },
};

export const GameBoard: Component = () => {
  const store = useGame();
  const [hoverPos, setHoverPos] = createSignal<{ row: number; col: number } | null>(null);

  const isStarPoint = (r: number, c: number) => {
    return STAR_POINTS.some(([sr, sc]) => sr === r && sc === c);
  };

  // O(1) Pre-computed Lookups
  const winningCellsSet = createMemo(() => {
    const win = store.winInfo();
    if (!win) return new Set<string>();
    return new Set(win.line.map(([wr, wc]) => `${wr},${wc}`));
  });

  const stepNumberMap = createMemo(() => {
    const map = new Map<string, number>();
    for (const m of store.moveHistory()) {
      map.set(`${m.row},${m.col}`, m.stepNumber);
    }
    return map;
  });

  const isWinningCell = (r: number, c: number) => {
    return winningCellsSet().has(`${r},${c}`);
  };

  const isLastMove = (r: number, c: number) => {
    const lm = store.lastMove();
    return lm ? lm.row === r && lm.col === c : false;
  };

  const getStepNumber = (r: number, c: number) => {
    return stepNumberMap().get(`${r},${c}`) ?? null;
  };

  const canPlay = () => {
    return (
      store.matchStage() === 'playing' &&
      !store.isAiThinking() &&
      store.currentTurn() === store.playerColor()
    );
  };

  let longHoverTimer: number | null = null;
  let recentHoveredCells: { pos: string; time: number }[] = [];
  let lastHesitationTauntTime = 0;
  let lastLongHoverTauntTime = 0;

  const clearHoverTimer = () => {
    if (longHoverTimer) {
      clearTimeout(longHoverTimer);
      longHoverTimer = null;
    }
  };

  const handleCellMouseEnter = (rIdx: number, cIdx: number, cell: number) => {
    setHoverPos({ row: rIdx, col: cIdx });
    clearHoverTimer();

    if (canPlay() && cell === EMPTY) {
      const now = Date.now();
      const posKey = `${rIdx},${cIdx}`;

      // 1. Cà khịa ngập ngừng (HESITATION_DANCE) - Yêu cầu rà chuột qua 12 ô khác nhau trong 3.5s kèm cooldown 45s
      if (now - lastHesitationTauntTime > 45000) {
        recentHoveredCells = recentHoveredCells.filter(item => now - item.time < 3500);
        if (!recentHoveredCells.some(item => item.pos === posKey)) {
          recentHoveredCells.push({ pos: posKey, time: now });
        }

        if (recentHoveredCells.length >= 12) {
          store.triggerTaunt('HESITATION_DANCE', 100);
          recentHoveredCells = [];
          lastHesitationTauntTime = now;
        }
      }

      // 2. Cà khịa ngâm chuột tại 1 ô quá lâu (LONG_HOVER_CELL) - 6 giây đứng yên kèm cooldown 45s
      if (now - lastLongHoverTauntTime > 45000) {
        longHoverTimer = window.setTimeout(() => {
          if (hoverPos()?.row === rIdx && hoverPos()?.col === cIdx && canPlay()) {
            store.triggerTaunt('LONG_HOVER_CELL', 100);
            lastLongHoverTauntTime = Date.now();
          }
        }, 6000);
      }
    }
  };

  const handleCellMouseLeave = () => {
    setHoverPos(null);
    clearHoverTimer();
  };

  onCleanup(() => {
    clearHoverTimer();
    recentHoveredCells = [];
  });

  const handleCellClick = (r: number, c: number) => {
    clearHoverTimer();
    // Khi game đã kết thúc, kiểm tra người chơi Thắng hay Thua để phát đúng thoại
    if (store.matchStage() === 'game_over') {
      const status = store.gameStatus();
      const player = store.playerColor();
      const isWin = (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
      store.triggerTaunt(isWin ? 'CLICK_AFTER_WIN' : 'CLICK_AFTER_GAME_OVER', 0);
      return;
    }

    if (!canPlay()) {
      if (store.matchStage() === 'ready') {
        store.triggerTaunt('CLICK_BEFORE_START', 50);
      }
      return;
    }
    if (store.board()[r][c] !== EMPTY) {
      if (store.board()[r][c] === store.playerColor()) {
        store.triggerTaunt('CLICK_OWN_STONE', 100);
      } else {
        store.triggerTaunt('CLICK_OCCUPIED_CELL', 100);
      }
      return;
    }

    // Kiểm tra thao tác click loạn xạ vào nhiều ô khác nhau trong lúc bối rối (QUICK_MULTI_CELL_CLICKS)
    if (interactionTracker.recordCellClick(r, c) >= 3) {
      store.triggerTaunt('QUICK_MULTI_CELL_CLICKS', 100);
    }

    store.makePlayerMove(r, c);
  };

  const currentThemeConfig = () => THEME_CONFIG[store.theme()] || THEME_CONFIG.wood;
  const themeClass = () => currentThemeConfig().board;
  const lineBg = () => currentThemeConfig().line;
  const cellBorderColor = () => currentThemeConfig().cellBorder;
  const starPointBg = () => currentThemeConfig().starPoint;
  const coordTextColor = () => currentThemeConfig().coordText;

  return (
    <div class="w-full flex flex-col items-center justify-center select-none touch-manipulation">
      {/* Khung viền Bàn cờ chính */}
      <div
        onContextMenu={e => {
          e.preventDefault();
          store.triggerTaunt('RIGHT_CLICK_INSPECT', 100);
        }}
        onWheel={() => {
          if (store.gameStatus() === 'playing') {
            store.triggerTaunt('WHEEL_ZOOM_ATTEMPT', 100);
          }
        }}
        class={`w-full max-w-[min(96vw,560px)] md:max-w-[600px] aspect-square p-2 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl border-2 sm:border-4 transition-all duration-300 shadow-2xl relative flex items-center justify-center ${themeClass()}`}
      >
        {/* Hệ thống 3x3 Grid khóa tọa độ tuyệt đối với lưới 15x15 */}
        <div
          class="w-full h-full"
          style={{
            display: 'grid',
            'grid-template-columns': 'auto 1fr auto',
            'grid-template-rows': 'auto 1fr auto',
            gap: '2px',
          }}
        >
          {/* (0,0) Góc trái trên */}
          <div class="w-3.5 sm:w-4.5 md:w-5" />

          {/* (0,1) Tọa độ cột trên (A - O) - Khóa cứng theo chiều rộng 1fr của bàn cờ */}
          <div
            class={`w-full text-[8px] sm:text-[10px] md:text-xs font-mono font-bold select-none ${coordTextColor()}`}
            style={{
              display: 'grid',
              'grid-template-columns': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            <For each={COL_LETTERS}>
              {letter => <span class="flex items-center justify-center text-center leading-none py-0.5">{letter}</span>}
            </For>
          </div>

          {/* (0,2) Góc phải trên */}
          <div class="w-3.5 sm:w-4.5 md:w-5" />

          {/* (1,0) Tọa độ hàng trái (15 - 1) - Khóa cứng theo chiều cao 1fr của bàn cờ */}
          <div
            class={`w-3.5 sm:w-4.5 md:w-5 h-full text-[8px] sm:text-[10px] md:text-xs font-mono font-bold select-none ${coordTextColor()}`}
            style={{
              display: 'grid',
              'grid-template-rows': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            <For each={ROW_NUMBERS}>
              {num => <span class="flex items-center justify-center leading-none">{num}</span>}
            </For>
          </div>

          {/* (1,1) Lưới bàn cờ 15x15 pixel-perfect */}
          <div
            class={`w-full h-full relative ${
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
                        onDblClick={() => store.triggerTaunt('DOUBLE_CLICK_STONE', 50)}
                        onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx, cell)}
                        onMouseLeave={handleCellMouseLeave}
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

                        {/* 3. Quân cờ thực tế đã đánh */}
                        <Show when={cell !== EMPTY}>
                          <StonePiece
                            color={cell}
                            isWinning={winCell()}
                            isLastMove={last()}
                            stepNumber={stepNum()}
                            showStepNumber={store.showStepNumbers()}
                          />
                        </Show>

                        {/* 4. Ghost Stone khi Hover */}
                        <Show when={isHovered()}>
                          <StonePiece
                            color={store.playerColor()}
                            isGhost={true}
                          />
                        </Show>
                      </div>
                    );
                  }}
                </For>
              )}
            </For>
          </div>

          {/* (1,2) Tọa độ hàng phải (15 - 1) - Khóa cứng theo chiều cao 1fr của bàn cờ */}
          <div
            class={`w-3.5 sm:w-4.5 md:w-5 h-full text-[8px] sm:text-[10px] md:text-xs font-mono font-bold select-none ${coordTextColor()}`}
            style={{
              display: 'grid',
              'grid-template-rows': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            <For each={ROW_NUMBERS}>
              {num => <span class="flex items-center justify-center leading-none">{num}</span>}
            </For>
          </div>

          {/* (2,0) Góc trái dưới */}
          <div class="w-3.5 sm:w-4.5 md:w-5" />

          {/* (2,1) Tọa độ cột dưới (A - O) - Khóa cứng theo chiều rộng 1fr của bàn cờ */}
          <div
            class={`w-full text-[8px] sm:text-[10px] md:text-xs font-mono font-bold select-none ${coordTextColor()}`}
            style={{
              display: 'grid',
              'grid-template-columns': `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            <For each={COL_LETTERS}>
              {letter => <span class="flex items-center justify-center text-center leading-none py-0.5">{letter}</span>}
            </For>
          </div>

          {/* (2,2) Góc phải dưới */}
          <div class="w-3.5 sm:w-4.5 md:w-5" />
        </div>
      </div>
    </div>
  );
};
