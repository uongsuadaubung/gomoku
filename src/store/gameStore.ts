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
  WinInfo,
  Move,
  AIStats,
  LevelConfig,
  MoveHistoryItem,
  GameResult,
} from '../game/types';
import { createEmptyBoard, cloneBoard, checkWin, isBoardFull } from '../game/board';
import { getLevelConfigByWins, SCORES } from '../game/constants';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { TauntService } from '../services/tauntService';
import { TauntEvent } from '../data/taunts/types';
import {
  getGameStrategy,
  ModeInitContext,
  PuzzleStrategy,
  BlitzStrategy,
  CustomStrategy,
  TutorStrategy,
} from '../game/strategies';
import { interactionTracker } from '../services/interactionTracker';
import { TauntEvaluator } from '../services/tauntEvaluator';
import { BrowserListenerService } from '../services/browserListenerService';

// Slices
import { createSettingsSlice } from './slices/settingsSlice';
import { createSeriesSlice } from './slices/seriesSlice';
import { createPuzzleSlice } from './slices/puzzleSlice';
import { createTauntSlice } from './slices/tauntSlice';
import { createBlitzSlice } from './slices/blitzSlice';
import { createTutorSlice } from './slices/tutorSlice';
import { createGuideSlice } from './slices/guideSlice';
import { createAiSlice } from './slices/aiSlice';

interface MatchContext {
  startTime: number;
  lastUndoneMove: { row: number; col: number; timestamp: number } | null;
  consecutiveDrawsCount: number;
  wasImmediateRevenge: boolean;
  hadHighAiAdvantage: boolean;
  botEverHadOpenThreat: boolean;
  wasUndoJustUsed: boolean;
  undoCount: number;
  wasLastGameSpeedLoss: boolean;
  wasLastGameDraw: boolean;
  lastGameResult: GameResult | null;
}

export function createGameStore() {
  // 1. Trạng thái Bàn cờ & Ván đấu
  const [board, setBoard] = createSignal<BoardMatrix>(createEmptyBoard());
  const [currentTurn, setCurrentTurn] = createSignal<ActivePlayer>(BLACK);
  const [playerColor, setPlayerColor] = createSignal<ActivePlayer>(BLACK);
  const [matchStage, setMatchStage] = createSignal<MatchStage>('ready');
  const [gameStatus, setGameStatus] = createSignal<GameStatus>('idle');
  const [winInfo, setWinInfo] = createSignal<WinInfo | null>(null);
  const [moveHistory, setMoveHistory] = createSignal<MoveHistoryItem[]>([]);
  const [lastMove, setLastMove] = createSignal<{ row: number; col: number } | null>(null);
  const [gameMode, setGameMode] = createSignal<GameMode>('menu');

  // 2. Khởi tạo các Slices
  const settings = createSettingsSlice();
  const series = createSeriesSlice();
  const puzzle = createPuzzleSlice({ stats: settings.stats });
  const tutor = createTutorSlice({ stats: settings.stats, setStats: settings.setStats });
  const guide = createGuideSlice({
    stats: settings.stats,
    setStats: settings.setStats,
    syncBoardToMain: (newBoard, turn) => {
      setBoard(newBoard);
      setCurrentTurn(turn);
      setPlayerColor(turn);
    },
  });

  const ai = createAiSlice({
    onMoveCalculated: executeAiMove,
    onHighAdvantageDetected: () => {
      matchCtx.hadHighAiAdvantage = true;
    },
  });

  // Safe timeout helper
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

  let sessionGamesCount: number = 0;
  const [sessionScore, setSessionScore] = createSignal<{ playerWins: number; botWins: number; draws: number }>({
    playerWins: 0,
    botWins: 0,
    draws: 0,
  });

  // Ngữ cảnh & trạng thái biến thiên của trận đấu (Match Context)
  const matchCtx: MatchContext = {
    startTime: Date.now(),
    lastUndoneMove: null,
    consecutiveDrawsCount: 0,
    wasImmediateRevenge: false,
    hadHighAiAdvantage: false,
    botEverHadOpenThreat: false,
    wasUndoJustUsed: false,
    undoCount: 0,
    wasLastGameSpeedLoss: false,
    wasLastGameDraw: false,
    lastGameResult: null,
  };

  const taunt = createTauntSlice({
    gameMode,
    matchStage,
    gameStatus,
    currentTurn,
    playerColor,
    stats: settings.stats,
    enableTaunts: settings.enableTaunts,
    getUndoCountInMatch: () => matchCtx.undoCount,
    setSafeTimeout,
  });

  const blitz = createBlitzSlice({
    stats: settings.stats,
    setStats: settings.setStats,
    matchStage,
    onTimeoutLoss: () => {
      soundService.playTimeoutAlarmSound();
      taunt.triggerTaunt('TIMEOUT_LOSS', 100);
      handleGameOver(aiColor(), null);
    },
  });

  const aiColor = createMemo<ActivePlayer>(() => (playerColor() === BLACK ? WHITE : BLACK));
  const currentStrategy = createMemo(() => getGameStrategy(gameMode()));

  const campaignLevelConfig = createMemo<LevelConfig>(() => {
    return getGameStrategy('campaign').getBotLevel({ stats: settings.stats() });
  });

  const currentLevelConfig = createMemo<LevelConfig>(() => {
    return currentStrategy().getBotLevel({
      stats: settings.stats(),
      customConfig: series.customConfig(),
      tutorLevel: tutor.selectedOpponentLevel(),
    });
  });

  const nextSeriesPlayerSide = createMemo<boolean>(() => {
    return currentStrategy().getNextSeriesPlayerSide({
      currentPlayerColor: playerColor(),
      customConfig: series.customConfig(),
    });
  });

  const currentStreak = createMemo<number>(() => {
    return currentStrategy().getCurrentStreak(settings.stats());
  });

  const isPlayerInHeavyLossStreak = () => settings.stats().currentStreak === 0 && settings.stats().losses >= 3;

  // 4. Browser Event Listeners
  let removeEventListeners: (() => void) | null = null;

  onMount(() => {
    removeEventListeners = BrowserListenerService.setup({
      isGamePlaying: () => matchStage() === 'playing',
      isPlayerTurn: () => currentTurn() === playerColor(),
      triggerTaunt: taunt.triggerTaunt,
    });
  });

  onCleanup(() => {
    if (removeEventListeners) {
      removeEventListeners();
      removeEventListeners = null;
    }
    clearAllPendingTimeouts();
  });

  // 5. Điều Phối Chế Độ Chơi (Mode Starters qua Strategy Pattern)
  function createModeContext(): ModeInitContext {
    return {
      setGameMode,
      setGameStatus,
      setMatchStage,
      setBoard,
      setMoveHistory,
      setLastMove,
      setWinInfo,
      setAiStats: ai.setAiStats,
      setIsAiThinking: ai.setIsAiThinking,
      setAiThinkingProgress: ai.setAiThinkingProgress,
      setCurrentTurn,
      setPlayerColor,

      series: {
        setIsSeriesActive: series.setIsSeriesActive,
        setSeriesGameNumber: series.setSeriesGameNumber,
        setLastResigned: series.setLastResigned,
        setCustomConfig: series.setCustomConfig,
        customConfig: series.customConfig,
      },

      puzzle: {
        getOrGeneratePuzzle: puzzle.getOrGeneratePuzzle,
        currentPuzzle: puzzle.currentPuzzle,
      },

      blitz: {
        setupBlitzLevel: blitz.setupBlitzLevel,
        stopBlitzTimer: blitz.stopBlitzTimer,
        setIsBlitzTimeout: blitz.setIsBlitzTimeout,
        blitzTimeLimit: blitz.blitzTimeLimit,
      },

      tutor: {
        setOpponentLevel: tutor.setOpponentLevel,
        resetTutorMatchSession: tutor.resetTutorMatchSession,
        selectedOpponentLevel: tutor.selectedOpponentLevel,
        triggerTutorSpeech: tutor.triggerTutorSpeech,
        analyzePreMove: tutor.analyzePreMove,
      },

      guide: {
        setGuideTab: guide.setGuideTab,
        resumeLatestLesson: guide.resumeLatestLesson,
        startSandboxMode: guide.startSandboxMode,
        clearWhatIf: guide.clearWhatIf,
      },

      soundService,
      taunt: {
        clearTauntQueue: taunt.clearTauntQueue,
        resetIdleTimer: taunt.resetIdleTimer,
        triggerTaunt: taunt.triggerTaunt,
      },

      campaignLevelConfig: () => campaignLevelConfig(),
      currentLevelConfig: () => currentLevelConfig(),
      cancelAiWorker: ai.cancelAiThinking,
      startNewGame,
      lastGameResult: () => matchCtx.lastGameResult,
      board: () => board(),
      gameStatus: () => gameStatus(),
      resignGame,
    };
  }

  function startCampaignMode() {
    getGameStrategy('campaign').enterMode(createModeContext());
  }

  function startPuzzleMode(stars?: number, forceNew: boolean = false) {
    getGameStrategy('puzzle').enterMode(createModeContext(), { stars, forceNew });
  }

  function restartCurrentPuzzle() {
    const strat = getGameStrategy('puzzle');
    strat.restartPuzzle(createModeContext());
  }

  function nextPuzzleScenario(stars?: number) {
    const strat = getGameStrategy('puzzle');
    strat.nextPuzzle(createModeContext(), { stars });
  }

  function enterCustomMode(botLevel?: number) {
    getGameStrategy('custom').enterMode(createModeContext(), { botLevel });
  }

  function setCustomBotLevel(lvl: number) {
    series.setCustomConfig(prev => ({
      botLevel: lvl,
      playerColor: prev?.playerColor || BLACK,
    }));
  }

  function startCustomMatch(botLevel?: number, playAsBlack: boolean = true) {
    const strat = getGameStrategy('custom');
    strat.startMatch(createModeContext(), { botLevel, playAsBlack });
  }

  function enterBlitzMode(startLevel?: number) {
    getGameStrategy('blitz').enterMode(createModeContext(), { startLevel });
  }

  function startBlitzMatch(timeSeconds?: 5 | 10 | 15, playAsBlack: boolean = true, startLevel?: number) {
    const strat = getGameStrategy('blitz');
    strat.startMatch(createModeContext(), { timeSeconds, playAsBlack, startLevel });
  }

  function nextBlitzLevel() {
    startBlitzMatch(blitz.blitzTimeLimit(), true);
  }

  function enterTutorMode(startLevel?: number) {
    getGameStrategy('tutor').enterMode(createModeContext(), { startLevel });
  }

  function startTutorMatch(startLevel?: number) {
    const strat = getGameStrategy('tutor');
    strat.startMatch(createModeContext(), { startLevel });
  }

  function nextTutorLevel() {
    const nextLvl = Math.min(12, tutor.selectedOpponentLevel() + 1);
    tutor.setOpponentLevel(nextLvl);
    startTutorMatch(nextLvl);
  }

  function startGuideMode(tab: 'lessons' | 'sandbox' = 'lessons') {
    getGameStrategy('guide').enterMode(createModeContext(), { tab });
  }

  function goToMainMenu() {
    blitz.stopBlitzTimer();
    blitz.setIsBlitzTimeout(false);
    ai.cancelAiThinking();
    guide.clearWhatIf();
    matchCtx.lastGameResult = null;
    setGameMode('menu');
    setGameStatus('idle');
    setMatchStage('ready');
    taunt.clearTauntQueue();
    taunt.clearIdleTimer();
    soundService.playClickSound();
  }

  function startNewGame(playAsBlack: boolean = true) {
    matchCtx.startTime = Date.now();
    matchCtx.hadHighAiAdvantage = false;
    matchCtx.botEverHadOpenThreat = false;
    matchCtx.wasUndoJustUsed = false;
    matchCtx.undoCount = 0;
    matchCtx.lastUndoneMove = null;

    ai.resetAiThinkingState();

    setBoard(createEmptyBoard());
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);

    const newPlayerColor = playAsBlack ? BLACK : WHITE;
    setPlayerColor(newPlayerColor);
    setGameStatus('playing');
    setMatchStage('playing');
    setCurrentTurn(BLACK);

    soundService.playGameStartSound();
    currentStrategy().onGameStart({
      lastGameResult: matchCtx.lastGameResult,
      botConfig: currentLevelConfig(),
      board: board(),
      playerColor: newPlayerColor,
      services: {
        triggerTutorSpeech: tutor.triggerTutorSpeech,
        analyzePreMove: tutor.analyzePreMove,
        resetTutorMatchSession: tutor.resetTutorMatchSession,
        triggerTaunt: taunt.triggerTaunt,
        startBlitzTimer: blitz.startBlitzTimer,
      },
    });

    if (newPlayerColor === WHITE) {
      ai.setIsAiThinking(true);
      triggerAiMove(createEmptyBoard(), BLACK);
    } else {
      taunt.resetIdleTimer();
    }
  }

  function startNewSeries(playAsBlack: boolean = true) {
    series.setIsSeriesActive(true);
    series.setSeriesGameNumber(1);
    startNewGame(playAsBlack);
  }

  function startNextGame() {
    if (!series.isSeriesActive()) {
      startNewSeries(true);
      return;
    }
    series.setSeriesGameNumber(prev => prev + 1);
    const willPlayerBeBlack = nextSeriesPlayerSide();
    startNewGame(willPlayerBeBlack);
  }

  function resetSeries() {
    series.setIsSeriesActive(false);
    series.setSeriesGameNumber(0);
    series.setLastResigned(false);
    setGameStatus('idle');
    setMatchStage('ready');
    setBoard(createEmptyBoard());
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);
    ai.resetAiThinkingState();
    taunt.clearTauntQueue();
    taunt.resetIdleTimer();
    soundService.playClickSound();
  }

  function setPlayerSide(isBlack: boolean) {
    if (series.isSeriesActive()) {
      resetSeries();
    }
    setPlayerColor(isBlack ? BLACK : WHITE);
    taunt.resetIdleTimer();
  }

  // 6. Nước Đi & AI Dispatch
  function triggerAiMove(currentBoard: BoardMatrix, aiPlayer: ActivePlayer) {
    if (gameStatus() === 'black_win' || gameStatus() === 'white_win' || gameStatus() === 'draw') {
      return;
    }

    taunt.clearIdleTimer();
    ai.requestAiMove(currentBoard, aiPlayer, currentLevelConfig().id, moveHistory().length);
  }

  function executeAiMove(move: Move) {
    if (gameStatus() !== 'playing') return;

    const currentBoard = cloneBoard(board());
    const aiPlayer = aiColor();

    if (currentBoard[move.row][move.col] !== EMPTY) {
      return;
    }

    // Đánh giá nước đi & ý đồ chiến thuật của Bot đối thủ trong Chế độ Gia Sư
    tutor.evaluateBotMove(currentBoard, move, aiPlayer);

    const isBlocking = TauntService.isBotBlockThreat(cloneBoard(currentBoard), playerColor(), move.row, move.col);

    currentBoard[move.row][move.col] = aiPlayer;
    setBoard(currentBoard);
    setLastMove({ row: move.row, col: move.col });

    const newHistory: MoveHistoryItem[] = [
      ...moveHistory(),
      {
        row: move.row,
        col: move.col,
        player: aiPlayer,
        stepNumber: moveHistory().length + 1,
        timestamp: Date.now(),
      },
    ];
    setMoveHistory(newHistory);
    soundService.playStoneSound();

    if (newHistory.length === 100) {
      taunt.triggerTaunt('CLUTCH_100_STONES', 300);
    } else if (newHistory.length === 40) {
      taunt.triggerTaunt('LONG_GAME', 300);
    }

    const win = checkWin(currentBoard);
    if (win) {
      handleGameOver(win.winner, win);
      return;
    }

    if (isBoardFull(currentBoard)) {
      handleGameOver(EMPTY, null);
      return;
    }

    if (TauntService.isPlayerThreatMove(currentBoard, aiPlayer)) {
      matchCtx.botEverHadOpenThreat = true;
    }
    const statsObj = ai.aiStats();
    if (statsObj?.tacticalType === 'vcf' || statsObj?.tacticalType === 'vct' || (statsObj?.bestScore || 0) >= SCORES.OPEN_FOUR) {
      taunt.triggerTaunt('BOT_TRAP', 200);
    } else if (isBlocking && Math.random() < 0.6) {
      taunt.triggerTaunt('BOT_BLOCK_THREAT', 250);
    }

    setCurrentTurn(playerColor());
    taunt.resetIdleTimer();
    currentStrategy().onPlayerTurnStart({
      board: currentBoard,
      playerColor: playerColor(),
      services: {
        startBlitzTimer: blitz.startBlitzTimer,
        analyzePreMove: tutor.analyzePreMove,
      },
    });
  }

  const canPlayerMove = () => {
    return currentStrategy().canPlayerMove({
      matchStage: matchStage(),
      isAiThinking: ai.isAiThinking(),
      currentTurn: currentTurn(),
      playerColor: playerColor(),
    });
  };

  function onCellHover(row: number, col: number, cell: number): boolean {
    return (
      currentStrategy().onCellHover?.({
        row,
        col,
        cell,
        services: {
          guide: {
            guideTab: guide.guideTab,
            setSelectedSandboxCell: guide.setSelectedSandboxCell,
          },
        },
      }) ?? false
    );
  }

  const shouldShowGuideOverlay = () => {
    return currentStrategy().shouldShowGuideOverlay?.() ?? false;
  };

  const shouldShowGuideMasterView = () => {
    return currentStrategy().shouldShowGuideMasterView?.() ?? false;
  };

  function makePlayerMove(row: number, col: number) {
    const customHandled = currentStrategy().handleCustomMove?.({
      row,
      col,
      services: {
        guide: {
          guideTab: guide.guideTab,
          handleLessonMove: guide.handleLessonMove,
          handleSandboxCellClick: guide.handleSandboxCellClick,
        },
      },
    });
    if (customHandled) return;

    if (gameStatus() !== 'playing' || ai.isAiThinking()) {
      return;
    }
    if (currentTurn() !== playerColor()) return;

    taunt.clearIdleTimer();
    blitz.stopBlitzTimer();
    const currentBoard = cloneBoard(board());
    if (currentBoard[row][col] !== EMPTY) return;

    const history = moveHistory();
    const timeSinceLastMove = interactionTracker.getTimeSinceLast('PLAYER_MOVE');
    interactionTracker.record('PLAYER_MOVE', 60000);

    if (
      matchCtx.lastUndoneMove &&
      matchCtx.lastUndoneMove.row === row &&
      matchCtx.lastUndoneMove.col === col &&
      Date.now() - matchCtx.lastUndoneMove.timestamp < 15000
    ) {
      taunt.triggerTaunt('REPEATED_UNDO_SAME_MOVE', 150);
      matchCtx.lastUndoneMove = null;
    } else {
      matchCtx.lastUndoneMove = null;
    }

    const preMoveTaunt = TauntEvaluator.evaluatePreMove({
      row,
      col,
      history,
      player: playerColor(),
      ai: aiColor(),
      timeSinceLastMove,
    });
    if (preMoveTaunt) {
      taunt.triggerTaunt(preMoveTaunt, 150);
    }

    const player = playerColor();
    const previousBoard = cloneBoard(currentBoard);

    currentBoard[row][col] = player;
    setBoard(currentBoard);
    setLastMove({ row, col });

    currentStrategy().onPlayerMove({
      previousBoard,
      currentBoard,
      move: { row, col },
      playerColor: player,
      services: {
        stopBlitzTimer: blitz.stopBlitzTimer,
        evaluatePostMove: tutor.evaluatePostMove,
      },
    });

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

    if (newHistory.length === 100) {
      taunt.triggerTaunt('CLUTCH_100_STONES', 300);
    } else if (newHistory.length === 40) {
      taunt.triggerTaunt('LONG_GAME', 300);
    }

    const win = checkWin(currentBoard);
    if (win) {
      handleGameOver(win.winner, win);
      return;
    }

    if (isBoardFull(currentBoard)) {
      handleGameOver(EMPTY, null);
      return;
    }

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
      taunt.triggerTaunt(moveTaunt, 150);
    }

    setCurrentTurn(aiColor());
    triggerAiMove(currentBoard, aiColor());
  }

  function handleGameOver(winner: typeof EMPTY | ActivePlayer, winResult: WinInfo | null) {
    taunt.clearIdleTimer();
    blitz.stopBlitzTimer();
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

    series.setIsSeriesActive(true);
    if (series.seriesGameNumber() === 0) {
      series.setSeriesGameNumber(1);
    }

    const player = playerColor();
    const oldLevel = currentLevelConfig().id;
    const prevStats = settings.stats();
    const moveCount = moveHistory().length;

    if (sessionGamesCount === 10) {
      setTimeout(() => {
        taunt.triggerTaunt('MARATHON_SERIES', 400);
      }, 700);
    }

    const currentMode = currentStrategy().mode;
    const extraInfo = {
      stars: puzzle.currentPuzzle()?.stars,
      botLevel: currentLevelConfig().id,
      isTimeout: blitz.isBlitzTimeout(),
      timeSeconds: blitz.blitzTimeLimit(),
    };

    if (winner === player) {
      matchCtx.lastGameResult = 'win';
      const newStats = StorageService.recordGame(currentMode, 'win', extraInfo);
      settings.setStats(newStats);
      matchCtx.wasLastGameSpeedLoss = false;
      matchCtx.wasLastGameDraw = false;
      matchCtx.consecutiveDrawsCount = 0;

      setSessionScore(prev => ({ ...prev, playerWins: prev.playerWins + 1 }));
      const activeStreak = currentStrategy().getCurrentStreak(newStats);
      if (activeStreak >= 2) {
        soundService.playStreakWinSound();
      } else {
        soundService.playWinSound();
      }
      triggerConfetti();

      currentStrategy().onPlayerWin({
        botConfig: currentLevelConfig(),
        oldLevel,
        prevStats,
        newStats,
        moveCount,
        hadComeback: matchCtx.hadHighAiAdvantage,
        undoCount: matchCtx.undoCount,
        wasUndoJustUsed: matchCtx.wasUndoJustUsed,
        botEverHadOpenThreat: matchCtx.botEverHadOpenThreat,
        services: {
          triggerTutorSpeech: tutor.triggerTutorSpeech,
          finalizeMatchReview: tutor.finalizeMatchReview,
          triggerTaunt: taunt.triggerTaunt,
          playLevelUpSound: soundService.playLevelUpSound,
          setShowLevelUpAlert: settings.setShowLevelUpAlert,
          setSafeTimeout,
          clearActivePuzzle: () => StorageService.saveActivePuzzle(null),
        },
      });

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setSafeTimeout(() => taunt.triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      }
    } else if (winner === aiColor()) {
      soundService.playLossSound();
      matchCtx.lastGameResult = 'loss';
      const newStats = StorageService.recordGame(currentMode, 'loss', extraInfo);
      settings.setStats(newStats);
      matchCtx.wasLastGameDraw = false;
      matchCtx.consecutiveDrawsCount = 0;
      setSessionScore(prev => ({ ...prev, botWins: prev.botWins + 1 }));

      currentStrategy().onBotWin({
        botConfig: currentLevelConfig(),
        moveCount,
        durationMs: Date.now() - matchCtx.startTime,
        winningMove: lastMove(),
        wasLastGameSpeedLoss: matchCtx.wasLastGameSpeedLoss,
        isHeavyLossStreak: isPlayerInHeavyLossStreak(),
        isImmediateRevenge: matchCtx.wasImmediateRevenge,
        services: {
          triggerTutorSpeech: tutor.triggerTutorSpeech,
          finalizeMatchReview: tutor.finalizeMatchReview,
          triggerTaunt: taunt.triggerTaunt,
          clearActivePuzzle: () => StorageService.saveActivePuzzle(null),
        },
      });
      matchCtx.wasLastGameSpeedLoss = moveCount <= 12;

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setSafeTimeout(() => taunt.triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      } else {
        const prevTotal = prevStats.wins + prevStats.losses + prevStats.draws;
        const prevWinRate = prevTotal > 0 ? (prevStats.wins / prevTotal) * 100 : 100;
        const currentWinRate = totalGames > 0 ? (newStats.wins / totalGames) * 100 : 0;
        if (totalGames >= 20 && currentWinRate < 50 && prevWinRate >= 50) {
          setSafeTimeout(() => taunt.triggerTaunt('WIN_RATE_DROP_BELOW_50', 400), 1000);
        }
      }
    } else {
      matchCtx.wasLastGameSpeedLoss = false;
      matchCtx.lastGameResult = 'draw';
      matchCtx.consecutiveDrawsCount++;
      const newStats = StorageService.recordGame(currentMode, 'draw', extraInfo);
      settings.setStats(newStats);
      setSessionScore(prev => ({ ...prev, draws: prev.draws + 1 }));

      currentStrategy().onDraw({
        botConfig: currentLevelConfig(),
        consecutiveDrawsCount: matchCtx.consecutiveDrawsCount,
        services: {
          triggerTutorSpeech: tutor.triggerTutorSpeech,
          finalizeMatchReview: tutor.finalizeMatchReview,
          triggerTaunt: taunt.triggerTaunt,
          clearActivePuzzle: () => StorageService.saveActivePuzzle(null),
        },
      });
      matchCtx.wasLastGameDraw = true;

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setSafeTimeout(() => taunt.triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      }
    }

    taunt.resetIdleTimer();
  }

  function resignGame() {
    if (gameStatus() !== 'playing') return;
    taunt.clearIdleTimer();
    matchCtx.lastGameResult = 'loss';

    const isAiThinkingWhenResigning = ai.isAiThinking();
    if (isAiThinkingWhenResigning) {
      ai.cancelAiThinking();
    }

    currentStrategy().onResign({
      botConfig: currentLevelConfig(),
      board: board(),
      aiColor: aiColor(),
      isAiThinking: isAiThinkingWhenResigning,
      isLongThinking: interactionTracker.getTimeSinceLast('PLAYER_MOVE') >= 35000,
      services: {
        triggerTutorSpeech: tutor.triggerTutorSpeech,
        finalizeMatchReview: tutor.finalizeMatchReview,
        triggerTaunt: taunt.triggerTaunt,
      },
    });
    handleGameOver(aiColor(), null);
  }

  function triggerConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'],
      });
    } catch {
      // Ignore confetti errors
    }
  }

  function undoMove() {
    if (gameStatus() !== 'playing') {
      return;
    }
    if (ai.isAiThinking()) return;
    if (!currentStrategy().canUndo()) return;

    taunt.clearIdleTimer();
    const history = moveHistory();
    if (history.length === 0) return;

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

    remainingHistory.forEach(item => {
      currentBoard[item.row][item.col] = item.player;
    });

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

    currentStrategy().onUndo({
      board: currentBoard,
      playerColor: playerColor(),
      isInstantUndo: interactionTracker.getTimeSinceLast('PLAYER_MOVE') < 350,
      recentUndoCount: interactionTracker.record('UNDO', 10000),
      services: {
        triggerTutorSpeech: tutor.triggerTutorSpeech,
        analyzePreMove: tutor.analyzePreMove,
        popLastEvaluation: tutor.popLastEvaluation,
        triggerTaunt: taunt.triggerTaunt,
      },
    });
    taunt.resetIdleTimer();
  }

  return {
    // Core Signals & Memos
    board,
    currentTurn,
    playerColor,
    aiColor,
    matchStage,
    gameStatus,
    gameMode,
    winInfo,
    moveHistory,
    lastMove,
    isAiThinking: ai.isAiThinking,
    aiStats: ai.aiStats,
    aiThinkingProgress: ai.aiThinkingProgress,
    currentStrategy,
    currentLevelConfig,
    campaignLevelConfig,
    nextSeriesPlayerSide,
    currentStreak,

    // Settings Slice Signals & Actions
    stats: settings.stats,
    theme: settings.theme,
    boardStyle: settings.boardStyle,
    showStepNumbers: settings.showStepNumbers,
    isMuted: settings.isMuted,
    enableTaunts: settings.enableTaunts,
    showStatsModal: settings.showStatsModal,
    showBotModal: settings.showBotModal,
    showSettingsModal: settings.showSettingsModal,
    showLevelUpAlert: settings.showLevelUpAlert,
    setTheme: settings.setTheme,
    setBoardStyle: settings.setBoardStyle,
    toggleStepNumbers: settings.toggleStepNumbers,
    toggleSound: () => settings.toggleSound(() => {
      if (gameMode() !== 'menu') taunt.triggerTaunt('SOUND_UNMUTE', 150);
    }),
    toggleEnableTaunts: settings.toggleEnableTaunts,
    setManualLevel: settings.setManualLevel,
    resetAllStats: settings.resetAllStats,

    // Session State
    sessionScore,
    lastGameResult: () => matchCtx.lastGameResult,

    // Series Slice
    isSeriesActive: series.isSeriesActive,
    seriesGameNumber: series.seriesGameNumber,
    lastResigned: series.lastResigned,
    customConfig: series.customConfig,
    setCustomConfig: series.setCustomConfig,

    // Puzzle Slice
    currentPuzzle: puzzle.currentPuzzle,

    // Blitz Slice
    blitzTimeLimit: blitz.blitzTimeLimit,
    blitzRemainingTime: blitz.blitzRemainingTime,
    isBlitzTimeout: blitz.isBlitzTimeout,
    setBlitzTimeLimit: blitz.setBlitzTimeLimit,

    // Tutor Slice
    tutorAnalysis: tutor.tutorAnalysis,
    tutorFeedback: tutor.tutorFeedback,
    tutorBotEvaluation: tutor.tutorBotEvaluation,
    tutorSpeech: tutor.tutorSpeech,
    tutorMood: tutor.tutorMood,
    tutorMatchReview: tutor.tutorMatchReview,
    resetTutorMatchSession: tutor.resetTutorMatchSession,
    selectedOpponentLevel: tutor.selectedOpponentLevel,
    setOpponentLevel: tutor.setOpponentLevel,
    enterTutorMode,
    startTutorMatch,
    nextTutorLevel,

    // Taunt Slice
    tauntState: taunt.tauntState,
    triggerTaunt: taunt.triggerTaunt,

    // Guide Slice (Kỳ Viện Bách Khoa & Sandbox)
    guideTab: guide.guideTab,
    setGuideTab: guide.setGuideTab,
    currentLessonId: guide.currentLessonId,
    currentLesson: guide.currentLesson,
    currentStepIndex: guide.currentStepIndex,
    currentStep: guide.currentStep,
    lessonFeedback: guide.lessonFeedback,
    isStepCompleted: guide.isStepCompleted,
    showHint: guide.showHint,
    setShowHint: guide.setShowHint,
    showTheoryModal: guide.showTheoryModal,
    setShowTheoryModal: guide.setShowTheoryModal,
    showQuickLessonDrawer: guide.showQuickLessonDrawer,
    setShowQuickLessonDrawer: guide.setShowQuickLessonDrawer,
    lessonViewMode: guide.lessonViewMode,
    setLessonViewMode: guide.setLessonViewMode,
    lessonIndexInfo: guide.lessonIndexInfo,
    isLessonUnlocked: guide.isLessonUnlocked,
    lessonBoard: guide.lessonBoard,
    sandboxBoard: guide.sandboxBoard,
    sandboxTurn: guide.sandboxTurn,
    showHeatmap: guide.showHeatmap,
    setShowHeatmap: guide.setShowHeatmap,
    showQualityBadges: guide.showQualityBadges,
    setShowQualityBadges: guide.setShowQualityBadges,
    selectedPresetId: guide.selectedPresetId,
    selectedSandboxCell: guide.selectedSandboxCell,
    setSelectedSandboxCell: guide.setSelectedSandboxCell,
    whatIfSteps: guide.whatIfSteps,
    isSimulatingWhatIf: guide.isSimulatingWhatIf,
    sandboxHeatmap: guide.sandboxHeatmap,
    sandboxEval: guide.sandboxEval,
    selectedCellExplanation: guide.selectedCellExplanation,
    completedLessonsSet: guide.completedLessonsSet,
    unlockedChaptersSet: guide.unlockedChaptersSet,
    progressPercent: guide.progressPercent,
    selectLesson: guide.selectLesson,
    resetCurrentLesson: guide.resetCurrentLesson,
    handleLessonMove: guide.handleLessonMove,
    nextLessonStep: guide.nextLessonStep,
    goToPrevLesson: guide.goToPrevLesson,
    goToNextLesson: guide.goToNextLesson,
    startSandboxMode: guide.startSandboxMode,
    handleSandboxCellClick: guide.handleSandboxCellClick,
    clearSandbox: guide.clearSandbox,
    toggleSandboxTurn: guide.toggleSandboxTurn,
    loadPreset: guide.loadPreset,
    simulateWhatIf: guide.simulateWhatIf,
    clearWhatIf: guide.clearWhatIf,
    startGuideMode,

    // Setters
    setMatchStage,
    setGameMode,
    setShowStatsModal: settings.setShowStatsModal,
    setShowBotModal: settings.setShowBotModal,
    setShowSettingsModal: settings.setShowSettingsModal,
    setShowLevelUpAlert: settings.setShowLevelUpAlert,

    // Match & Game Actions
    startCampaignMode,
    startPuzzleMode,
    restartCurrentPuzzle,
    nextPuzzleScenario,
    enterCustomMode,
    setCustomBotLevel,
    startCustomMatch,
    enterBlitzMode,
    startBlitzMatch,
    nextBlitzLevel,
    goToMainMenu,
    startNewGame,
    startNewSeries,
    startNextGame,
    resetSeries,
    setPlayerSide,
    resignGame,
    makePlayerMove,
    canPlayerMove,
    onCellHover,
    shouldShowGuideOverlay,
    shouldShowGuideMasterView,
    undoMove,
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
