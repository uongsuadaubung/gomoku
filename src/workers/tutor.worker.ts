import { TutorEngine } from '../game/tutorEngine';
import { BoardMatrix, ActivePlayer, TutorPreMoveAnalysis } from '../game/types';

export type TutorWorkerMessageIn =
  | { type: 'CANCEL' }
  | { type: 'ANALYZE_PRE_MOVE'; board: BoardMatrix; playerColor: ActivePlayer; requestId: number };

export type TutorWorkerMessageOut =
  | { type: 'TUTOR_ANALYSIS_RESULT'; analysis: TutorPreMoveAnalysis; requestId: number };

self.onmessage = (e: MessageEvent<TutorWorkerMessageIn>) => {
  const data = e.data;

  if (data.type === 'ANALYZE_PRE_MOVE') {
    const analysis = TutorEngine.analyzePreMove(data.board, data.playerColor);
    const response: TutorWorkerMessageOut = {
      type: 'TUTOR_ANALYSIS_RESULT',
      analysis,
      requestId: data.requestId,
    };
    self.postMessage(response);
  }
};
