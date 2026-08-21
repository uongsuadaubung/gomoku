import { createSignal, onMount, onCleanup } from 'solid-js';
import {
  ActivePlayer,
  BoardMatrix,
  Move,
  AIStats,
  WorkerMessageIn,
  WorkerMessageOut,
} from '../../game/types';
import { SCORES } from '../../game/constants';

export interface AiSliceDeps {
  onMoveCalculated: (move: Move) => void;
  onHighAdvantageDetected?: () => void;
}

export function createAiSlice(deps: AiSliceDeps) {
  const [isAiThinking, setIsAiThinking] = createSignal<boolean>(false);
  const [aiStats, setAiStats] = createSignal<AIStats | null>(null);
  const [aiThinkingProgress, setAiThinkingProgress] = createSignal<{ depth: number; nodes: number }>({
    depth: 0,
    nodes: 0,
  });

  let worker: Worker | null = null;

  onMount(() => {
    try {
      worker = new Worker(new URL('../../workers/ai.worker.ts', import.meta.url), {
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
            deps.onHighAdvantageDetected?.();
          }
          return;
        }

        if (data.type === 'MOVE_RESULT') {
          setIsAiThinking(false);
          setAiStats(data.stats);
          if (data.stats.winProbability >= 80 || (data.stats.bestScore || 0) >= SCORES.OPEN_FOUR) {
            deps.onHighAdvantageDetected?.();
          }
          deps.onMoveCalculated(data.move);
          return;
        }
      };
    } catch (err) {
      console.error('Không thể khởi tạo Web Worker AI:', err);
    }
  });

  onCleanup(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  function requestAiMove(
    currentBoard: BoardMatrix,
    aiPlayer: ActivePlayer,
    levelId: number,
    turnCount: number
  ) {
    if (!worker) return;
    setIsAiThinking(true);
    const msg: WorkerMessageIn = {
      type: 'CALCULATE_MOVE',
      board: currentBoard,
      aiPlayer,
      levelId,
      turnCount,
    };
    worker.postMessage(msg);
  }

  function cancelAiThinking() {
    if (worker && isAiThinking()) {
      worker.postMessage({ type: 'CANCEL' });
      setIsAiThinking(false);
    }
  }

  function resetAiThinkingState() {
    cancelAiThinking();
    setAiStats(null);
    setAiThinkingProgress({ depth: 0, nodes: 0 });
    setIsAiThinking(false);
  }

  return {
    isAiThinking,
    aiStats,
    aiThinkingProgress,
    setIsAiThinking,
    setAiStats,
    setAiThinkingProgress,
    requestAiMove,
    cancelAiThinking,
    resetAiThinkingState,
  };
}
