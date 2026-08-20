import { createSignal, onCleanup } from 'solid-js';
import { MatchStage, UserStats } from '../../game/types';
import { StorageService } from '../../services/storageService';

interface BlitzSliceDeps {
  stats: () => UserStats;
  setStats: (stats: UserStats) => void;
  matchStage: () => MatchStage;
  onTimeoutLoss: () => void;
}

export function createBlitzSlice(deps: BlitzSliceDeps) {
  const initialTimeLimit = (): 5 | 10 | 15 => {
    const s = StorageService.getStats();
    return s.blitz?.selectedTimeSeconds || 10;
  };

  const [blitzTimeLimit, setBlitzTimeLimit] = createSignal<5 | 10 | 15>(initialTimeLimit());
  const [blitzRemainingTime, setBlitzRemainingTime] = createSignal<number>(blitzTimeLimit());
  const [isBlitzTimeout, setIsBlitzTimeout] = createSignal<boolean>(false);

  let blitzTimerInterval: number | null = null;

  function startBlitzTimer() {
    stopBlitzTimer();
    const limit = blitzTimeLimit();
    setBlitzRemainingTime(limit);
    const startTime = Date.now();
    const totalDuration = limit * 1000;

    blitzTimerInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (totalDuration - elapsed) / 1000);
      setBlitzRemainingTime(Number(remaining.toFixed(1)));

      if (remaining <= 0) {
        stopBlitzTimer();
        setIsBlitzTimeout(true);
        deps.onTimeoutLoss();
      }
    }, 50);
  }

  function stopBlitzTimer() {
    if (blitzTimerInterval) {
      clearInterval(blitzTimerInterval);
      blitzTimerInterval = null;
    }
  }

  function setupBlitzLevel(timeSeconds?: 5 | 10 | 15, startLevel?: number) {
    stopBlitzTimer();
    const chosenTime = timeSeconds || blitzTimeLimit();
    setBlitzTimeLimit(chosenTime);
    setIsBlitzTimeout(false);

    if (startLevel !== undefined) {
      const currentStats = deps.stats();
      if (!currentStats.blitz) {
        currentStats.blitz = {
          currentLevel: startLevel,
          highestLevel: 1,
          totalWins: 0,
          totalLosses: 0,
          timeoutLosses: 0,
          bestStreak: 0,
          currentStreak: 0,
          totalGames: 0,
          selectedTimeSeconds: chosenTime,
        };
      } else {
        currentStats.blitz.currentLevel = startLevel;
        currentStats.blitz.selectedTimeSeconds = chosenTime;
      }
      StorageService.saveStats(currentStats);
      deps.setStats({ ...currentStats });
    }
  }

  onCleanup(() => {
    stopBlitzTimer();
  });

  return {
    blitzTimeLimit,
    blitzRemainingTime,
    isBlitzTimeout,
    setBlitzTimeLimit,
    setBlitzRemainingTime,
    setIsBlitzTimeout,
    startBlitzTimer,
    stopBlitzTimer,
    setupBlitzLevel,
  };
}
