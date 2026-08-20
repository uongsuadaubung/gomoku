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
  WorkerMessageIn,
  WorkerMessageOut,
} from '../game/types';
import { createEmptyBoard, cloneBoard, checkWin, isBoardFull } from '../game/board';
import { getLevelConfigByWins, SCORES } from '../game/constants';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { TauntService } from '../services/tauntService';
import { TauntEvent } from '../data/taunts/types';
import { getGameStrategy } from '../game/strategies';
import { interactionTracker } from '../services/interactionTracker';
import { TauntEvaluator } from '../services/tauntEvaluator';
import { BrowserListenerService } from '../services/browserListenerService';

// Slices
import { createSettingsSlice } from './slices/settingsSlice';
import { createSeriesSlice } from './slices/seriesSlice';
import { createPuzzleSlice } from './slices/puzzleSlice';
import { createTauntSlice } from './slices/tauntSlice';
import { createBlitzSlice } from './slices/blitzSlice';

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

  // 2. Trạng thái AI Engine & Worker
  const [isAiThinking, setIsAiThinking] = createSignal<boolean>(false);
  const [aiStats, setAiStats] = createSignal<AIStats | null>(null);
  const [aiThinkingProgress, setAiThinkingProgress] = createSignal<{ depth: number; nodes: number }>({
    depth: 0,
    nodes: 0,
  });

  // 3. Khởi tạo các Slices
  const settings = createSettingsSlice();
  const series = createSeriesSlice();
  const puzzle = createPuzzleSlice({ stats: settings.stats });

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
    lastGameResult: null as 'win' | 'loss' | 'draw' | null,
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

  // Tính toán AI Color & Strategies
  const aiColor = createMemo<ActivePlayer>(() => (playerColor() === BLACK ? WHITE : BLACK));
  const currentStrategy = createMemo(() => getGameStrategy(gameMode()));

  const campaignLevelConfig = createMemo<LevelConfig>(() => {
    return getGameStrategy('campaign').getBotLevel(settings.stats());
  });

  const currentLevelConfig = createMemo<LevelConfig>(() => {
    return currentStrategy().getBotLevel(settings.stats(), series.customConfig());
  });

  const nextSeriesPlayerSide = createMemo<boolean>(() => {
    if (gameMode() === 'custom') {
      return series.customConfig()?.playerColor === BLACK;
    }
    return playerColor() !== BLACK;
  });

  const isPlayerInHeavyLossStreak = () => settings.stats().currentStreak === 0 && settings.stats().losses >= 3;

  // 4. Web Worker Lifecycle & Event Listeners
  let worker: Worker | null = null;
  let removeEventListeners: (() => void) | null = null;

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

    removeEventListeners = BrowserListenerService.setup({
      isGamePlaying: () => matchStage() === 'playing',
      isPlayerTurn: () => currentTurn() === playerColor(),
      triggerTaunt: taunt.triggerTaunt,
    });
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
    clearAllPendingTimeouts();
  });

  // 5. Điều Phối Chế Độ Chơi (Mode Starters)
  function startCampaignMode() {
    setGameMode('campaign');
    series.setIsSeriesActive(false);
    series.setSeriesGameNumber(0);
    series.setLastResigned(false);
    setBoard(createEmptyBoard());
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    setGameStatus('idle');
    setMatchStage('ready');
    taunt.clearTauntQueue();
    taunt.resetIdleTimer();
    soundService.playClickSound();
  }

  function startPuzzleMode(stars?: number, forceNew: boolean = false) {
    const scenario = puzzle.getOrGeneratePuzzle(stars, forceNew);

    setGameMode('puzzle');
    series.setIsSeriesActive(false);
    series.setSeriesGameNumber(0);
    series.setLastResigned(false);
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
    const startTaunt = TauntEvaluator.evaluateGameStart(matchCtx.lastGameResult);
    taunt.triggerTaunt(startTaunt, 200);
    taunt.resetIdleTimer();
  }

  function restartCurrentPuzzle() {
    const scenario = puzzle.currentPuzzle() || StorageService.getActivePuzzle();
    if (!scenario) {
      startPuzzleMode(undefined, true);
      return;
    }
    StorageService.saveActivePuzzle(scenario);
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
    taunt.resetIdleTimer();
  }

  function nextPuzzleScenario(stars?: number) {
    if (gameMode() === 'puzzle' && gameStatus() === 'playing') {
      resignGame();
    }
    startPuzzleMode(stars, true);
  }

  function startCustomMatch(botLevel: number, playAsBlack?: boolean) {
    setGameMode('custom');
    series.setCustomConfig({
      botLevel,
      playerColor: playAsBlack !== undefined ? (playAsBlack ? BLACK : WHITE) : BLACK,
    });
    series.setIsSeriesActive(false);
    series.setSeriesGameNumber(0);
    series.setLastResigned(false);
    startNewGame(playAsBlack !== undefined ? playAsBlack : true);
  }

  function startBlitzMode(timeSeconds?: 5 | 10 | 15, startLevel?: number) {
    blitz.setupBlitzLevel(timeSeconds, startLevel);

    setGameMode('blitz');
    series.setIsSeriesActive(false);
    series.setSeriesGameNumber(0);
    series.setLastResigned(false);
    setPlayerColor(BLACK);
    setBoard(createEmptyBoard());
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);
    setAiStats(null);
    setIsAiThinking(false);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    setGameStatus('playing');
    setMatchStage('playing');
    setCurrentTurn(BLACK);

    soundService.playGameStartSound();
    const startTaunt = TauntEvaluator.evaluateGameStart(matchCtx.lastGameResult);
    taunt.triggerTaunt(startTaunt, 200);
    taunt.resetIdleTimer();
    blitz.startBlitzTimer();
  }

  function nextBlitzLevel() {
    startBlitzMode(blitz.blitzTimeLimit());
  }

  function goToMainMenu() {
    blitz.stopBlitzTimer();
    blitz.setIsBlitzTimeout(false);
    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }
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

    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }

    setBoard(createEmptyBoard());
    setMoveHistory([]);
    setLastMove(null);
    setWinInfo(null);
    setAiStats(null);
    setAiThinkingProgress({ depth: 0, nodes: 0 });

    const newPlayerColor = playAsBlack ? BLACK : WHITE;
    setPlayerColor(newPlayerColor);
    setGameStatus('playing');
    setMatchStage('playing');
    setCurrentTurn(BLACK);

    soundService.playGameStartSound();
    const startTaunt = TauntEvaluator.evaluateGameStart(matchCtx.lastGameResult);
    taunt.triggerTaunt(startTaunt, 200);

    if (newPlayerColor === WHITE) {
      setIsAiThinking(true);
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
    setAiStats(null);
    setIsAiThinking(false);
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
    if (!worker || gameStatus() === 'black_win' || gameStatus() === 'white_win' || gameStatus() === 'draw') {
      return;
    }

    taunt.clearIdleTimer();
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

  function executeAiMove(move: Move) {
    if (gameStatus() !== 'playing') return;

    const currentBoard = cloneBoard(board());
    const ai = aiColor();

    if (currentBoard[move.row][move.col] !== EMPTY) {
      return;
    }

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

    if (TauntService.isPlayerThreatMove(currentBoard, ai)) {
      matchCtx.botEverHadOpenThreat = true;
    }
    const statsObj = aiStats();
    if (statsObj?.tacticalType === 'vcf' || statsObj?.tacticalType === 'vct' || (statsObj?.bestScore || 0) >= SCORES.OPEN_FOUR) {
      taunt.triggerTaunt('BOT_TRAP', 200);
    } else if (isBlocking && Math.random() < 0.6) {
      taunt.triggerTaunt('BOT_BLOCK_THREAT', 250);
    }

    setCurrentTurn(playerColor());
    taunt.resetIdleTimer();
    if (gameMode() === 'blitz') {
      blitz.startBlitzTimer();
    }
  }

  function makePlayerMove(row: number, col: number) {
    if (gameStatus() !== 'playing' || isAiThinking()) {
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

    const currentMode = gameMode();
    if (currentMode === 'puzzle') {
      StorageService.saveActivePuzzle(null);
    }
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
      const activeStreak = newStats.campaign?.currentStreak ?? newStats.blitz?.currentStreak ?? newStats.currentStreak ?? 0;
      if (activeStreak >= 2) {
        soundService.playStreakWinSound();
      } else {
        soundService.playWinSound();
      }
      triggerConfetti();

      const winTaunt = TauntEvaluator.evaluatePlayerWin({
        moveCount,
        hadComeback: matchCtx.hadHighAiAdvantage,
        undoCount: matchCtx.undoCount,
        wasUndoJustUsed: matchCtx.wasUndoJustUsed,
        botEverHadOpenThreat: matchCtx.botEverHadOpenThreat,
        prevStats,
        currentLevelId: oldLevel,
      });
      taunt.triggerTaunt(winTaunt, 500);

      const totalGames = newStats.wins + newStats.losses + newStats.draws;
      if (totalGames === 100) {
        setSafeTimeout(() => taunt.triggerTaunt('PERFECT_CENTURY_GAMES', 400), 1200);
      }

      if (currentMode === 'campaign') {
        const newLevel = getLevelConfigByWins(newStats.wins, newStats.manualLevel);
        if (newLevel.id > oldLevel && newStats.manualLevel === null) {
          setSafeTimeout(() => {
            soundService.playLevelUpSound();
            settings.setShowLevelUpAlert(newLevel);
            taunt.triggerTaunt('LEVEL_UP_ALERT', 400);
          }, 800);
        }
      }
    } else if (winner === aiColor()) {
      soundService.playLossSound();
      matchCtx.lastGameResult = 'loss';
      const newStats = StorageService.recordGame(currentMode, 'loss', extraInfo);
      settings.setStats(newStats);
      matchCtx.wasLastGameDraw = false;
      matchCtx.consecutiveDrawsCount = 0;
      setSessionScore(prev => ({ ...prev, botWins: prev.botWins + 1 }));

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
      taunt.triggerTaunt(botWinTaunt, 400);

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
      const drawTaunt = TauntEvaluator.evaluateDraw(matchCtx.consecutiveDrawsCount);
      matchCtx.wasLastGameDraw = true;
      taunt.triggerTaunt(drawTaunt, 400);

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

    taunt.triggerTaunt(getResignTaunt(), 200);
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
    if (isAiThinking()) return;
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
    const isInstantUndo = interactionTracker.getTimeSinceLast('PLAYER_MOVE') < 350;
    const recentUndoCount = interactionTracker.record('UNDO', 10000);

    const undoTaunt = TauntEvaluator.evaluateUndo({
      isInstantUndo,
      recentUndoCount,
    });
    taunt.triggerTaunt(undoTaunt, 300);
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
    isAiThinking,
    aiStats,
    aiThinkingProgress,
    currentStrategy,
    currentLevelConfig,
    campaignLevelConfig,
    nextSeriesPlayerSide,

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
    showRulesModal: settings.showRulesModal,
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

    // Taunt Slice
    tauntState: taunt.tauntState,
    triggerTaunt: taunt.triggerTaunt,

    // Setters
    setMatchStage,
    setGameMode,
    setShowStatsModal: settings.setShowStatsModal,
    setShowBotModal: settings.setShowBotModal,
    setShowSettingsModal: settings.setShowSettingsModal,
    setShowRulesModal: settings.setShowRulesModal,
    setShowLevelUpAlert: settings.setShowLevelUpAlert,

    // Match & Game Actions
    startCampaignMode,
    startPuzzleMode,
    restartCurrentPuzzle,
    nextPuzzleScenario,
    startCustomMatch,
    startBlitzMode,
    nextBlitzLevel,
    goToMainMenu,
    startNewGame,
    startNewSeries,
    startNextGame,
    resetSeries,
    setPlayerSide,
    resignGame,
    makePlayerMove,
    undoMove,
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
