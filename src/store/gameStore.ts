import { createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import confetti from 'canvas-confetti';
import {
  BoardMatrix,
  ActivePlayer,
  BLACK,
  WHITE,
  EMPTY,
  MatchStage,
  GameStatus,
  GameMode,
  CustomGameConfig,
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
import { getLevelConfigByWins, AI_LEVELS, SCORES } from '../game/constants';
import { generateTacticalScenario, PuzzleScenario, PuzzleDifficulty } from '../game/puzzleGenerator';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { TauntService, BotMood } from '../services/tauntService';
import { TauntEvent } from '../data/taunts/types';
import { getGameStrategy } from '../game/strategies';
import { interactionTracker } from '../services/interactionTracker';
import { TauntEvaluator } from '../services/tauntEvaluator';
import { BrowserListenerService } from '../services/browserListenerService';

export function createGameStore() {
  // Trạng thái bàn cờ
  const [board, setBoard] = createSignal<BoardMatrix>(createEmptyBoard());
  const [currentTurn, setCurrentTurn] = createSignal<ActivePlayer>(BLACK);
  const [playerColor, setPlayerColor] = createSignal<ActivePlayer>(BLACK);
  const [matchStage, setMatchStage] = createSignal<MatchStage>('ready');
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

  // Modals
  const [showStatsModal, setShowStatsModal] = createSignal<boolean>(false);
  const [showBotModal, setShowBotModal] = createSignal<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = createSignal<boolean>(false);
  const [showRulesModal, setShowRulesModal] = createSignal<boolean>(false);
  const [showLevelUpAlert, setShowLevelUpAlert] = createSignal<LevelConfig | null>(null);

  // Trạng thái Chế Độ Chơi (Game Mode)
  const [gameMode, setGameMode] = createSignal<GameMode>('menu');
  const [currentPuzzle, setCurrentPuzzle] = createSignal<PuzzleScenario | null>(null);
  const [customConfig, setCustomConfig] = createSignal<CustomGameConfig>({
    botLevel: 3,
    playerColor: BLACK,
  });

  // Bên đi trước ở ván kế tiếp trong chuỗi (tự động đảo bên trong Chiến Dịch, giữ nguyên phe đã chọn trong Đấu Tùy Chọn)
  const nextSeriesPlayerSide = createMemo<boolean>(() => {
    if (gameMode() === 'custom') {
      return customConfig()?.playerColor === BLACK;
    }
    return playerColor() !== BLACK;
  });

  // Tính toán AI Color
  const aiColor = createMemo<ActivePlayer>(() => (playerColor() === BLACK ? WHITE : BLACK));

  // ============================================================================
  // STRATEGY PATTERN CHO CHẾ ĐỘ CHƠI
  // ============================================================================
  const currentStrategy = createMemo(() => getGameStrategy(gameMode()));

  // Cấu hình cấp độ Chiến Dịch thuần túy (dựa trên Strategy Chiến Dịch)
  const campaignLevelConfig = createMemo<LevelConfig>(() => {
    return getGameStrategy('campaign').getBotLevel(stats());
  });

  // Cấu hình cấp độ AI hiện tại (ủy quyền hoàn toàn cho Strategy hiện tại)
  const currentLevelConfig = createMemo<LevelConfig>(() => {
    return currentStrategy().getBotLevel(stats(), customConfig());
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
      isGamePlaying: () => matchStage() === 'playing',
      isPlayerTurn: () => currentTurn() === playerColor(),
      triggerTaunt,
    });

    resetIdleTimer();
  });

  // Quản lý an toàn các Timeout bất đồng bộ để chống rò rỉ bộ nhớ (Ghost Timers)
  const pendingTimeouts: number[] = [];

  function setSafeTimeout(fn: () => void, delayMs: number): number {
    const id = window.setTimeout(() => {
      const idx = pendingTimeouts.indexOf(id);
      if (idx !== -1) pendingTimeouts.splice(idx, 1);
      fn();
    }, delayMs);
    pendingTimeouts.push(id);
    return id;
  }

  function clearAllPendingTimeouts() {
    while (pendingTimeouts.length > 0) {
      const id = pendingTimeouts.pop();
      if (id !== undefined) clearTimeout(id);
    }
  }

  onCleanup(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (removeEventListeners) {
      removeEventListeners();
      removeEventListeners = null;
    }
    clearAllPendingTimeouts();
    clearIdleTimer();
    clearTauntQueue();
  });

  interface QueuedTaunt {
    text: string;
    mood: BotMood;
    priority: number;
    event: TauntEvent;
  }

  const tauntQueue: QueuedTaunt[] = [];
  let isProcessingTauntQueue = false;
  let currentTauntTimer: number | null = null;

  function getTauntPriority(event: TauntEvent): number {
    const criticalEvents: TauntEvent[] = [
      'BOT_WIN',
      'PLAYER_WIN',
      'PLAYER_WIN_WITH_UNDO',
      'WIN_RIGHT_AFTER_UNDO',
      'BOT_WIN_LEADING_SCORE',
      'CLEAN_SWEEP_DOMINATION',
      'IRON_CURTAIN_WIN',
      'GOD_LEVEL_VICTORY',
      'SPEED_WIN_QUICK',
      'COMEBACK_WIN',
      'NO_UNDO_WIN',
      'IMMEDIATE_REVENGE_CLICK',
      'PLAYER_RESIGN',
      'SURRENDER_ON_THREAT',
      'SURRENDER_AFTER_LONG_THINKING',
      'RESIGN_WHILE_AI_THINKING',
      'DEVTOOLS_INSPECT_HACK',
      'SCREENSHOT_ATTEMPT',
      'SPACEBAR_SMASH',
      'RAGE_QUIT_F5_RELOAD',
      'PERFECT_CENTURY_GAMES',
      'PLAYER_STREAK_WIN',
      'REVENGE_WIN_AFTER_LOSS_STREAK',
      'LEVEL_UP_ALERT',
    ];
    if (criticalEvents.includes(event)) return 3;

    const lowEvents: TauntEvent[] = [
      'MOUSE_JIGGLE_PANIC',
      'DRAG_SELECT_PANIC',
      'WINDOW_RESIZE_PANIC',
      'KEYBOARD_SMASH_SPAM',
      'IDLE_IN_GAME',
      'IDLE_THINKING',
      'IDLE_PRE_GAME',
      'IDLE_AFTER_LOSS',
      'STARE_AT_WIN_LINE',
      'SUPER_SLOW_MOVE',
      'MOUSE_LEAVE_VIEWPORT',
    ];
    if (lowEvents.includes(event)) return 1;

    return 2;
  }

  function processNextQueuedTaunt() {
    if (currentTauntTimer) {
      clearTimeout(currentTauntTimer);
      currentTauntTimer = null;
    }

    if (tauntQueue.length === 0) {
      isProcessingTauntQueue = false;
      setTauntState(prev => ({ ...prev, visible: false }));
      return;
    }

    isProcessingTauntQueue = true;
    const nextItem = tauntQueue.shift()!;

    setTauntState({
      text: nextItem.text,
      mood: nextItem.mood,
      visible: true,
      id: Date.now(),
    });

    soundService.playPopSound();

    // Thời gian hiển thị: tính theo độ dài câu thoại để người chơi kịp đọc hết
    const displayDuration = Math.min(6500, Math.max(3200, nextItem.text.length * 60 + 1500));

    currentTauntTimer = window.setTimeout(() => {
      // Ẩn bóng thoại 200ms trước khi nạp câu tiếp theo trong hàng đợi
      setTauntState(prev => ({ ...prev, visible: false }));
      currentTauntTimer = window.setTimeout(() => {
        processNextQueuedTaunt();
      }, 200);
    }, displayDuration);
  }

  function clearTauntQueue() {
    tauntQueue.length = 0;
    if (currentTauntTimer) {
      clearTimeout(currentTauntTimer);
      currentTauntTimer = null;
    }
    isProcessingTauntQueue = false;
    setTauntState(prev => ({ ...prev, visible: false }));
  }

  /**
   * Kích hoạt một câu cà khịa từ đối thủ với cơ chế HÀNG ĐỢI (Taunt Queue) chống đè thoại
   * (Nếu người chơi tắt cà khịa, câu thoại sẽ được chuyển đổi thành ký tự kiểm duyệt !@#$%^&*)
   */
  function triggerTaunt(event: TauntEvent, delayMs: number = 0) {
    if (delayMs > 0) {
      setSafeTimeout(() => triggerTaunt(event, 0), delayMs);
      return;
    }

    const now = Date.now();
    const isIdle = IDLE_EVENTS.includes(event);

    // Nếu là sự kiện IDLE mà đang có thoại trong hàng đợi hoặc vừa có Action Taunt trong 7.5s -> Bỏ qua
    if (isIdle && (isProcessingTauntQueue || tauntQueue.length > 0 || now - lastActionTauntTime < 7500)) {
      return;
    }

    if (!isIdle) {
      lastActionTauntTime = now;
      resetIdleTimer();
    }

    const priority = getTauntPriority(event);

    // Không thêm trùng lặp sự kiện cùng loại đang chờ trong hàng đợi
    if (tauntQueue.some(item => item.event === event)) {
      return;
    }

    // Nếu là sự kiện ưu tiên thấp (lắc chuột, bôi đen) mà đã có câu đang nói hoặc đang chờ -> Bỏ qua tránh spam
    if (priority === 1 && (tauntQueue.length >= 1 || isProcessingTauntQueue)) {
      return;
    }

    // Giới hạn độ dài hàng đợi tối đa 3 câu
    if (tauntQueue.length >= 3 && priority < 3) {
      return;
    }

    const currentStats = stats();
    const item = TauntService.getTaunt(event, {
      undoCount: undoCountInMatch,
      botWins: currentStats.losses,
      playerWins: currentStats.wins,
    });

    const isSilenced = !enableTaunts();
    const finalText = isSilenced ? TauntService.censorToGrawlix(item.text) : item.text;

    const queuedItem: QueuedTaunt = {
      text: finalText,
      mood: item.mood,
      priority,
      event,
    };

    // Nếu là sự kiện Tối Quan Trọng (Thắng/Thua/Đầu Hàng/DevTools), dọn bớt câu ưu tiên thấp
    if (priority >= 3) {
      while (tauntQueue.length > 0 && tauntQueue[0].priority < 3) {
        tauntQueue.shift();
      }
      tauntQueue.push(queuedItem);
      if (!isProcessingTauntQueue) {
        processNextQueuedTaunt();
      }
    } else {
      tauntQueue.push(queuedItem);
      if (!isProcessingTauntQueue) {
        processNextQueuedTaunt();
      }
    }
  }

  function clearIdleTimer() {
    if (idleThinkingTimer) {
      clearTimeout(idleThinkingTimer);
      idleThinkingTimer = null;
    }
  }

  function resetIdleTimer() {
    clearIdleTimer();

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
    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }

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
      setMatchStage('playing');
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
      setMatchStage('playing');
      triggerTaunt(getOpeningGreeting(), 250);
      resetIdleTimer();
    }
  }

  /**
   * Bắt đầu một chuỗi ván đấu mới từ đầu
   */
  function startNewSeries(playAsBlack: boolean) {
    if (gameMode() === 'custom') {
      setCustomConfig(prev => ({
        ...prev,
        playerColor: playAsBlack ? BLACK : WHITE,
      }));
    }
    setIsSeriesActive(true);
    setSeriesGameNumber(1);
    setLastResigned(false);
    launchBoardGame(playAsBlack);
  }

  /**
   * Bắt đầu ván kế tiếp: Tự động đảo lượt đi trước nếu đang trong chuỗi
   */
  function startNextGame() {
    if (gameMode() === 'custom') {
      // Trong chế độ Đấu Tùy Chọn: Giữ nguyên cấu hình phe người chơi đã chọn
      const customPlayAsBlack = customConfig()?.playerColor === BLACK;
      setSeriesGameNumber(prev => prev + 1);
      setLastResigned(false);
      launchBoardGame(customPlayAsBlack);
      return;
    }

    if (isSeriesActive()) {
      // Đang trong chuỗi Chiến Dịch: Tự động đảo lượt đi trước qua lại
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
    clearAllPendingTimeouts();
    clearIdleTimer();
    clearTauntQueue();
    setIsSeriesActive(false);
    setSeriesGameNumber(0);
    setLastResigned(false);
    setGameStatus('idle');
    setMatchStage('ready');
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
   * Bắt đầu chế độ Chiến Dịch (Leo Cấp)
   */
  function startCampaignMode(playAsBlack?: boolean) {
    setGameMode('campaign');
    StorageService.setManualLevel(null);
    const newStats = StorageService.getStats();
    setStats({ ...newStats, manualLevel: null });
    if (playAsBlack !== undefined) {
      startNewSeries(playAsBlack);
    } else {
      resetSeries();
    }
  }

  /**
   * Bắt đầu chế độ Thế Cờ Giữa Trận (Tactical Puzzle 1-5 Sao)
   */
  function startPuzzleMode(stars?: number) {
    const targetStars = stars ?? (stats().puzzle?.currentLevel || 1);
    const scenario = generateTacticalScenario(targetStars);
    setGameMode('puzzle');
    setCurrentPuzzle(scenario);
    setIsSeriesActive(false);
    setSeriesGameNumber(0);
    setLastResigned(false);
    setPlayerColor(scenario.playerColor);
    setBoard(cloneBoard(scenario.initialBoard));
    setMoveHistory([...scenario.initialMoveHistory]);
    const lastHist = scenario.initialMoveHistory[scenario.initialMoveHistory.length - 1];
    setLastMove(lastHist ? { row: lastHist.row, col: lastHist.col } : null);
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    setGameStatus('playing');
    setMatchStage('playing');
    setCurrentTurn(scenario.playerColor);

    soundService.playStoneSound();
    triggerTaunt('GAME_START', 200);
    resetIdleTimer();
  }

  /**
   * Chơi lại đúng thế cờ hiện tại từ đầu
   */
  function restartCurrentPuzzle() {
    const scenario = currentPuzzle();
    if (!scenario) {
      startPuzzleMode();
      return;
    }
    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }
    setBoard(cloneBoard(scenario.initialBoard));
    setMoveHistory([...scenario.initialMoveHistory]);
    const lastHist = scenario.initialMoveHistory[scenario.initialMoveHistory.length - 1];
    setLastMove(lastHist ? { row: lastHist.row, col: lastHist.col } : null);
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    setGameStatus('playing');
    setMatchStage('playing');
    setCurrentTurn(scenario.playerColor);
    soundService.playClickSound();
    resetIdleTimer();
  }

  /**
   * Sang thế cờ tiếp theo
   */
  function nextPuzzleScenario(stars?: number) {
    startPuzzleMode(stars);
  }

  /**
   * Bắt đầu chế độ Đấu Tùy Chọn với Bot
   */
  function startCustomMatch(botLevel: number, playAsBlack?: boolean) {
    setGameMode('custom');
    setCustomConfig({
      botLevel,
      playerColor: playAsBlack !== undefined ? (playAsBlack ? BLACK : WHITE) : BLACK,
    });
    if (playAsBlack !== undefined) {
      startNewSeries(playAsBlack);
    } else {
      resetSeries();
    }
  }

  /**
   * Quay về Màn Hình Menu Chính
   */
  function goToMainMenu() {
    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }
    setGameMode('menu');
    setGameStatus('idle');
    setMatchStage('ready');
    clearTauntQueue();
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
    const statusMap: Record<number, GameStatus> = {
      [BLACK]: 'black_win',
      [WHITE]: 'white_win',
      [EMPTY]: 'draw',
    };
    setGameStatus(statusMap[winner] || 'draw');
    setMatchStage('game_over');

    if (winResult) {
      setWinInfo(winResult);
    }

    setIsSeriesActive(true);
    if (seriesGameNumber() === 0) {
      setSeriesGameNumber(1);
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

    const currentMode = gameMode();
    const extraInfo = {
      stars: currentPuzzle()?.stars,
      botLevel: currentLevelConfig().id,
    };

    if (winner === player) {
      // Người chơi thắng!
      soundService.playWinSound();
      triggerConfetti();
      const newStats = StorageService.recordGame(currentMode, 'win', extraInfo);
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
        setSafeTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      }

      // Kiểm tra thăng cấp AI (chỉ áp dụng cho chế độ Chiến Dịch)
      if (currentMode === 'campaign') {
        const newLevel = getLevelConfigByWins(newStats.wins, newStats.manualLevel);
        if (newLevel.id > oldLevel && newStats.manualLevel === null) {
          setSafeTimeout(() => {
            soundService.playLevelUpSound();
            setShowLevelUpAlert(newLevel);
            triggerTaunt('LEVEL_UP_ALERT', 400);
          }, 800);
        }
      }
    } else if (winner === aiColor()) {
      // Người chơi thua -> Bot cà khịa
      soundService.playLossSound();
      const newStats = StorageService.recordGame(currentMode, 'loss', extraInfo);
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
        setSafeTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      } else {
        const prevTotal = prevStats.wins + prevStats.losses + prevStats.draws;
        const prevWinRate = prevTotal > 0 ? (prevStats.wins / prevTotal) * 100 : 100;
        const currentWinRate = totalGames > 0 ? (newStats.wins / totalGames) * 100 : 0;
        if (totalGames >= 20 && currentWinRate < 50 && prevWinRate >= 50) {
          setSafeTimeout(() => triggerTaunt('WIN_RATE_DROP_BELOW_50', 400), 1000);
        }
      }
    } else {
      // Hòa
      matchCtx.wasLastGameSpeedLoss = false;
      matchCtx.consecutiveDrawsCount++;
      const newStats = StorageService.recordGame(currentMode, 'draw', extraInfo);
      setStats(newStats);
      const drawTaunt = TauntEvaluator.evaluateDraw(matchCtx.consecutiveDrawsCount);
      matchCtx.wasLastGameDraw = true;
      triggerTaunt(drawTaunt, 400);

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setSafeTimeout(() => triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
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

    const isLongThinking = interactionTracker.getTimeSinceLast('PLAYER_MOVE') >= 35000;
    const hasThreat = TauntService.hasBotActiveThreat(board(), aiColor());

    const getResignTaunt = (): TauntEvent => {
      if (isAiThinkingWhenResigning) return 'RESIGN_WHILE_AI_THINKING';
      if (isLongThinking) return 'SURRENDER_AFTER_LONG_THINKING';
      if (hasThreat) return 'SURRENDER_ON_THREAT';
      return 'PLAYER_RESIGN';
    };

    triggerTaunt(getResignTaunt(), 200);
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
    // Kiểm tra quyền Đi Lại từ Strategy của chế độ chơi hiện tại
    if (!currentStrategy().canUndo()) return;

    clearIdleTimer();
    const history = moveHistory();
    if (history.length === 0) return;

    // Người chơi chỉ có thể Đi Lại nếu bản thân người chơi đã thực hiện ít nhất 1 nước cờ
    const hasPlayerMoved = history.some(item => item.player === playerColor());
    if (!hasPlayerMoved) return;

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
    setMatchStage('playing');
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
   * Đặt level thủ công cho Bot
   */
  function setManualLevel(levelId: number | null) {
    StorageService.setManualLevel(levelId);
    setStats(prev => ({
      ...prev,
      manualLevel: levelId,
    }));
  }

  /**
   * Reset toàn bộ thống kê và chuỗi thắng
   */
  function resetAllStats() {
    StorageService.resetStats();
    setStats(StorageService.getStats());
  }

  /**
   * Đổi giao diện bàn cờ
   */
  function setTheme(newTheme: ThemeType) {
    setThemeState(newTheme);
    StorageService.setTheme(newTheme);
  }

  /**
   * Đổi kiểu hiển thị bàn cờ (Giao điểm hoặc Giữa ô)
   */
  function setBoardStyle(newStyle: BoardStyle) {
    setBoardStyleState(newStyle);
    StorageService.setBoardStyle(newStyle);
  }

  /**
   * Bật/tắt số thứ tự nước đi
   */
  function toggleStepNumbers() {
    const next = !showStepNumbers();
    setShowStepNumbersState(next);
    StorageService.setShowStepNumbers(next);
  }

  /**
   * Bật/tắt âm thanh
   */
  function toggleSound() {
    const next = !isMuted();
    setIsMutedState(next);
    soundService.setMuted(next);
    if (!next && gameMode() !== 'menu') {
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
    matchStage,
    gameStatus,
    gameMode,
    currentPuzzle,
    customConfig,
    winInfo,
    moveHistory,
    lastMove,
    isAiThinking,
    aiStats,
    aiThinkingProgress,
    stats,
    currentStrategy,
    currentLevelConfig,
    campaignLevelConfig,
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
    setMatchStage,
    setGameMode,
    setCustomConfig,
    setShowStatsModal,
    setShowBotModal,
    setShowSettingsModal,
    setShowRulesModal,
    setShowLevelUpAlert,

    // Actions
    startCampaignMode,
    startPuzzleMode,
    restartCurrentPuzzle,
    nextPuzzleScenario,
    startCustomMatch,
    goToMainMenu,
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
