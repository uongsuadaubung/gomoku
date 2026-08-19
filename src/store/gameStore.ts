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
import { interactionTracker } from '../services/interactionTracker';
import { TauntEvaluator } from '../services/tauntEvaluator';
import { BrowserListenerService } from '../services/browserListenerService';

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
  let hadHighAiAdvantage: boolean = false;
  let botEverHadOpenThreat: boolean = false;
  let wasLastGameSpeedLoss: boolean = false;
  let wasUndoJustUsed: boolean = false;
  let wasLastGameDraw: boolean = false;
  let mouseLeaveTimer: number | null = null;
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

  let worker: Worker | null = null;
  let removeEventListeners: (() => void) | null = null;

  // Ngữ cảnh & trạng thái biến thiên của trận đấu (Match Context)
  const matchCtx = {
    startTime: Date.now(),
    lastUndoneMove: null as { row: number; col: number; timestamp: number } | null,
    consecutiveDrawsCount: 0,
    wasImmediateRevenge: false,
    hadHighAiAdvantage: false,
    botEverHadOpenThreat: false,
    wasUndoJustUsed: false,
    undoCount: 0,
    wasLastGameSpeedLoss: false,
    wasLastGameDraw: false,
  };

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
            matchCtx.hadHighAiAdvantage = true;
          }
          return;
        }

        if (data.type === 'MOVE_RESULT') {
          setIsAiThinking(false);
          setAiStats(data.stats);
          if (data.stats.winProbability >= 80 || (data.stats.bestScore || 0) >= SCORES.OPEN_FOUR) {
            matchCtx.hadHighAiAdvantage = true;
          }
          executeAiMove(data.move);
          return;
        }
      };
    } catch (err) {
      console.error('Không thể khởi tạo Web Worker:', err);
    }

    // Đăng ký toàn bộ event listeners của trình duyệt thông qua BrowserListenerService
    removeEventListeners = BrowserListenerService.setup({
      isGamePlaying: () => gameStatus() === 'playing',
      isPlayerTurn: () => currentTurn() === playerColor(),
      triggerTaunt,
    });

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
        const idleResult = TauntEvaluator.evaluateIdle({
          isPlaying: status === 'playing',
          isAiThinking: isAiThinking(),
          isPlayerLastGameLost: isPlayerLastGameLost(),
          hasTriggeredStareAtWinLine: interactionTracker.getFlag('STARE_AT_WIN_LINE'),
        });

        if (idleResult.consumeStareAtWinLine) {
          interactionTracker.setFlag('STARE_AT_WIN_LINE', true);
        }

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
          triggerTaunt(idleResult.event);
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

    // Reset ngữ cảnh ván đấu mới
    matchCtx.hadHighAiAdvantage = false;
    matchCtx.botEverHadOpenThreat = false;
    matchCtx.wasUndoJustUsed = false;
    matchCtx.undoCount = 0;
    interactionTracker.setFlag('STARE_AT_WIN_LINE', false);

    try {
      sessionStorage.setItem('gomoku_active_game', '1');
    } catch {
      // Bỏ qua lỗi sessionStorage
    }

    const nowDate = new Date();
    const currentHour = nowDate.getHours();
    const currentMinutes = nowDate.getMinutes();
    const timeVal = currentHour + currentMinutes / 60;
    const dayOfWeek = nowDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const isMondayMorning = dayOfWeek === 1 && currentHour >= 8 && currentHour < 10;
    const isFridayAfternoon = dayOfWeek === 5 && currentHour >= 16 && currentHour < 18;
    const isFoodComa = currentHour >= 13 && currentHour < 14;
    const isMidnightLow = currentHour >= 2 && currentHour < 5;
    const isLateNight = currentHour >= 23 || currentHour <= 1;
    const isEarlyMorning = currentHour >= 5 && currentHour < 8;
    const isLunchBreak = timeVal >= 11.5 && timeVal <= 13.2;

    const isImmediateRevenge =
      interactionTracker.getTimeSinceLast('GAME_OVER') < 600 && isPlayerLastGameLost();
    matchCtx.startTime = Date.now();
    matchCtx.wasImmediateRevenge = isImmediateRevenge;

    const getOpeningGreeting = (): TauntEvent => {
      if (isImmediateRevenge) return 'IMMEDIATE_REVENGE_CLICK';
      if (isMondayMorning && Math.random() < 0.7) return 'MONDAY_BLUES';
      if (isFridayAfternoon && Math.random() < 0.7) return 'TGIF_FRIDAY_AFTERNOON';
      if (isFoodComa && Math.random() < 0.6) return 'AFTERNOON_FOOD_COMA';
      if (isMidnightLow && Math.random() < 0.7) return 'MIDNIGHT_BATTERY_LOW';
      if (isLateNight && Math.random() < 0.6) return 'LATE_NIGHT_PLAY';
      if (isEarlyMorning && Math.random() < 0.6) return 'EARLY_MORNING_COFFEE';
      if (isLunchBreak && Math.random() < 0.6) return 'LUNCH_BREAK_RUSH';
      if (isWeekend && Math.random() < 0.45) return 'WEEKEND_CHILL';
      return 'GAME_START';
    };

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
      triggerTaunt(getOpeningGreeting(), 250);
      resetIdleTimer();
    } else {
      // Người chơi cầm quân Đen đi trước -> Bắt đầu ngay
      setBoard(emptyBoard);
      setMoveHistory([]);
      setLastMove(null);
      setCurrentTurn(BLACK);
      setGameStatus('playing');
      triggerTaunt(getOpeningGreeting(), 250);
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
      matchCtx.botEverHadOpenThreat = true;
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

    const history = moveHistory();
    const timeSinceLastMove = interactionTracker.getTimeSinceLast('PLAYER_MOVE');
    interactionTracker.record('PLAYER_MOVE', 60000);

    // Kiểm tra nếu người chơi Undo xong lại đánh đúng vào ô vừa xóa (REPEATED_UNDO_SAME_MOVE)
    if (
      matchCtx.lastUndoneMove &&
      matchCtx.lastUndoneMove.row === row &&
      matchCtx.lastUndoneMove.col === col &&
      Date.now() - matchCtx.lastUndoneMove.timestamp < 15000
    ) {
      triggerTaunt('REPEATED_UNDO_SAME_MOVE', 150);
      matchCtx.lastUndoneMove = null;
    } else {
      matchCtx.lastUndoneMove = null;
    }

    // 1. Đánh giá mở cờ / vị trí đặc biệt / tốc độ đánh (Pre-Move Pipeline)
    const preMoveTaunt = TauntEvaluator.evaluatePreMove({
      row,
      col,
      history,
      player: playerColor(),
      ai: aiColor(),
      timeSinceLastMove,
    });
    if (preMoveTaunt) {
      triggerTaunt(preMoveTaunt, 150);
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

    // Đánh giá và kích hoạt phản hồi lời thoại theo tình huống cờ (Move Pipeline)
    const moveTaunt = TauntEvaluator.evaluatePlayerMove({
      prevBoard: previousBoard,
      nextBoard: currentBoard,
      row,
      col,
      player,
      ai: aiColor(),
      history: newHistory,
      timeSinceLastMove,
    });
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
    interactionTracker.record('GAME_OVER', 60000);

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

    try {
      sessionStorage.removeItem('gomoku_active_game');
    } catch {
      // Bỏ qua lỗi sessionStorage
    }

    if (winner === player) {
      // Người chơi thắng!
      soundService.playWinSound();
      triggerConfetti();
      const newStats = StorageService.recordGame('win');
      setStats(newStats);
      matchCtx.wasLastGameSpeedLoss = false;
      matchCtx.wasLastGameDraw = false;
      matchCtx.consecutiveDrawsCount = 0;

      // Đánh giá kịch bản thắng của Người chơi
      const winTaunt = TauntEvaluator.evaluatePlayerWin({
        moveCount,
        hadComeback: matchCtx.hadHighAiAdvantage,
        undoCount: matchCtx.undoCount,
        wasUndoJustUsed: matchCtx.wasUndoJustUsed,
        botEverHadOpenThreat: matchCtx.botEverHadOpenThreat,
        prevStats,
        currentLevelId: oldLevel,
      });
      triggerTaunt(winTaunt, 500);

      // Kiểm tra mốc 100 ván đấu (PERFECT_CENTURY_GAMES)
      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
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
      matchCtx.wasLastGameDraw = false;
      matchCtx.consecutiveDrawsCount = 0;

      // Đánh giá kịch bản thắng của Bot
      const durationMs = Date.now() - matchCtx.startTime;
      const lastMoveCoord = lastMove();
      const botWinTaunt = TauntEvaluator.evaluateBotWin({
        moveCount,
        wasLastGameSpeedLoss: matchCtx.wasLastGameSpeedLoss,
        isHeavyLossStreak: isPlayerInHeavyLossStreak(),
        isImmediateRevenge: matchCtx.wasImmediateRevenge,
        durationMs,
        winningMoveRow: lastMoveCoord?.row,
        winningMoveCol: lastMoveCoord?.col,
      });
      matchCtx.wasLastGameSpeedLoss = moveCount <= 12;
      triggerTaunt(botWinTaunt, 400);

      // Kiểm tra mốc 100 ván hoặc tụt winrate dưới 50%
      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      } else {
        const prevTotal = prevStats.wins + prevStats.losses + prevStats.draws;
        const prevWinRate = prevTotal > 0 ? (prevStats.wins / prevTotal) * 100 : 100;
        const currentWinRate = totalGames > 0 ? (newStats.wins / totalGames) * 100 : 0;
        if (totalGames >= 20 && currentWinRate < 50 && prevWinRate >= 50) {
          setTimeout(() => triggerTaunt('WIN_RATE_DROP_BELOW_50', 400), 1000);
        }
      }
    } else {
      // Hòa
      matchCtx.wasLastGameSpeedLoss = false;
      matchCtx.consecutiveDrawsCount++;
      const newStats = StorageService.recordGame('draw');
      setStats(newStats);
      const drawTaunt = TauntEvaluator.evaluateDraw(matchCtx.consecutiveDrawsCount);
      matchCtx.wasLastGameDraw = true;
      triggerTaunt(drawTaunt, 400);

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      }
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

    const isAiThinkingWhenResigning = isAiThinking();
    if (worker && isAiThinkingWhenResigning) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }

    // Chấm dứt chuỗi ván đấu hiện tại khi người chơi đầu hàng
    setIsSeriesActive(false);
    setLastResigned(true);

    const isLongThinking = interactionTracker.getTimeSinceLast('PLAYER_MOVE') >= 35000;
    const hasThreat = TauntService.hasBotActiveThreat(board(), aiColor());

    if (isAiThinkingWhenResigning) {
      triggerTaunt('RESIGN_WHILE_AI_THINKING', 200);
    } else if (isLongThinking) {
      triggerTaunt('SURRENDER_AFTER_LONG_THINKING', 200);
    } else if (hasThreat) {
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
    matchCtx.undoCount++;
    matchCtx.wasUndoJustUsed = true;

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

    // Ghi nhớ nước cờ người chơi vừa Undo để bắt đòn REPEATED_UNDO_SAME_MOVE nếu đánh lại đúng ô cũ
    const undoneMove = history[history.length - stepsToUndo];
    if (undoneMove && undoneMove.player === playerColor()) {
      matchCtx.lastUndoneMove = { row: undoneMove.row, col: undoneMove.col, timestamp: Date.now() };
    }

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
    const isInstantUndo = interactionTracker.getTimeSinceLast('PLAYER_MOVE') < 350;
    const recentUndoCount = interactionTracker.record('UNDO', 10000);

    const undoTaunt = TauntEvaluator.evaluateUndo({
      isInstantUndo,
      recentUndoCount,
    });
    triggerTaunt(undoTaunt, 300);
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
    const count = interactionTracker.record('THEME_CHANGE', 5000);

    setThemeState(t);
    StorageService.setTheme(t);
    soundService.playClickSound();

    if (count >= 3) {
      triggerTaunt('RAPID_THEME_CYCLING', 200);
    } else {
      triggerTaunt(isDesperateThemeSwapContext() ? 'DESPERATE_THEME_SWAP' : 'THEME_CHANGE', 200);
    }
  }

  /**
   * Đổi phong cách đặt quân (giao điểm đường kẻ vs giữa ô vuông)
   */
  function setBoardStyle(s: BoardStyle) {
    setBoardStyleState(s);
    StorageService.setBoardStyle(s);
    soundService.playClickSound();
    if (gameStatus() === 'playing' && moveHistory().length >= 6) {
      triggerTaunt('SWITCH_BOARD_STYLE_MID_GAME', 200);
    } else {
      triggerTaunt('BOARD_STYLE_CHANGE', 200);
    }
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
    const isSpam = interactionTracker.record('SOUND_TOGGLE', 3000) >= 4;

    const next = soundService.toggleMute();
    setIsMutedState(next);
    if (isSpam) {
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
