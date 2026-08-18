import { AIEngine } from '../game/aiEngine';
import { WorkerMessageIn, WorkerMessageOut } from '../game/types';

const aiEngine = new AIEngine();

self.onmessage = (e: MessageEvent<WorkerMessageIn>) => {
  const data = e.data;

  if (data.type === 'CANCEL') {
    aiEngine.cancel();
    return;
  }

  if (data.type === 'CALCULATE_MOVE') {
    const { board, aiPlayer, levelId } = data;
    const result = aiEngine.findBestMove(
      board,
      aiPlayer,
      levelId,
      (depth, nodes, currentBest, score) => {
        const progressMsg: WorkerMessageOut = {
          type: 'PROGRESS',
          depth,
          nodes,
          currentBest,
          score,
        };
        self.postMessage(progressMsg);
      }
    );

    const responseMsg: WorkerMessageOut = {
      type: 'MOVE_RESULT',
      move: result.move,
      stats: result.stats,
    };
    self.postMessage(responseMsg);
    return;
  }
};
