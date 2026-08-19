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
  let recentUndoTimestamps: number[] = [];
  let lastActionTauntTime: number = 0;
  let lastGameOverTimestamp: number = 0;
  let lastPlayerMoveTimestamp: number = 0;
  let hasTriggeredStareAtWinLine: boolean = false;
  let recentSoundToggleTimestamps: number[] = [];
  let hadHighAiAdvantage: boolean = false;
  let botEverHadOpenThreat: boolean = false;
  let undoCountInMatch: number = 0;
  let sessionGamesCount: number = 0;
  const IDLE_EVENTS: TauntEvent[] = [
    'IDLE_IN_GAME',
    'IDLE_THINKING',
    'IDLE_PRE_GAME',
    'IDLE_AFTER_LOSS',
    'STARE_AT_WIN_LINE',
  ];

  // Trạng thái chuỗi trận (Match Series Flow)
  const [isSeriesActive, setIsSeriesActive] = createSignal<boolean>(false);
  const [seriesGameNumber, setSeriesGameNumber] = createSignal<number>(0);
  const [lastResigned, setLastResigned] = createSignal<boolean>(false);

  // Bên đi trước ở ván kế tiếp trong chuỗi (tự động đảo bên)
  const nextSeriesPlayerSide = createMemo<boolean>(() => playerColor() !== BLACK);

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

  // ============================================================================
  // ĐỊNH NGHĨA CÁC KHÁI NIỆM & TRẠNG THÁI NGHIỆP VỤ (DOMAIN CONCEPTS)
  // ============================================================================

  /** Người chơi vừa thua ván đấu vừa kết thúc */
  const isPlayerLastGameLost = () => {
    const status = gameStatus();
    const player = playerColor();
    return (
      (player === BLACK && status === 'white_win') ||
      (player === WHITE && status === 'black_win')
    );
  };

  /** Người chơi đang chìm trong chuỗi thua (ít nhất minLosses ván) */
  const isPlayerInLossStreak = (minLosses = 1) => {
    return stats().currentStreak === 0 && stats().losses >= minLosses;
  };

  /** Người chơi đang trong chuỗi thua đậm (>= 3 ván liên tiếp) */
  const isPlayerInHeavyLossStreak = () => isPlayerInLossStreak(3);

  /** Người chơi đang trong chuỗi thắng liên tiếp (>= 2 ván) */
  const isPlayerInWinStreak = (minWins = 2) => stats().currentStreak >= minWins;

  /** Ngữ cảnh cay cú hạ độ khó sau khi thua (Rage Downgrade) */
  const isRageDowngradeContext = () => isPlayerLastGameLost() || isPlayerInLossStreak();

  /** Ngữ cảnh đổi theme cầu may để giải hạn khi thua đậm (Desperate Theme Swap) */
  const isDesperateThemeSwapContext = () => isPlayerInHeavyLossStreak();

  /**
   * Đánh giá kịch bản nước đi chiến thuật của Người chơi để kích hoạt sự kiện tương tác phù hợp
   */
  function evaluatePlayerMoveTaunt(
    prevBoard: BoardMatrix,
    nextBoard: BoardMatrix,
    row: number,
    col: number,
    player: ActivePlayer,
    ai: ActivePlayer,
    history: MoveHistoryItem[]
  ): TauntEvent | null {
    const playerMoves = history.filter(m => m.player === player).map(m => ({ row: m.row, col: m.col }));
    const botMoves = history.filter(m => m.player === ai).map(m => ({ row: m.row, col: m.col }));
    const lastPlayerMove = playerMoves.length >= 2 ? playerMoves[playerMoves.length - 2] : null;

    if (TauntService.hasMissedWinningMove(prevBoard, player, row, col)) {
      return 'MISSED_WINNING_MOVE';
    }
    if (TauntService.isForkAttackDefenseFail(prevBoard, ai, player, row, col)) {
      return 'FORK_ATTACK_DEFENSE_FAIL';
    }
    if (TauntService.isDeadFourBlocked(nextBoard, player, row, col)) {
      return 'DEAD_FOUR_BLOCKED';
    }
    if (TauntService.hasAccidentalSelfBlock(nextBoard, player, row, col)) {
      return 'ACCIDENTAL_SELF_BLOCK';
    }
    if (TauntService.isSplitBoardExpedition(lastPlayerMove, { row, col }, history.length)) {
      return 'SPLIT_BOARD_EXPEDITION';
    }
    if (TauntService.isTriangleFormation(nextBoard, player, row, col)) {
      return 'TRIANGLE_FORMATION';
    }
    if (TauntService.isIsolatedFarMove(prevBoard, row, col)) {
      return 'ISOLATED_FAR_MOVE';
    }
    if (TauntService.isCloseCombatHug(playerMoves, botMoves)) {
      return 'CLOSE_COMBAT_HUG';
    }
    if (TauntService.isPlayerBlunder(nextBoard, ai, row, col)) {
      return 'BLUNDER_MOVE';
    }
    if (TauntService.isPlayerDoubleThreat(nextBoard, player)) {
      return 'DOUBLE_THREE_TRAP';
    }
    if (TauntService.isPlayerThreatMove(nextBoard, player) && Math.random() < 0.45) {
      return 'PLAYER_GOOD_MOVE';
    }
    return null;
  }

  /**
   * Đánh giá kịch bản khi Người chơi giành chiến thắng
   */
  function evaluatePlayerWinTaunt(
    moveCount: number,
    hadComeback: boolean,
    undoCount: number,
    prevStats: UserStats
  ): TauntEvent {
    if (moveCount <= 10) return 'SPEED_WIN_QUICK';
    if (moveCount >= 50) return 'IRON_CURTAIN_WIN';
    if (!botEverHadOpenThreat && moveCount >= 10) return 'CLEAN_SWEEP_DOMINATION';
    if (hadComeback) return 'COMEBACK_WIN';
    if (undoCount === 0 && moveCount >= 14) return 'NO_UNDO_WIN';
    if (prevStats.losses >= 3 && prevStats.currentStreak === 0) return 'BREAK_LOSS_STREAK';
    if (isPlayerInWinStreak(2)) return 'PLAYER_STREAK_WIN';
    return 'PLAYER_WIN';
  }

  /**
   * Đánh giá kịch bản khi Bot giành chiến thắng
   */
  function evaluateBotWinTaunt(moveCount: number): TauntEvent {
    if (moveCount <= 10) return 'SPEED_WIN_QUICK';
    if (isPlayerInHeavyLossStreak()) return 'STREAK_LOSS';
    return 'BOT_WIN';
  }

  let worker: Worker | null = null;
  let removeEventListeners: (() => void) | null = null;

  // Khởi tạo Web Worker & Global Browser Listeners
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
          if ((data.score || 0) >= SCORES.OPEN_FOUR) {
            hadHighAiAdvantage = true;
          }
          return;
        }

        if (data.type === 'MOVE_RESULT') {
          setIsAiThinking(false);
          setAiStats(data.stats);
          if (data.stats.winProbability >= 80 || (data.stats.bestScore || 0) >= SCORES.OPEN_FOUR) {
            hadHighAiAdvantage = true;
          }
          executeAiMove(data.move);
          return;
        }
      };
    } catch (err) {
      console.error('Không thể khởi tạo Web Worker:', err);
    }

    // 1. Bắt tương tác spam gõ phím khi chơi cờ (KEYBOARD_SMASH_SPAM)
    let recentKeyPressTimes: number[] = [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus() !== 'playing') return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const now = Date.now();
      recentKeyPressTimes = recentKeyPressTimes.filter(t => now - t < 2000);
      recentKeyPressTimes.push(now);
      if (recentKeyPressTimes.length >= 6) {
        recentKeyPressTimes = [];
        triggerTaunt('KEYBOARD_SMASH_SPAM', 100);
      }
    };

    // 2. Bắt tương tác co giãn cửa sổ trình duyệt khi đang trong trận (WINDOW_RESIZE_PANIC)
    let resizeDebounceTimer: number | null = null;
    const handleResize = () => {
      if (gameStatus() !== 'playing') return;
      if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = window.setTimeout(() => {
        triggerTaunt('WINDOW_RESIZE_PANIC', 200);
      }, 400);
    };

    // 3. Bắt tương tác bôi đen chọn văn bản xung quanh bàn cờ (DRAG_SELECT_PANIC)
    let selectionDebounceTimer: number | null = null;
    const handleSelectionChange = () => {
      if (gameStatus() !== 'playing') return;
      const sel = window.getSelection()?.toString() || '';
      if (sel.trim().length >= 8) {
        if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
        selectionDebounceTimer = window.setTimeout(() => {
          triggerTaunt('DRAG_SELECT_PANIC', 200);
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    document.addEventListener('selectionchange', handleSelectionChange);

    removeEventListeners = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };

    resetIdleTimer();
  });

  onCleanup(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (removeEventListeners) {
      removeEventListeners();
      removeEventListeners = null;
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
      // Tự động hủy và dời lịch hẹn Idle Taunt sang 25s - 35s sau
      resetIdleTimer();
    }

    if (tauntDismissTimer) {
      clearTimeout(tauntDismissTimer);
      tauntDismissTimer = null;
    }

    const currentStats = stats();
    const item = TauntService.getTaunt(event, {
      undoCount: undoCountInMatch,
      botWins: currentStats.losses,
      playerWins: currentStats.wins,
    });
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

    // Vòng lặp liên tục khi người chơi AFK: ngẫu nhiên từ 25 đến 35 giây một câu
    const getRandomInterval = () => 25000 + Math.floor(Math.random() * 10000); // 25s - 35s

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
            const inGameEvents: TauntEvent[] = ['IDLE_IN_GAME', 'IDLE_THINKING', 'SUPER_SLOW_MOVE'];
            const chosenEvent = inGameEvents[Math.floor(Math.random() * inGameEvents.length)];
            triggerTaunt(chosenEvent);
            scheduleNextIdleTaunt(getRandomInterval());
          }
        } 
        // 2. NGOÀI TRẬN ĐẤU (status !== 'playing': 'idle', 'black_win', 'white_win', 'draw')
        else {
          if (isPlayerLastGameLost()) {
            if (!hasTriggeredStareAtWinLine) {
              hasTriggeredStareAtWinLine = true;
              triggerTaunt('STARE_AT_WIN_LINE');
            } else {
              // AFK sau khi bị THUA mà không chịu bấm Ván Mới
              triggerTaunt('IDLE_AFTER_LOSS');
            }
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
   * Chọn bên đi trước / đi sau khi bắt đầu chuỗi mới
   */
  function setPlayerSide(playAsBlack: boolean) {
    if (gameStatus() === 'playing') return;

    const chosenPlayer: ActivePlayer = playAsBlack ? BLACK : WHITE;
    setPlayerColor(chosenPlayer);
    setIsSeriesActive(false);
    setSeriesGameNumber(0);
    setLastResigned(false);
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
   * Khởi động một ván cờ nội bộ
   */
  function launchBoardGame(playAsBlack: boolean) {
    const chosenPlayer: ActivePlayer = playAsBlack ? BLACK : WHITE;
    setPlayerColor(chosenPlayer);
    const emptyBoard = createEmptyBoard();
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    soundService.playClickSound();
    hadHighAiAdvantage = false;
    botEverHadOpenThreat = false;
    undoCountInMatch = 0;
    hasTriggeredStareAtWinLine = false;

    const currentHour = new Date().getHours();
    const isLateNight = currentHour >= 0 && currentHour < 5;
    const now = Date.now();
    const isImmediateRevenge =
      lastGameOverTimestamp > 0 && now - lastGameOverTimestamp < 600 && isPlayerLastGameLost();

    if (!playAsBlack) {
      // Bot cầm quân Đen đi trước -> Hạ cờ ngay tại trung tâm Thiên Nguyên (7, 7)
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
      if (isImmediateRevenge) {
        triggerTaunt('IMMEDIATE_REVENGE_CLICK', 200);
      } else if (isLateNight && Math.random() < 0.6) {
        triggerTaunt('LATE_NIGHT_PLAY', 350);
      } else {
        triggerTaunt('GAME_START', 200);
      }
      resetIdleTimer();
    } else {
      // Người chơi cầm quân Đen đi trước -> Bắt đầu ngay
      setBoard(emptyBoard);
      setMoveHistory([]);
      setLastMove(null);
      setCurrentTurn(BLACK);
      setGameStatus('playing');
      if (isImmediateRevenge) {
        triggerTaunt('IMMEDIATE_REVENGE_CLICK', 200);
      } else if (isLateNight && Math.random() < 0.6) {
        triggerTaunt('LATE_NIGHT_PLAY', 350);
      } else {
        triggerTaunt('GAME_START', 200);
      }
      resetIdleTimer();
    }
  }

  /**
   * Bắt đầu một chuỗi ván đấu mới từ đầu
   */
  function startNewSeries(playAsBlack: boolean) {
    setIsSeriesActive(true);
    setSeriesGameNumber(1);
    setLastResigned(false);
    launchBoardGame(playAsBlack);
  }

  /**
   * Bắt đầu ván kế tiếp: Tự động đảo lượt đi trước nếu đang trong chuỗi
   */
  function startNextGame() {
    if (isSeriesActive()) {
      // Đang trong chuỗi: Tự động đảo lượt đi trước qua lại
      const nextPlayAsBlack = playerColor() !== BLACK;
      setSeriesGameNumber(prev => prev + 1);
      setLastResigned(false);
      launchBoardGame(nextPlayAsBlack);
    } else {
      // Chưa trong chuỗi hoặc vừa đầu hàng: Bắt đầu chuỗi mới
      startNewSeries(playerColor() === BLACK);
    }
  }

  /**
   * Bắt đầu ván cờ (Tương thích chung với các nút bấm)
   */
  function startNewGame(playAsBlack?: boolean) {
    if (playAsBlack !== undefined && !isSeriesActive()) {
      startNewSeries(playAsBlack);
    } else {
      startNextGame();
    }
  }

  /**
   * Đặt lại chuỗi đấu về trạng thái ban đầu để người chơi tự do chọn lại bên
   */
  function resetSeries() {
    setIsSeriesActive(false);
    setSeriesGameNumber(0);
    setLastResigned(false);
    setGameStatus('idle');
    setBoard(createEmptyBoard());
    setCurrentTurn(BLACK);
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    soundService.playClickSound();
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

    // Kiểm tra ván cờ chạm mốc 100 quân (CLUTCH_100_STONES) hoặc 40 quân (LONG_GAME)
    if (newHistory.length === 100) {
      triggerTaunt('CLUTCH_100_STONES', 300);
    } else if (newHistory.length === 40) {
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

    // Kiểm tra nếu Bot vừa tạo bẫy / sát cục VCF hoặc đe dọa mở
    if (TauntService.isPlayerThreatMove(currentBoard, ai)) {
      botEverHadOpenThreat = true;
    }
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
    if (gameStatus() !== 'playing' || isAiThinking()) {
      return;
    }
    if (currentTurn() !== playerColor()) return;

    clearIdleTimer();
    const currentBoard = cloneBoard(board());
    if (currentBoard[row][col] !== EMPTY) return;

    const now = Date.now();
    lastPlayerMoveTimestamp = now;
    const history = moveHistory();

    // 1. Kiểm tra nếu đánh nước mở màn vào tâm Thiên Nguyên (7,7)
    if (row === 7 && col === 7 && history.length <= 1) {
      triggerTaunt('CENTER_MOVE', 150);
    }
    // 2. Kiểm tra nếu đánh vào 4 góc bàn cờ (nước cờ dị)
    else if ((row === 0 || row === 14) && (col === 0 || col === 14)) {
      triggerTaunt('CORNER_MOVE', 150);
    }
    // 3. Kiểm tra nếu đánh dạt ra mép viền ngoài (hàng 0/14 hoặc cột 0/14 khi ván cờ còn sớm)
    else if ((row === 0 || row === 14 || col === 0 || col === 14) && history.length <= 25) {
      triggerTaunt('EDGE_WALK_MOVE', 150);
    }
    // 4. Kiểm tra nếu đánh đối xứng sao chép nước đi của Bot (COPYCAT_MOVE)
    else if (history.length >= 1) {
      const lastBotMove = history[history.length - 1];
      if (lastBotMove.player === aiColor() && TauntService.isMirrorMove(lastBotMove.row, lastBotMove.col, row, col)) {
        if (Math.random() < 0.6) {
          triggerTaunt('COPYCAT_MOVE', 150);
        }
      }
    }

    // Kiểm tra nếu đánh quá nhanh không cần suy nghĩ (< 450ms -> RUSH_MOVE, < 800ms -> FAST_MOVE_TAUNT)
    if (history.length >= 2) {
      const lastStep = history[history.length - 1];
      const diff = now - lastStep.timestamp;
      if (diff < 450 && Math.random() < 0.6) {
        triggerTaunt('RUSH_MOVE', 150);
      } else if (diff < 800 && Math.random() < 0.35) {
        triggerTaunt('FAST_MOVE_TAUNT', 150);
      }
    }

    const player = playerColor();
    const previousBoard = cloneBoard(currentBoard);

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

    // Kiểm tra ván cờ chạm mốc 100 quân (CLUTCH_100_STONES) hoặc 40 quân (LONG_GAME)
    if (newHistory.length === 100) {
      triggerTaunt('CLUTCH_100_STONES', 300);
    } else if (newHistory.length === 40) {
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

    // Đánh giá và kích hoạt phản hồi lời thoại theo tình huống cờ
    const moveTaunt = evaluatePlayerMoveTaunt(previousBoard, currentBoard, row, col, player, aiColor(), newHistory);
    if (moveTaunt) {
      triggerTaunt(moveTaunt, 150);
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
    sessionGamesCount++;
    lastGameOverTimestamp = Date.now();

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

    if (!lastResigned()) {
      // Kết thúc tự nhiên -> Duy trì chuỗi ván đấu để tự động đảo bên ở ván tiếp theo
      setIsSeriesActive(true);
      if (seriesGameNumber() === 0) {
        setSeriesGameNumber(1);
      }
    }

    const player = playerColor();
    const oldLevel = currentLevelConfig().id;
    const prevStats = stats();
    const moveCount = moveHistory().length;

    // Kích hoạt sự kiện MARATHON_SERIES khi chạm mốc 10 ván trong phiên
    if (sessionGamesCount === 10) {
      setTimeout(() => {
        triggerTaunt('MARATHON_SERIES', 400);
      }, 700);
    }

    if (winner === player) {
      // Người chơi thắng!
      soundService.playWinSound();
      triggerConfetti();
      const newStats = StorageService.recordGame('win');
      setStats(newStats);

      // Đánh giá kịch bản thắng của Người chơi
      const winTaunt = evaluatePlayerWinTaunt(moveCount, hadHighAiAdvantage, undoCountInMatch, prevStats);
      triggerTaunt(winTaunt, 500);

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

      // Đánh giá kịch bản thắng của Bot
      const botWinTaunt = evaluateBotWinTaunt(moveCount);
      triggerTaunt(botWinTaunt, 400);
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
   * Người chơi chủ động nhận thua ván đấu đang diễn ra -> Chấm dứt chuỗi đấu
   */
  function resignGame() {
    if (gameStatus() !== 'playing') return;
    clearIdleTimer();

    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }

    // Chấm dứt chuỗi ván đấu hiện tại khi người chơi đầu hàng
    setIsSeriesActive(false);
    setLastResigned(true);

    const hasThreat = TauntService.hasBotActiveThreat(board(), aiColor());
    if (hasThreat) {
      triggerTaunt('SURRENDER_ON_THREAT', 200);
    } else {
      triggerTaunt('PLAYER_RESIGN', 200);
    }
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
    if (gameStatus() !== 'playing') {
      return;
    }
    if (isAiThinking()) return;

    clearIdleTimer();
    const history = moveHistory();
    if (history.length === 0) return;
    undoCountInMatch++;

    const currentBoard = createEmptyBoard();
    let stepsToUndo = 1;

    if (currentTurn() === playerColor() && history.length >= 2) {
      stepsToUndo = 2;
    } else {
      stepsToUndo = 1;
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
    undoCountInMatch++;
    const now = Date.now();
    const isInstantUndo = now - lastPlayerMoveTimestamp < 350;
    recentUndoTimestamps = recentUndoTimestamps.filter(t => now - t < 10000);
    recentUndoTimestamps.push(now);

    if (isInstantUndo) {
      triggerTaunt('UNDO_BEFORE_AI_MOVES', 300);
    } else if (recentUndoTimestamps.length >= 3) {
      triggerTaunt('MULTI_UNDO', 300);
    } else {
      triggerTaunt('PLAYER_UNDO', 300);
    }
    resetIdleTimer();
  }

  /**
   * Cài đặt cấp độ thủ công hoặc tự động theo số trận thắng
   */
  function setManualLevel(levelId: number | null) {
    const currentLvl = currentLevelConfig().id;
    if (levelId !== null) {
      if (levelId < currentLvl) {
        triggerTaunt(isRageDowngradeContext() ? 'RAGE_DOWNGRADE_AFTER_LOSS' : 'CHANGE_BOT_LEVEL_DOWN', 200);
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
    triggerTaunt(isDesperateThemeSwapContext() ? 'DESPERATE_THEME_SWAP' : 'THEME_CHANGE', 200);
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
    const now = Date.now();
    recentSoundToggleTimestamps = recentSoundToggleTimestamps.filter(t => now - t < 3000);
    recentSoundToggleTimestamps.push(now);

    const next = soundService.toggleMute();
    setIsMutedState(next);
    if (recentSoundToggleTimestamps.length >= 4) {
      triggerTaunt('SOUND_SPAM_TOGGLE', 150);
    } else if (next) {
      triggerTaunt('SOUND_MUTE', 150);
    } else {
      triggerTaunt('SOUND_UNMUTE', 150);
    }
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
    isSeriesActive,
    seriesGameNumber,
    lastResigned,
    nextSeriesPlayerSide,
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
    startNewSeries,
    startNextGame,
    resetSeries,
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
