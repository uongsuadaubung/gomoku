import { createSignal, onCleanup } from 'solid-js';
import { ActivePlayer, BLACK, GameMode, GameStatus, MatchStage, UserStats, WHITE } from '../../game/types';
import { TauntEvent } from '../../data/taunts/types';
import { TauntService, BotMood } from '../../services/tauntService';
import { soundService } from '../../services/soundService';

interface TauntSliceDeps {
  gameMode: () => GameMode;
  matchStage: () => MatchStage;
  gameStatus: () => GameStatus;
  currentTurn: () => ActivePlayer;
  playerColor: () => ActivePlayer;
  stats: () => UserStats;
  enableTaunts: () => boolean;
  getUndoCountInMatch?: () => number;
  setSafeTimeout: (fn: () => void, delayMs: number) => number;
}

interface QueuedTaunt {
  text: string;
  mood: BotMood;
  priority: number;
  event: TauntEvent;
}

const IDLE_EVENTS: TauntEvent[] = [
  'IDLE_IN_GAME',
  'IDLE_THINKING',
  'IDLE_PRE_GAME',
  'IDLE_AFTER_LOSS',
  'IDLE_AFTER_WIN',
  'STARE_AT_WIN_LINE',
];

export function createTauntSlice(deps: TauntSliceDeps) {
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

  let idleThinkingTimer: number | null = null;
  let lastActionTauntTime: number = 0;
  let currentTauntTimer: number | null = null;
  const tauntQueue: QueuedTaunt[] = [];
  let isProcessingTauntQueue = false;

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
      'TIMEOUT_LOSS',
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
      'IDLE_AFTER_WIN',
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

    const displayDuration = Math.min(6500, Math.max(3200, nextItem.text.length * 60 + 1500));

    currentTauntTimer = window.setTimeout(() => {
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

  function triggerTaunt(event: TauntEvent, delayMs: number = 0) {
    if (deps.gameMode() === 'menu') {
      return;
    }

    if (delayMs > 0) {
      deps.setSafeTimeout(() => triggerTaunt(event, 0), delayMs);
      return;
    }

    const now = Date.now();
    const isIdle = IDLE_EVENTS.includes(event);

    if (isIdle && (isProcessingTauntQueue || tauntQueue.length > 0 || now - lastActionTauntTime < 7500)) {
      return;
    }

    if (!isIdle) {
      lastActionTauntTime = now;
      resetIdleTimer();
    }

    const priority = getTauntPriority(event);

    if (tauntQueue.some(item => item.event === event)) {
      return;
    }

    if (priority === 1 && (tauntQueue.length >= 1 || isProcessingTauntQueue)) {
      return;
    }

    if (tauntQueue.length >= 3 && priority < 3) {
      return;
    }

    const currentStats = deps.stats();
    const item = TauntService.getTaunt(event, {
      undoCount: deps.getUndoCountInMatch ? deps.getUndoCountInMatch() : 0,
      botWins: currentStats.losses,
      playerWins: currentStats.wins,
    });

    const isSilenced = !deps.enableTaunts();
    const finalText = isSilenced ? TauntService.censorToGrawlix(item.text) : item.text;

    const queuedItem: QueuedTaunt = {
      text: finalText,
      mood: item.mood,
      priority,
      event,
    };

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
    const stage = deps.matchStage();

    if (stage === 'playing') {
      if (deps.currentTurn() !== deps.playerColor()) return;
      const idleThreshold = Math.floor(Math.random() * 5000) + 12000;
      idleThinkingTimer = window.setTimeout(() => {
        if (deps.matchStage() === 'playing' && deps.currentTurn() === deps.playerColor()) {
          triggerTaunt('IDLE_THINKING', 0);
        }
      }, idleThreshold);
      return;
    }

    if (stage === 'game_over') {
      const status = deps.gameStatus();
      const player = deps.playerColor();
      const isWin = (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
      const isLoss = (status === 'black_win' && player === WHITE) || (status === 'white_win' && player === BLACK);

      const idlePostGameThreshold = Math.floor(Math.random() * 4000) + 11000; // 11s - 15s
      idleThinkingTimer = window.setTimeout(() => {
        if (deps.matchStage() === 'game_over') {
          if (isWin) {
            triggerTaunt('IDLE_AFTER_WIN', 0);
          } else if (isLoss) {
            triggerTaunt('IDLE_AFTER_LOSS', 0);
          }
        }
      }, idlePostGameThreshold);
      return;
    }
  }

  onCleanup(() => {
    clearIdleTimer();
    clearTauntQueue();
  });

  return {
    tauntState,
    triggerTaunt,
    clearTauntQueue,
    resetIdleTimer,
    clearIdleTimer,
  };
}
