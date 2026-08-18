import { createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import confetti from 'canvas-confetti';
import {
  BoardMatrix,
  ActivePlayer,
  BLACK,
  WHITE,
  EMPTY,
  GameStatus,
  WinInfo,
  Move,
  AIStats,
  LevelConfig,
  UserStats,
  ThemeType,
  BoardStyle,
  MoveHistoryItem,
  WorkerMessageIn,
  WorkerMessageOut,
} from '../game/types';
import { createEmptyBoard, cloneBoard, checkWin, isBoardFull } from '../game/board';
import { getLevelConfigByWins, SCORES } from '../game/constants';
import { soundService } from '../services/soundService';
import { StorageService } from '../services/storageService';
import { TauntService, TauntEvent, BotMood } from '../services/tauntService';

export function createGameStore() {
  // Trạng thái bàn cờ
  const [board, setBoard] = createSignal<BoardMatrix>(createEmptyBoard());
  const [currentTurn, setCurrentTurn] = createSignal<ActivePlayer>(BLACK);
  const [playerColor, setPlayerColor] = createSignal<ActivePlayer>(BLACK);
  const [gameStatus, setGameStatus] = createSignal<GameStatus>('idle');
  const [winInfo, setWinInfo] = createSignal<WinInfo | null>(null);
  const [moveHistory, setMoveHistory] = createSignal<MoveHistoryItem[]>([]);
  const [lastMove, setLastMove] = createSignal<{ row: number; col: number } | null>(null);

  // Trạng thái AI
  const [isAiThinking, setIsAiThinking] = createSignal<boolean>(false);
  const [aiStats, setAiStats] = createSignal<AIStats | null>(null);
  const [aiThinkingProgress, setAiThinkingProgress] = createSignal<{ depth: number; nodes: number }>({
    depth: 0,
    nodes: 0,
  });

  // Trạng thái người dùng và cài đặt
  const [stats, setStats] = createSignal<UserStats>(StorageService.getStats());
  const [theme, setThemeState] = createSignal<ThemeType>(StorageService.getTheme());
  const [boardStyle, setBoardStyleState] = createSignal<BoardStyle>(StorageService.getBoardStyle());
  const [showStepNumbers, setShowStepNumbersState] = createSignal<boolean>(StorageService.getShowStepNumbers());
  const [isMuted, setIsMutedState] = createSignal<boolean>(soundService.getMuted());
  const [enableTaunts, setEnableTauntsState] = createSignal<boolean>(StorageService.getEnableTaunts());

  // Trạng thái bong bóng thoại cà khịa của Bot
  const [tauntState, setTauntState] = createSignal<{
    text: string;
    mood: BotMood;
    visible: boolean;
    id: number;
  }>({
    text: 'Sẵn sàng bị tôi hành tiếp chưa?',
    mood: 'smug',
    visible: false,
    id: 0,
  });

  let tauntDismissTimer: number | null = null;
  let idleThinkingTimer: number | null = null;
  let lastActionTauntTime: number = 0;
  const IDLE_EVENTS: TauntEvent[] = ['IDLE_IN_GAME', 'IDLE_THINKING', 'IDLE_PRE_GAME', 'IDLE_AFTER_LOSS'];

  // Modals
  const [showStatsModal, setShowStatsModal] = createSignal<boolean>(false);
  const [showBotModal, setShowBotModal] = createSignal<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = createSignal<boolean>(false);
  const [showRulesModal, setShowRulesModal] = createSignal<boolean>(false);
  const [showLevelUpAlert, setShowLevelUpAlert] = createSignal<LevelConfig | null>(null);

  // Tính toán AI Color
  const aiColor = createMemo<ActivePlayer>(() => (playerColor() === BLACK ? WHITE : BLACK));

  // Cấu hình cấp độ AI hiện tại (tính từ số trận thắng hoặc manual)
  const currentLevelConfig = createMemo<LevelConfig>(() => {
    const currentStats = stats();
    return getLevelConfigByWins(currentStats.wins, currentStats.manualLevel);
  });

  let worker: Worker | null = null;

  // Khởi tạo Web Worker
  onMount(() => {
    try {
      worker = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (e: MessageEvent<WorkerMessageOut>) => {
        const data = e.data;

        if (data.type === 'PROGRESS') {
          setAiThinkingProgress({ depth: data.depth, nodes: data.nodes });
          if (data.score !== undefined && aiStats()) {
            setAiStats(prev => (prev ? { ...prev, bestScore: data.score || 0 } : null));
          }
          return;
        }

        if (data.type === 'MOVE_RESULT') {
          setIsAiThinking(false);
          setAiStats(data.stats);
          executeAiMove(data.move);
          return;
        }
      };
    } catch (err) {
      console.error('Không thể khởi tạo Web Worker:', err);
    }
    resetIdleTimer();
  });

  onCleanup(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    clearIdleTimer();
    if (tauntDismissTimer) clearTimeout(tauntDismissTimer);
  });

  /**
   * Kích hoạt một câu cà khịa từ đối thủ với cơ chế chống ghi đè ưu tiên
   */
  function triggerTaunt(event: TauntEvent, delayMs: number = 0) {
    if (!enableTaunts()) return;

    if (delayMs > 0) {
      setTimeout(() => triggerTaunt(event, 0), delayMs);
      return;
    }

    const now = Date.now();
    const isIdle = IDLE_EVENTS.includes(event);

    // Nếu là sự kiện IDLE mà vừa có một Action Taunt trong vòng 7.5s -> Không ghi đè lên Action Taunt
    if (isIdle && now - lastActionTauntTime < 7500) {
      return;
    }

    // Nếu là Action Taunt (tương tác trực tiếp, gài bẫy, đổi theme, xin đi lại, v.v.)
    if (!isIdle) {
      lastActionTauntTime = now;
      // Tự động hủy và dời lịch hẹn Idle Taunt sang 15s - 25s sau
      resetIdleTimer();
    }

    if (tauntDismissTimer) {
      clearTimeout(tauntDismissTimer);
      tauntDismissTimer = null;
    }

    const item = TauntService.getTaunt(event);
    setTauntState({
      text: item.text,
      mood: item.mood,
      visible: true,
      id: Date.now(),
    });

    soundService.playPopSound();

    tauntDismissTimer = window.setTimeout(() => {
      setTauntState(prev => ({ ...prev, visible: false }));
    }, 7500);
  }

  function clearIdleTimer() {
    if (idleThinkingTimer) {
      clearTimeout(idleThinkingTimer);
      idleThinkingTimer = null;
    }
  }

  function resetIdleTimer() {
    clearIdleTimer();
    if (!enableTaunts()) return;

    // Vòng lặp liên tục khi người chơi AFK: ngẫu nhiên từ 15 đến 25 giây một câu
    const getRandomInterval = () => 15000 + Math.floor(Math.random() * 10000); // 15s - 25s

    const scheduleNextIdleTaunt = (delay: number) => {
      idleThinkingTimer = window.setTimeout(() => {
        const now = Date.now();
        // Nếu vừa có Action Taunt cách đây ít hơn 7.5 giây thì hoãn lại lượt Idle này
        if (now - lastActionTauntTime < 7500) {
          const remainingTime = 7500 - (now - lastActionTauntTime) + getRandomInterval();
          scheduleNextIdleTaunt(remainingTime);
          return;
        }

        const status = gameStatus();

        // 1. ĐANG TRONG TRẬN ĐẤU (status === 'playing')
        if (status === 'playing') {
          // Khi đến lượt người chơi mà đang ngâm cờ / AFK suy nghĩ
          if (currentTurn() === playerColor() && !isAiThinking()) {
            const inGameEvents: TauntEvent[] = ['IDLE_IN_GAME', 'IDLE_THINKING'];
            const chosenEvent = inGameEvents[Math.floor(Math.random() * inGameEvents.length)];
            triggerTaunt(chosenEvent);
            scheduleNextIdleTaunt(getRandomInterval());
          }
        } 
        // 2. NGOÀI TRẬN ĐẤU (status !== 'playing': 'idle', 'black_win', 'white_win', 'draw')
        else {
          const playerLost =
            (status === 'black_win' && playerColor() === WHITE) ||
            (status === 'white_win' && playerColor() === BLACK);

          if (playerLost) {
            // AFK sau khi bị THUA mà không chịu bấm Ván Mới
            triggerTaunt('IDLE_AFTER_LOSS');
          } else {
            // AFK khi ở sảnh / trạng thái chờ 'idle' / sau khi thắng hoặc hòa
            triggerTaunt('IDLE_PRE_GAME');
          }
          scheduleNextIdleTaunt(getRandomInterval());
        }
      }, delay);
    };

    scheduleNextIdleTaunt(getRandomInterval());
  }

  /**
   * Chọn bên đi trước / đi sau (chờ người chơi bấm Ván Mới để bắt đầu)
   */
  function setPlayerSide(playAsBlack: boolean) {
    const chosenPlayer: ActivePlayer = playAsBlack ? BLACK : WHITE;
    if (playerColor() === chosenPlayer && gameStatus() === 'idle') return;

    setPlayerColor(chosenPlayer);
    setBoard(createEmptyBoard());
    setCurrentTurn(BLACK);
    setGameStatus('idle');
    setWinInfo(null);
    setMoveHistory([]);
    setLastMove(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });

    soundService.playClickSound();

    if (!playAsBlack) {
      triggerTaunt('SWAP_SIDE_BOT_FIRST', 200);
    } else {
      triggerTaunt('SWAP_SIDE_PLAYER_FIRST', 200);
    }
  }

  /**
   * Bắt đầu một ván cờ mới ngay lập tức khi người chơi bấm nút Ván Mới
   */
  function startNewGame(playAsBlack: boolean = playerColor() === BLACK) {
    const chosenPlayer: ActivePlayer = playAsBlack ? BLACK : WHITE;
    setPlayerColor(chosenPlayer);
    const emptyBoard = createEmptyBoard();
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    soundService.playClickSound();

    if (!playAsBlack) {
      // Bot cầm quân Đen đi trước -> Hạ cờ ngay tại trung tâm Thiên Nguyên (7, 7) tức thì
      const botRow = 7;
      const botCol = 7;
      emptyBoard[botRow][botCol] = BLACK;
      setBoard(emptyBoard);
      setLastMove({ row: botRow, col: botCol });
      setMoveHistory([
        {
          row: botRow,
          col: botCol,
          player: BLACK,
          stepNumber: 1,
          timestamp: Date.now(),
        },
      ]);
      setCurrentTurn(WHITE);
      setGameStatus('playing');
      soundService.playStoneSound();
      triggerTaunt('GAME_START', 200);
      resetIdleTimer();
    } else {
      // Người chơi cầm quân Đen đi trước -> Bắt đầu ngay
      setBoard(emptyBoard);
      setMoveHistory([]);
      setLastMove(null);
      setCurrentTurn(BLACK);
      setGameStatus('playing');
      triggerTaunt('GAME_START', 200);
      resetIdleTimer();
    }
  }

  /**
   * Kích hoạt AI tính toán nước đi
   */
  function triggerAiMove(currentBoard: BoardMatrix, aiPlayer: ActivePlayer) {
    if (!worker || gameStatus() === 'black_win' || gameStatus() === 'white_win' || gameStatus() === 'draw') {
      return;
    }

    clearIdleTimer();
    setIsAiThinking(true);

    const msg: WorkerMessageIn = {
      type: 'CALCULATE_MOVE',
      board: currentBoard,
      aiPlayer,
      levelId: currentLevelConfig().id,
      turnCount: moveHistory().length,
    };

    worker.postMessage(msg);
  }

  /**
   * Thực hiện nước đi của AI nhận từ Worker
   */
  function executeAiMove(move: Move) {
    if (gameStatus() !== 'playing') return;

    const currentBoard = cloneBoard(board());
    const ai = aiColor();

    if (currentBoard[move.row][move.col] !== EMPTY) {
      return;
    }

    // Kiểm tra xem Bot vừa chặn đòn đe dọa (nước 4 hoặc 3 mở) của Người chơi hay không
    const isBlocking = TauntService.isBotBlockThreat(cloneBoard(currentBoard), playerColor(), move.row, move.col);

    currentBoard[move.row][move.col] = ai;
    setBoard(currentBoard);
    setLastMove({ row: move.row, col: move.col });

    const newHistory: MoveHistoryItem[] = [
      ...moveHistory(),
      {
        row: move.row,
        col: move.col,
        player: ai,
        stepNumber: moveHistory().length + 1,
        timestamp: Date.now(),
      },
    ];
    setMoveHistory(newHistory);
    soundService.playStoneSound();

    // Kiểm tra ván cờ kéo dài (LONG_GAME)
    if (newHistory.length === 40) {
      triggerTaunt('LONG_GAME', 300);
    }

    // Kiểm tra kết thúc ván
    const win = checkWin(currentBoard);
    if (win) {
      handleGameOver(win.winner, win);
      return;
    }

    if (isBoardFull(currentBoard)) {
      handleGameOver(EMPTY, null);
      return;
    }

    // Kiểm tra nếu Bot vừa tạo bẫy / sát cục VCF
    const statsObj = aiStats();
    if (statsObj?.vcfFound || (statsObj?.bestScore || 0) >= SCORES.OPEN_FOUR) {
      triggerTaunt('BOT_TRAP', 200);
    } else if (isBlocking && Math.random() < 0.6) {
      triggerTaunt('BOT_BLOCK_THREAT', 250);
    }

    setCurrentTurn(playerColor());
    resetIdleTimer();
  }

  /**
   * Người chơi thực hiện nước đi
   */
  function makePlayerMove(row: number, col: number) {
    if (gameStatus() === 'idle' && currentTurn() === playerColor()) {
      setGameStatus('playing');
    } else if (gameStatus() !== 'playing' || isAiThinking()) {
      return;
    }
    if (currentTurn() !== playerColor()) return;

    clearIdleTimer();
    const currentBoard = cloneBoard(board());
    if (currentBoard[row][col] !== EMPTY) return;

    const now = Date.now();
    const history = moveHistory();

    // Kiểm tra nếu đánh nước mở màn vào tâm Thiên Nguyên (7,7)
    if (row === 7 && col === 7 && history.length <= 1) {
      triggerTaunt('CENTER_MOVE', 150);
    }

    // Kiểm tra nếu đánh quá nhanh không cần suy nghĩ (< 800ms)
    if (history.length >= 2) {
      const lastPlayerStep = history[history.length - 1];
      if (now - lastPlayerStep.timestamp < 800 && Math.random() < 0.35) {
        triggerTaunt('FAST_MOVE_TAUNT', 150);
      }
    }

    // Kiểm tra nếu đánh vào 4 góc bàn cờ (nước cờ dị)
    if ((row === 0 || row === 14) && (col === 0 || col === 14)) {
      triggerTaunt('CORNER_MOVE', 150);
    }

    const player = playerColor();
    currentBoard[row][col] = player;
    setBoard(currentBoard);
    setLastMove({ row, col });

    const newHistory: MoveHistoryItem[] = [
      ...moveHistory(),
      {
        row,
        col,
        player,
        stepNumber: moveHistory().length + 1,
        timestamp: now,
      },
    ];
    setMoveHistory(newHistory);
    soundService.playStoneSound();

    // Kiểm tra ván cờ kéo dài (LONG_GAME)
    if (newHistory.length === 40) {
      triggerTaunt('LONG_GAME', 300);
    }

    // Kiểm tra thắng thua
    const win = checkWin(currentBoard);
    if (win) {
      handleGameOver(win.winner, win);
      return;
    }

    if (isBoardFull(currentBoard)) {
      handleGameOver(EMPTY, null);
      return;
    }

    // Kiểm tra nếu người chơi vừa đi một nước ngáo / bỏ sót nước chặn
    const isBlunder = TauntService.isPlayerBlunder(currentBoard, aiColor(), row, col);
    if (isBlunder) {
      triggerTaunt('BLUNDER_MOVE', 150);
    }

    // Chuyển lượt sang AI
    setCurrentTurn(aiColor());
    triggerAiMove(currentBoard, aiColor());
  }

  /**
   * Xử lý khi ván cờ kết thúc
   */
  function handleGameOver(winner: typeof EMPTY | ActivePlayer, winResult: WinInfo | null) {
    clearIdleTimer();

    if (winner === BLACK) {
      setGameStatus('black_win');
    } else if (winner === WHITE) {
      setGameStatus('white_win');
    } else {
      setGameStatus('draw');
    }

    if (winResult) {
      setWinInfo(winResult);
    }

    const player = playerColor();
    const oldLevel = currentLevelConfig().id;
    const prevStats = stats();

    if (winner === player) {
      // Người chơi thắng!
      soundService.playWinSound();
      triggerConfetti();
      const newStats = StorageService.recordGame('win');
      setStats(newStats);

      // Nếu trước đó đang thua nhiều ván liên tiếp mà giờ thắng được 1 ván
      if (prevStats.losses >= 3 && prevStats.currentStreak === 0) {
        triggerTaunt('BREAK_LOSS_STREAK', 500);
      } else {
        triggerTaunt('PLAYER_GOOD_MOVE', 500);
      }

      // Kiểm tra thăng cấp AI
      const newLevel = getLevelConfigByWins(newStats.wins, newStats.manualLevel);
      if (newLevel.id > oldLevel && newStats.manualLevel === null) {
        setTimeout(() => {
          soundService.playLevelUpSound();
          setShowLevelUpAlert(newLevel);
          triggerTaunt('LEVEL_UP_ALERT', 400);
        }, 800);
      }
    } else if (winner === aiColor()) {
      // Người chơi thua -> Bot cà khịa
      soundService.playLossSound();
      const newStats = StorageService.recordGame('loss');
      setStats(newStats);

      // Nếu đang trong chuỗi thua dài
      if (newStats.losses >= 3 && newStats.currentStreak === 0) {
        triggerTaunt('STREAK_LOSS', 400);
      } else {
        triggerTaunt('BOT_WIN', 400);
      }
    } else {
      // Hòa
      const newStats = StorageService.recordGame('draw');
      setStats(newStats);
      triggerTaunt('GAME_DRAW', 400);
    }

    // Sau khi hết trận, nếu người chơi không bấm ván mới thì bắt đầu kích hoạt IDLE_PRE_GAME / IDLE_AFTER_LOSS
    resetIdleTimer();
  }

  /**
   * Người chơi chủ động nhận thua ván đấu đang diễn ra
   */
  function resignGame() {
    if (gameStatus() !== 'playing') return;
    clearIdleTimer();

    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }
    triggerTaunt('PLAYER_RESIGN', 200);
    handleGameOver(aiColor(), null);
  }

  /**
   * Hiệu ứng pháo hoa rực rỡ khi người chơi chiến thắng
   */
  function triggerConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'],
      });
    } catch {
      // Bỏ qua nếu confetti không khả dụng
    }
  }

  /**
   * Đi lại nước cờ (Undo)
   */
  function undoMove() {
    if (gameStatus() !== 'playing' && gameStatus() !== 'black_win' && gameStatus() !== 'white_win') {
      return;
    }
    if (isAiThinking()) return;

    clearIdleTimer();
    const history = moveHistory();
    if (history.length === 0) return;

    const currentBoard = createEmptyBoard();
    let stepsToUndo = 1;

    if (gameStatus() === 'playing') {
      if (currentTurn() === playerColor() && history.length >= 2) {
        stepsToUndo = 2;
      } else {
        stepsToUndo = 1;
      }
    } else if (gameStatus() === 'black_win' || gameStatus() === 'white_win') {
      const lastPlayer = history[history.length - 1].player;
      if (lastPlayer === aiColor() && history.length >= 2) {
        stepsToUndo = 2;
      } else {
        stepsToUndo = 1;
      }
    }

    const remainingHistory = history.slice(0, history.length - stepsToUndo);

    // Tái dựng lại bàn cờ từ lịch sử còn lại
    remainingHistory.forEach(item => {
      currentBoard[item.row][item.col] = item.player;
    });

    setBoard(currentBoard);
    setMoveHistory(remainingHistory);
    setLastMove(
      remainingHistory.length > 0
        ? {
            row: remainingHistory[remainingHistory.length - 1].row,
            col: remainingHistory[remainingHistory.length - 1].col,
          }
        : null
    );
    setWinInfo(null);
    setGameStatus('playing');
    setCurrentTurn(playerColor());

    soundService.playClickSound();
    triggerTaunt('PLAYER_UNDO', 300);
    resetIdleTimer();
  }

  /**
   * Cài đặt cấp độ thủ công hoặc tự động theo số trận thắng
   */
  function setManualLevel(levelId: number | null) {
    const currentLvl = currentLevelConfig().id;
    if (levelId !== null) {
      if (levelId < currentLvl) {
        triggerTaunt('CHANGE_BOT_LEVEL_DOWN', 200);
      } else if (levelId > currentLvl) {
        triggerTaunt('CHANGE_BOT_LEVEL_UP', 200);
      }
    }

    const newStats = StorageService.setManualLevel(levelId);
    setStats(newStats);
    soundService.playClickSound();
  }

  /**
   * Reset toàn bộ thống kê
   */
  function resetAllStats() {
    const cleanStats = StorageService.resetStats();
    setStats(cleanStats);
    soundService.playClickSound();
    triggerTaunt('RESET_STATS', 200);
  }

  /**
   * Đổi theme bàn cờ
   */
  function setTheme(t: ThemeType) {
    setThemeState(t);
    StorageService.setTheme(t);
    soundService.playClickSound();
    triggerTaunt('THEME_CHANGE', 200);
  }

  /**
   * Đổi phong cách đặt quân (giao điểm đường kẻ vs giữa ô vuông)
   */
  function setBoardStyle(s: BoardStyle) {
    setBoardStyleState(s);
    StorageService.setBoardStyle(s);
    soundService.playClickSound();
    triggerTaunt('BOARD_STYLE_CHANGE', 200);
  }

  /**
   * Bật/tắt hiển thị số thứ tự nước đi
   */
  function toggleStepNumbers() {
    const next = !showStepNumbers();
    setShowStepNumbersState(next);
    StorageService.setShowStepNumbers(next);
    soundService.playClickSound();
    triggerTaunt('TOGGLE_STEP_NUMBERS', 200);
  }

  /**
   * Bật/tắt âm thanh
   */
  function toggleSound() {
    const next = soundService.toggleMute();
    setIsMutedState(next);
  }

  /**
   * Bật/tắt lời thoại cà khịa của Bot
   */
  function toggleEnableTaunts() {
    const next = !enableTaunts();
    setEnableTauntsState(next);
    StorageService.setEnableTaunts(next);
    soundService.playClickSound();
  }

  return {
    // Signals & Memos
    board,
    currentTurn,
    playerColor,
    aiColor,
    gameStatus,
    winInfo,
    moveHistory,
    lastMove,
    isAiThinking,
    aiStats,
    aiThinkingProgress,
    stats,
    currentLevelConfig,
    theme,
    boardStyle,
    showStepNumbers,
    isMuted,
    enableTaunts,
    tauntState,
    showStatsModal,
    showBotModal,
    showSettingsModal,
    showRulesModal,
    showLevelUpAlert,

    // Setters
    setShowStatsModal,
    setShowBotModal,
    setShowSettingsModal,
    setShowRulesModal,
    setShowLevelUpAlert,

    // Actions
    startNewGame,
    setPlayerSide,
    resignGame,
    makePlayerMove,
    undoMove,
    setManualLevel,
    resetAllStats,
    setTheme,
    setBoardStyle,
    toggleStepNumbers,
    toggleSound,
    toggleEnableTaunts,
    triggerTaunt,
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
