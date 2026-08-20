import {
  ActivePlayer,
  BoardMatrix,
  Move,
  BLACK,
  WHITE,
  TutorPreMoveAnalysis,
  TutorPostMoveFeedback,
  EMPTY,
} from './types';
import { AIEngine } from './aiEngine';
import { checkWin, getCandidateMoves } from './board';
import {
  isFive,
  isFourOrFive,
  isOpenFour,
  isOpenThree,
  isFourThreeFork,
  isDoubleThree,
  isOpeningCenterMove,
  countFriendlyNeighbors,
} from './threatUtils';
import {
  TutorPreMoveEvent,
  TutorPostMoveEvent,
  TutorBotMoveEvent,
  getTutorDialogue,
} from '../data/tutor';
import { formatCoord } from './constants';
export { formatCoord };

export class TutorEngine {
  private static aiEngine = new AIEngine();

  /**
   * Phân tích bàn cờ trước khi người chơi đặt quân (Pre-move analysis)
   */
  public static analyzePreMove(
    board: BoardMatrix,
    playerColor: ActivePlayer
  ): TutorPreMoveAnalysis {
    const oppPlayer: ActivePlayer = playerColor === BLACK ? WHITE : BLACK;
    const candidates = getCandidateMoves(board, 2);

    // Nếu bàn cờ trống rỗng (nước đầu tiên của Đen)
    if (candidates.length === 0) {
      const suggestedMove = { row: 7, col: 7 };
      const coordLabel = formatCoord(7, 7);
      const event: TutorPreMoveEvent = 'PRE_DEVELOPMENT_NEUTRAL';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return {
        suggestedMove,
        coordLabel,
        event,
        speech,
        isDirectCoord: false,
        threatLevel: 'neutral',
      };
    }

    // 1. Kiểm tra Sát cục 1 nước (Win in 1 / 5 quân thắng ngay) trước tiên (Instant O(1))
    const winInOne = candidates.find(m => isFive(board, m.row, m.col, playerColor));
    if (winInOne) {
      const suggestedMove = winInOne;
      const coordLabel = formatCoord(suggestedMove.row, suggestedMove.col);
      const isDirectCoord = Math.random() < 0.35;
      const event: TutorPreMoveEvent = isDirectCoord ? 'PRE_WIN_IN_ONE_DIRECT' : 'PRE_WIN_IN_ONE_TEASE';
      const threatLevel = 'winning';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
    }

    // 2. Kiểm tra Đối thủ sắp thắng 1 nước (Critical Opponent Threat - đối thủ sắp đủ 5 quân)
    const opponentWin = candidates.find(m => isFive(board, m.row, m.col, oppPlayer));
    if (opponentWin) {
      const suggestedMove = opponentWin;
      const coordLabel = formatCoord(suggestedMove.row, suggestedMove.col);
      const isDirectCoord = Math.random() < 0.40;
      const event: TutorPreMoveEvent = isDirectCoord ? 'PRE_CRITICAL_THREAT_DIRECT' : 'PRE_CRITICAL_THREAT_TEASE';
      const threatLevel = 'danger';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
    }

    // 3. Chạy AI Level 12 (Thần Cờ Bất Khả Chiến Bại) - Trí tuệ tối đa tìm nước cờ vàng hoàn hảo
    const aiResult = this.aiEngine.findBestMove(board, playerColor, 12);
    const suggestedMove = aiResult.move;
    const coordLabel = formatCoord(suggestedMove.row, suggestedMove.col);

    // 4. Nhận diện hình thái chiến thuật của nước đi
    let event: TutorPreMoveEvent = 'PRE_DEVELOPMENT_NEUTRAL';
    let threatLevel: 'winning' | 'danger' | 'warning' | 'neutral' = 'neutral';
    let isDirectCoord = false;

    // A. Kiểm tra Sát cục liên hoàn VCF (Tactical VCF)
    if (aiResult.stats.tacticalType === 'vcf') {
      isDirectCoord = Math.random() < 0.25;
      event = isDirectCoord ? 'PRE_VCF_TACTIC_DIRECT' : 'PRE_VCF_TACTIC_TEASE';
      threatLevel = 'winning';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
    }

    // B. Kiểm tra Đòn bẫy kép 4-3 hoặc 3-3 (Fork)
    const isFork = isFourThreeFork(board, suggestedMove.row, suggestedMove.col, playerColor);
    if (isFork) {
      isDirectCoord = Math.random() < 0.25;
      event = isDirectCoord ? 'PRE_FORK_TACTIC_DIRECT' : 'PRE_FORK_TACTIC_TEASE';
      threatLevel = 'warning';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
    }

    // C. Kiểm tra Đối thủ có nước 3 mở đang rình rập
    const opponentOpenThrees = candidates.filter(m => isOpenThree(board, m.row, m.col, oppPlayer));
    if (opponentOpenThrees.length > 0) {
      isDirectCoord = Math.random() < 0.30;
      event = isDirectCoord ? 'PRE_ENEMY_OPEN_THREE_DIRECT' : 'PRE_ENEMY_OPEN_THREE_TEASE';
      threatLevel = 'warning';
      const speech = getTutorDialogue(event, { coord: coordLabel });
      return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
    }

    // D. Phát triển thế trận trung cuộc
    event = 'PRE_DEVELOPMENT_NEUTRAL';
    threatLevel = 'neutral';
    isDirectCoord = false;
    const speech = getTutorDialogue(event, { coord: coordLabel });

    return { suggestedMove, coordLabel, event, speech, isDirectCoord, threatLevel };
  }

  /**
   * Đánh giá và chấm điểm nước cờ sau khi người chơi vừa hạ quân (Post-move evaluation)
   */
  public static evaluatePostMove(
    boardBeforeMove: BoardMatrix,
    playerMove: Move,
    playerColor: ActivePlayer,
    bestMove?: Move | null,
    preAnalysis?: TutorPreMoveAnalysis | null
  ): TutorPostMoveFeedback {
    const oppPlayer: ActivePlayer = playerColor === BLACK ? WHITE : BLACK;
    const playerCoordLabel = formatCoord(playerMove.row, playerMove.col);

    // Đảm bảo resolvedBest LUÔN LUÔN là một ô cờ TRỐNG (EMPTY) hợp lệ trên boardBeforeMove
    let resolvedBest = bestMove;
    if (
      !resolvedBest ||
      resolvedBest.row < 0 ||
      resolvedBest.row >= 15 ||
      resolvedBest.col < 0 ||
      resolvedBest.col >= 15 ||
      boardBeforeMove[resolvedBest.row][resolvedBest.col] !== EMPTY
    ) {
      const aiRes = this.aiEngine.findBestMove(boardBeforeMove, playerColor, 6);
      if (aiRes?.move && boardBeforeMove[aiRes.move.row]?.[aiRes.move.col] === EMPTY) {
        resolvedBest = aiRes.move;
      } else {
        const candidates = getCandidateMoves(boardBeforeMove, 2);
        resolvedBest = candidates.length > 0 ? candidates[0] : playerMove;
      }
    }

    const bestCoordLabel = formatCoord(resolvedBest.row, resolvedBest.col);

    // 0. Kiểm tra nếu nước đi tạo 5 quân dứt điểm thắng ván cờ
    boardBeforeMove[playerMove.row][playerMove.col] = playerColor;
    const winResult = checkWin(boardBeforeMove);
    boardBeforeMove[playerMove.row][playerMove.col] = EMPTY;

    if (winResult && winResult.winner === playerColor) {
      const event: TutorPostMoveEvent = 'POST_WINNING_MOVE';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'brilliant',
        tacticName: 'Sát Cục Ngũ Liên (Five in a Row)',
      };
    }

    const isMatchBest = (playerMove.row === resolvedBest.row && playerMove.col === resolvedBest.col);

    // 1. Đi đúng nước cờ vàng của Gia Sư
    if (isMatchBest) {
      const event: TutorPostMoveEvent = 'POST_BRILLIANT_MOVE';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'brilliant',
        tacticName: 'Nước Cờ Vàng (Brilliant Move)',
      };
    }

    // 2. Hóa giải nước 4 nguy kịch của đối thủ (Chặn đòn dứt điểm thành công)
    if (preAnalysis?.threatLevel === 'danger') {
      const isPlayerBlockingThreat = isFive(boardBeforeMove, playerMove.row, playerMove.col, oppPlayer);
      if (isPlayerBlockingThreat) {
        const event: TutorPostMoveEvent = 'POST_DEFUSED_CRITICAL_THREAT';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'brilliant',
          tacticName: 'Khóa Tử Huyệt (Critical Defense)',
        };
      } else {
        const event: TutorPostMoveEvent = 'POST_IGNORED_CRITICAL_THREAT';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'blunder',
          tacticName: 'Sơ Hở Chí Mạng (Blunder)',
        };
      }
    }

    // 3. Chặn đứng nước 3 mở nguy hiểm của đối thủ
    if (preAnalysis?.event === 'PRE_ENEMY_OPEN_THREE_TEASE' || preAnalysis?.event === 'PRE_ENEMY_OPEN_THREE_DIRECT') {
      const isPlayerBlockingThree = isOpenThree(boardBeforeMove, playerMove.row, playerMove.col, oppPlayer);
      if (isPlayerBlockingThree) {
        const event: TutorPostMoveEvent = 'POST_BLOCKED_OPEN_THREE';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'good',
          tacticName: 'Bịt Ngòi Nổ (Block Open Three)',
        };
      }
    }

    // 4. Bỏ lỡ cơ hội Thắng ngay 1 nước (5 quân liên tiếp)
    if (preAnalysis?.threatLevel === 'winning' && (preAnalysis.event === 'PRE_WIN_IN_ONE_TEASE' || preAnalysis.event === 'PRE_WIN_IN_ONE_DIRECT')) {
      const isPlayerWinning = isFive(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
      if (!isPlayerWinning) {
        const event: TutorPostMoveEvent = 'POST_MISSED_WIN_IN_ONE';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'missed_win',
          tacticName: 'Bỏ Lỡ Sát Cục (Missed Win in 1)',
        };
      }
    }

    // 5. Người chơi tự tạo đòn bẫy đôi 4-3 hoặc 3-3 đỉnh cao
    const isPlayerFourThree = isFourThreeFork(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
    const isPlayerThreeThree = isDoubleThree(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
    if (isPlayerFourThree || isPlayerThreeThree) {
      const event: TutorPostMoveEvent = 'POST_BRILLIANT_FORK';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'brilliant',
        tacticName: isPlayerFourThree ? 'Bẫy Tứ Tam (4-3 Fork)' : 'Bẫy Song Tam (3-3 Fork)',
      };
    }

    // 6. Người chơi tạo thế 4 mở (100% thắng ở nước tiếp theo)
    const isPlayerCreatingOpenFour = isOpenFour(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
    if (isPlayerCreatingOpenFour) {
      const event: TutorPostMoveEvent = 'POST_CREATE_OPEN_FOUR';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'brilliant',
        tacticName: 'Thế Tứ Liên (Open Four)',
      };
    }

    // 7. Người chơi tạo hàng 4 nguy hiểm (Ép đối thủ phải chống đỡ)
    const isPlayerCreatingFour = isFourOrFive(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
    if (isPlayerCreatingFour) {
      const event: TutorPostMoveEvent = 'POST_CREATE_FOUR';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'good',
        tacticName: 'Tấn Công Hàng 4 (Four Attack)',
      };
    }

    // 8. Người chơi tạo thế 3 mở thoáng đãng
    const isPlayerCreatingOpenThree = isOpenThree(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
    if (isPlayerCreatingOpenThree) {
      const event: TutorPostMoveEvent = 'POST_CREATE_OPEN_THREE';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'good',
        tacticName: 'Thế Tam Hở (Open Three)',
      };
    }

    // 8. Bỏ lỡ đòn bẫy 4-3 hoặc VCF
    if (preAnalysis?.event === 'PRE_FORK_TACTIC_TEASE' || preAnalysis?.event === 'PRE_FORK_TACTIC_DIRECT' || preAnalysis?.event === 'PRE_VCF_TACTIC_TEASE' || preAnalysis?.event === 'PRE_VCF_TACTIC_DIRECT') {
      const isPlayerMakingThreat = isFourOrFive(boardBeforeMove, playerMove.row, playerMove.col, playerColor) || isFourThreeFork(boardBeforeMove, playerMove.row, playerMove.col, playerColor);
      if (!isPlayerMakingThreat) {
        const event: TutorPostMoveEvent = 'POST_MISSED_FORK_OR_VCF';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'missed_fork',
          tacticName: 'Bỏ Lỡ Đòn Bẫy 4-3 / VCF',
        };
      }
    }

    // 9. Bỏ lọt nước 3 mở của đối thủ
    if (preAnalysis?.event === 'PRE_ENEMY_OPEN_THREE_TEASE' || preAnalysis?.event === 'PRE_ENEMY_OPEN_THREE_DIRECT') {
      const isPlayerBlockingThree = isOpenThree(boardBeforeMove, playerMove.row, playerMove.col, oppPlayer);
      if (!isPlayerBlockingThree) {
        const event: TutorPostMoveEvent = 'POST_IGNORED_OPEN_THREE';
        const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
        return {
          playerMove,
          playerCoordLabel,
          bestMove: resolvedBest,
          bestCoordLabel,
          event,
          speech,
          quality: 'blunder',
          tacticName: 'Bỏ Quên Tam Hở Địch',
        };
      }
    }

    // 10. Kiểm tra khoảng cách nước đi (Quá xa trung tâm)
    const distToCenter = Math.abs(playerMove.row - 7) + Math.abs(playerMove.col - 7);
    if (distToCenter >= 7) {
      const event: TutorPostMoveEvent = 'POST_PASSIVE_MOVE';
      const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
      return {
        playerMove,
        playerCoordLabel,
        bestMove: resolvedBest,
        bestCoordLabel,
        event,
        speech,
        quality: 'passive',
        tacticName: 'Lạc Nhịp Biên (Passive Move)',
      };
    }

    // 11. Nước đi khá / tốt (So sánh với nước cờ vàng của AI)
    const event: TutorPostMoveEvent = 'POST_GOOD_MOVE_COMPARISON';
    const speech = getTutorDialogue(event, { coord: playerCoordLabel, coordAI: bestCoordLabel });
    return {
      playerMove,
      playerCoordLabel,
      bestMove: resolvedBest,
      bestCoordLabel,
      event,
      speech,
      quality: 'good',
      tacticName: 'Chiếm Trung Tuyến (Center Control)',
    };
  }

  /**
   * Đánh giá và phân tích ý đồ nước đi của Bot đối thủ
   */
  public static evaluateBotMove(
    boardBeforeMove: BoardMatrix,
    botMove: Move,
    botColor: ActivePlayer
  ): import('./types').TutorBotEvaluation {
    const oppPlayer: ActivePlayer = botColor === BLACK ? WHITE : BLACK;
    const botCoordLabel = formatCoord(botMove.row, botMove.col);

    // 1. Kiểm tra nếu Bot vừa hoàn thành chuỗi 5 quân thắng trận
    if (isFive(boardBeforeMove, botMove.row, botMove.col, botColor)) {
      const event: TutorBotMoveEvent = 'BOT_WINNING_FIVE';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Sát Cục Ngũ Liên' };
    }

    // 2. Kiểm tra nếu Bot vừa chặn nước 5 thắng của Người chơi
    if (isFive(boardBeforeMove, botMove.row, botMove.col, oppPlayer)) {
      const event: TutorBotMoveEvent = 'BOT_BLOCK_WIN';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Khóa Đòn Dứt Điểm' };
    }

    // 3. Kiểm tra nếu Bot vừa tạo 4 mở (100% thắng ở nước tiếp theo)
    if (isOpenFour(boardBeforeMove, botMove.row, botMove.col, botColor)) {
      const event: TutorBotMoveEvent = 'BOT_CREATE_OPEN_FOUR';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Thế Tứ Liên (Open Four)' };
    }

    // 4. Kiểm tra nếu Bot vừa gài bẫy đôi 4-3 hoặc 3-3 (Fork)
    const isBotFourThree = isFourThreeFork(boardBeforeMove, botMove.row, botMove.col, botColor);
    const isBotThreeThree = isDoubleThree(boardBeforeMove, botMove.row, botMove.col, botColor);
    if (isBotFourThree || isBotThreeThree) {
      const event: TutorBotMoveEvent = 'BOT_FORK_ATTACK';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: isBotFourThree ? 'Bẫy Tứ Tam (4-3 Fork)' : 'Bẫy Song Tam (3-3 Fork)' };
    }

    // 5. Kiểm tra nếu Bot vừa tạo hàng 4 ép người chơi phải đỡ
    if (isFourOrFive(boardBeforeMove, botMove.row, botMove.col, botColor)) {
      const event: TutorBotMoveEvent = 'BOT_CREATE_FOUR_PRESSURE';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Kỹ Thuật Ép Nước VCF' };
    }

    // 6. Kiểm tra nếu Bot vừa tạo hàng 3 mở
    if (isOpenThree(boardBeforeMove, botMove.row, botMove.col, botColor)) {
      const event: TutorBotMoveEvent = 'BOT_CREATE_OPEN_THREE';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Khai Mào Thế Tam Hở' };
    }

    // 7. Kiểm tra nếu Bot vừa chặn hàng 3 mở của Người chơi
    if (isOpenThree(boardBeforeMove, botMove.row, botMove.col, oppPlayer)) {
      const event: TutorBotMoveEvent = 'BOT_BLOCK_PLAYER_THREE';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Bịt Mũi Giáp Công' };
    }

    // 8. Kiểm tra giai đoạn khai cuộc kiểm soát trung tâm
    if (isOpeningCenterMove(boardBeforeMove, botMove.row, botMove.col)) {
      const event: TutorBotMoveEvent = 'BOT_OPENING_CONTROL';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Chiếm Tâm Khai Cuộc' };
    }

    // 9. Kiểm tra xem nước đi có mở rộng liên kết mạng lưới với các quân đồng minh không
    if (countFriendlyNeighbors(boardBeforeMove, botMove.row, botMove.col, botColor, 2) >= 2) {
      const event: TutorBotMoveEvent = 'BOT_EXPAND_CONNECTION';
      const speech = getTutorDialogue(event, { coord: botCoordLabel });
      return { botMove, botCoordLabel, speech, tacticName: 'Đan Lưới Quân' };
    }

    // 10. Mặc định: Bố trí thế trận linh hoạt
    const event: TutorBotMoveEvent = 'BOT_POSITIONAL_DEVELOPMENT';
    const speech = getTutorDialogue(event, { coord: botCoordLabel });
    return { botMove, botCoordLabel, speech, tacticName: 'Bố Trí Thế Trận' };
  }
}
