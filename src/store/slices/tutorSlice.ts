import { createSignal, onMount, onCleanup, Accessor } from 'solid-js';
import {
  ActivePlayer,
  BoardMatrix,
  Move,
  UserStats,
  TutorPreMoveAnalysis,
  TutorPostMoveFeedback,
  TutorBotEvaluation,
  TutorMatchReview,
  MatchEndingResult,
  TutorMood,
  MatchReviewGrade,
} from '../../game/types';
import { TutorEngine, formatCoord } from '../../game/tutorEngine';
import { getCandidateMoves } from '../../game/board';
import {
  TutorGeneralEvent,
  TutorDialogueContext,
  TutorPreMoveEvent,
  getTutorDialogue,
} from '../../data/tutor';
import { TutorWorkerMessageOut } from '../../workers/tutor.worker';

export interface TutorSliceProps {
  stats: Accessor<UserStats>;
  setStats: (updater: (prev: UserStats) => UserStats) => void;
}

export function createTutorSlice(props: TutorSliceProps) {
  const [tutorAnalysis, setTutorAnalysis] = createSignal<TutorPreMoveAnalysis | null>(null);
  const [tutorFeedback, setTutorFeedback] = createSignal<TutorPostMoveFeedback | null>(null);
  const [tutorBotEvaluation, setTutorBotEvaluation] = createSignal<TutorBotEvaluation | null>(null);
  const [tutorSpeech, setTutorSpeech] = createSignal<string>('Gia sư Gomo sẵn sàng đồng hành cùng bạn!');
  const [tutorMood, setTutorMood] = createSignal<TutorMood>('calm');
  const [selectedOpponentLevel, setSelectedOpponentLevel] = createSignal<number>(
    props.stats().tutor?.currentLevel || 1
  );
  const [matchEvaluations, setMatchEvaluations] = createSignal<TutorPostMoveFeedback[]>([]);
  const [tutorMatchReview, setTutorMatchReview] = createSignal<TutorMatchReview | null>(null);

  let tutorWorker: Worker | null = null;
  let currentRequestId = 0;

  onMount(() => {
    try {
      tutorWorker = new Worker(new URL('../../workers/tutor.worker.ts', import.meta.url), {
        type: 'module',
      });

      tutorWorker.onmessage = (e: MessageEvent<TutorWorkerMessageOut>) => {
        const data = e.data;
        if (data.type === 'TUTOR_ANALYSIS_RESULT' && data.requestId === currentRequestId) {
          const analysis = data.analysis;
          setTutorAnalysis(analysis);
          setTutorSpeech(analysis.speech);

          if (analysis.threatLevel === 'danger') {
            setTutorMood('danger');
          } else if (analysis.threatLevel === 'winning') {
            setTutorMood('excited');
          } else {
            setTutorMood('calm');
          }
        }
      };
    } catch (e) {
      console.error('Không thể khởi tạo Tutor Worker:', e);
    }
  });

  onCleanup(() => {
    if (tutorWorker) {
      tutorWorker.terminate();
      tutorWorker = null;
    }
  });

  /**
   * Cập nhật cấp độ đối thủ được chọn
   */
  function setOpponentLevel(lvl: number) {
    const clamped = Math.max(1, Math.min(12, lvl));
    if (selectedOpponentLevel() !== clamped) {
      setSelectedOpponentLevel(clamped);
      resetTutorMatchSession();
    }
  }

  /**
   * Phân tích thế trận trước khi người chơi đặt quân (Chạy trong Web Worker ngầm với AI Level 12)
   */
  function analyzePreMove(board: BoardMatrix, playerColor: ActivePlayer) {
    currentRequestId++;
    const reqId = currentRequestId;

    // 1. Nếu bàn cờ trống rỗng (nước đầu tiên): Trả về ngay lập tức
    const candidates = getCandidateMoves(board, 2);
    if (candidates.length === 0) {
      const suggestedMove = { row: 7, col: 7 };
      const coordLabel = formatCoord(7, 7);
      const event: TutorPreMoveEvent = 'PRE_DEVELOPMENT_NEUTRAL';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      const fastAnalysis: TutorPreMoveAnalysis = {
        suggestedMove,
        coordLabel,
        event,
        speech,
        isDirectCoord: false,
        threatLevel: 'neutral',
      };
      setTutorAnalysis(fastAnalysis);
      setTutorSpeech(fastAnalysis.speech);
      setTutorMood('calm');
      return fastAnalysis;
    }

    // 2. Gửi sang Tutor Web Worker để tính toán sâu ở Level 12 mà không chặn luồng UI
    if (tutorWorker) {
      setTutorMood('thinking');
      tutorWorker.postMessage({
        type: 'ANALYZE_PRE_MOVE',
        board,
        playerColor,
        requestId: reqId,
      });
      return null;
    }

    // 3. Fallback đồng bộ nếu Worker gặp lỗi
    try {
      const analysis = TutorEngine.analyzePreMove(board, playerColor);
      setTutorAnalysis(analysis);
      setTutorSpeech(analysis.speech);

      if (analysis.threatLevel === 'danger') {
        setTutorMood('danger');
      } else if (analysis.threatLevel === 'winning') {
        setTutorMood('excited');
      } else {
        setTutorMood('calm');
      }
      return analysis;
    } catch (e) {
      console.error('Lỗi phân tích Gia sư:', e);
      return null;
    }
  }

  /**
   * Đánh giá và chấm điểm nước cờ ngay sau khi người chơi hạ quân
   */
  function evaluatePostMove(
    boardBeforeMove: BoardMatrix,
    playerMove: Move,
    playerColor: ActivePlayer
  ): TutorPostMoveFeedback | null {
    const pre = tutorAnalysis();
    setTutorAnalysis(null); // Xóa ngay kết quả phân tích cũ để không bị rò rỉ sang nước kế tiếp

    try {
      const feedback = TutorEngine.evaluatePostMove(
        boardBeforeMove,
        playerMove,
        playerColor,
        pre?.suggestedMove,
        pre
      );
      setTutorFeedback(feedback);
      setTutorSpeech(feedback.speech);
      setMatchEvaluations(prev => [...prev, feedback]);

      if (feedback.quality === 'brilliant') {
        setTutorMood('proud');
      } else if (feedback.quality === 'blunder') {
        setTutorMood('danger');
      } else {
        setTutorMood('calm');
      }

      return feedback;
    } catch (e) {
      console.error('Lỗi chấm điểm Gia sư:', e);
      return null;
    }
  }

  /**
   * Rút lại đánh giá nước đi gần nhất khi người chơi Undo
   */
  function popLastEvaluation() {
    setMatchEvaluations(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }

  /**
   * Tổng kết báo cáo ván đấu sau khi trận đấu kết thúc (Debriefing Report)
   */
  function finalizeMatchReview(
    result: MatchEndingResult,
    opponentName: string,
    opponentLevel: number
  ): TutorMatchReview {
    const evals = matchEvaluations();
    const totalPlayerMoves = evals.length;

    let brilliantMoves = 0;
    let goodMoves = 0;
    let blunders = 0;
    let missedWins = 0;
    let passiveMoves = 0;

    for (const fb of evals) {
      if (fb.quality === 'brilliant') brilliantMoves++;
      else if (fb.quality === 'good') goodMoves++;
      else if (fb.quality === 'blunder') blunders++;
      else if (fb.quality === 'missed_win' || fb.quality === 'missed_fork') missedWins++;
      else if (fb.quality === 'passive') passiveMoves++;
    }

    const accuracy =
      totalPlayerMoves > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((brilliantMoves * 100 +
                  goodMoves * 88 +
                  passiveMoves * 65 +
                  missedWins * 25) /
                  (totalPlayerMoves * 100)) *
                  100
              )
            )
          )
        : 100;

    let grade: MatchReviewGrade = 'B';
    let gradeTitle = 'Kỳ Thủ Vững Vàng';
    let gradeBadgeClass = 'text-sky-300 bg-sky-500/20 border-sky-500/40 shadow-sky-500/20';

    if (accuracy >= 92) {
      grade = 'S';
      gradeTitle = 'Đại Kiện Tướng • Tuyệt Mỹ';
      gradeBadgeClass = 'text-amber-300 bg-amber-500/25 border-amber-400/60 shadow-amber-500/20';
    } else if (accuracy >= 80) {
      grade = 'A';
      gradeTitle = 'Cao Thủ • Sắc Bén';
      gradeBadgeClass = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20';
    } else if (accuracy >= 65) {
      grade = 'B';
      gradeTitle = 'Kỳ Thủ Vững Vàng';
      gradeBadgeClass = 'text-sky-300 bg-sky-500/20 border-sky-500/40 shadow-sky-500/20';
    } else if (accuracy >= 50) {
      grade = 'C';
      gradeTitle = 'Cần Cải Thiện Quan Sát';
      gradeBadgeClass = 'text-amber-300 bg-amber-500/20 border-amber-500/40';
    } else {
      grade = 'D';
      gradeTitle = 'Học Việc • Cần Rèn Luyện';
      gradeBadgeClass = 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    }

    let summaryAdvice = '';
    if (result === 'win') {
      if (blunders === 0 && accuracy >= 88) {
        summaryAdvice = `Tuyệt đỉnh! Bạn đã thi triển thế cờ không một tì vết trước Bot ${opponentName}. Mọi đòn tấn công và phong tỏa đều chuẩn mực theo sách giáo khoa!`;
      } else if (blunders > 0) {
        summaryAdvice = `Chúc mừng bạn đã giành chiến thắng! Dù vậy, ván đấu có ${blunders} nước sơ hở mà đối thủ chưa kịp khai thác. Hãy chú ý bịt ngòi nổ trước khi mải mê công phá nhé!`;
      } else {
        summaryAdvice = `Một chiến thắng rất thuyết phục! Bạn đã phát huy rất tốt các đòn kết hợp tạo thế 3 mở và ép nước thành công.`;
      }
    } else if (result === 'resign') {
      summaryAdvice = `Biết dừng lại đúng lúc cũng là một phẩm chất của kỳ thủ lớn. Hãy phân tích lại các nước cờ then chốt và thử lại ngay nhé!`;
    } else if (result === 'draw') {
      summaryAdvice = `Một thế cờ giằng co cân não! Cả hai bên đều thủ kín kẽ. Trong ván tới, hãy thử chủ động phát động đòn bẫy 4-3 từ sớm để phá vỡ thế bế tắc.`;
    } else {
      // Loss
      if (blunders > 0) {
        summaryAdvice = `Bạn đã có giai đoạn khai cuộc rất tốt, tuy nhiên ở trung cuộc đã để lộ ${blunders} sơ hở chí mạng. Đối thủ Cấp ${opponentLevel} tận dụng cơ hội rất nhanh. Hãy chú ý chặn hàng 3 và 4 của địch!`;
      } else if (missedWins > 0) {
        summaryAdvice = `Rất đáng tiếc! Bạn đã tạo dựng được thế trận vượt trội nhưng lại bỏ lỡ cơ hội kết liễu đòn 4-3/VCF. Hãy rèn luyện thêm nhãn quan dứt điểm nhé!`;
      } else {
        summaryAdvice = `Đối thủ ${opponentName} đã khai thác tốt các khoảng trống ở biên. Lần sau hãy chủ động gom quân liên kết chặt chẽ hơn ở khu trung tâm.`;
      }
    }

    const review: TutorMatchReview = {
      totalPlayerMoves,
      brilliantMoves,
      goodMoves,
      blunders,
      missedWins,
      passiveMoves,
      accuracy,
      grade,
      gradeTitle,
      gradeBadgeClass,
      summaryAdvice,
    };

    setTutorMatchReview(review);
    return review;
  }

  /**
   * Đánh giá và phân tích ý đồ nước đi của Bot đối thủ
   */
  function evaluateBotMove(
    boardBeforeMove: BoardMatrix,
    botMove: Move,
    botColor: ActivePlayer
  ): TutorBotEvaluation | null {
    try {
      const evaluation = TutorEngine.evaluateBotMove(boardBeforeMove, botMove, botColor);
      setTutorBotEvaluation(evaluation);
      return evaluation;
    } catch (e) {
      console.error('Lỗi phân tích nước đi của Bot:', e);
      return null;
    }
  }

  /**
   * Phát câu thoại sự kiện tổng kết hoặc tương tác đặc biệt
   */
  function triggerTutorSpeech(event: TutorGeneralEvent, context?: TutorDialogueContext) {
    const speech = getTutorDialogue(event, context);
    setTutorSpeech(speech);
    if (event === 'GAME_OVER_PLAYER_WIN') {
      setTutorMood('proud');
    } else if (event === 'GAME_OVER_PLAYER_LOSS') {
      setTutorMood('calm');
    }
  }

  function clearTutorState() {
    setTutorAnalysis(null);
    setTutorFeedback(null);
    setTutorBotEvaluation(null);
  }

  function resetTutorMatchSession() {
    clearTutorState();
    setMatchEvaluations([]);
    setTutorMatchReview(null);
    setTutorSpeech('');
    setTutorMood('calm');
  }

  return {
    tutorAnalysis,
    tutorFeedback,
    tutorBotEvaluation,
    tutorSpeech,
    tutorMood,
    selectedOpponentLevel,
    setOpponentLevel,
    analyzePreMove,
    evaluatePostMove,
    popLastEvaluation,
    finalizeMatchReview,
    tutorMatchReview,
    evaluateBotMove,
    triggerTutorSpeech,
    clearTutorState,
    resetTutorMatchSession,
  };
}

export type TutorSlice = ReturnType<typeof createTutorSlice>;

