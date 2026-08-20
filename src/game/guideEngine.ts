import {
  BOARD_SIZE,
  EMPTY,
  BLACK,
  WHITE,
  type ActivePlayer,
  type BoardMatrix,
  type Move,
} from './types';
import { formatCoord } from './constants';
import { getCandidateMoves } from './board';
import {
  isFive,
  isOpenFour,
  isOpenThree,
  isFourThreeFork,
  isDoubleThree,
  isFourOrFive,
} from './threatUtils';
import { solveVCF } from './vcf';
import { solveVCT } from './vct';
import { evaluatePositionScore } from './evaluator';
import { AIEngine } from './aiEngine';
import type { HeatmapCell, WhatIfStep } from '../data/guide/types';

export class GuideEngine {
  private static ai = new AIEngine();

  /**
   * Tính toán toàn bộ Heatmap điểm số và phân loại chất lượng nước đi trên bàn cờ
   */
  public static calculateHeatmap(board: BoardMatrix, player: ActivePlayer): HeatmapCell[] {
    const opp: ActivePlayer = player === BLACK ? WHITE : BLACK;
    const candidates = getCandidateMoves(board, 2);

    // Nếu bàn cờ rỗng hoàn toàn -> Ô (7,7) là nước duy nhất hoàn hảo
    if (candidates.length === 0) {
      return [
        {
          row: 7,
          col: 7,
          score: 100000,
          quality: 'best',
          tacticName: 'Khai Mở Tâm Cờ H8',
          threatDescription: 'Ô cờ tối thượng với 8 hướng bành trướng quyền năng.',
        },
      ];
    }

    // 1. Quét Sát cục thắng 1 nước (Five in 1)
    const winInOne = candidates.find(m => isFive(board, m.row, m.col, player));
    // 2. Quét Đối thủ sắp thắng 1 nước (Critical Block)
    const oppWinInOne = candidates.find(m => isFive(board, m.row, m.col, opp));

    // 3. Quét VCF
    const vcfResult = solveVCF(board, player, 10);
    // 4. Quét VCT
    const vctResult = solveVCT(board, player, 6);

    // Đánh giá điểm từng ô ứng viên
    const scoredCandidates: Array<{
      move: Move;
      score: number;
      quality: HeatmapCell['quality'];
      tacticName?: string;
      threatDescription?: string;
    }> = [];

    for (const c of candidates) {
      const { row, col } = c;

      // A. Thắng 5 quân ngay lập tức
      if (isFive(board, row, col, player)) {
        scoredCandidates.push({
          move: c,
          score: 1000000,
          quality: 'win',
          tacticName: 'Thắng Ngay (5 Quân)',
          threatDescription: 'Hoàn thành chuỗi 5 quân kết liễu trận đấu.',
        });
        continue;
      }

      // B. Bắt buộc chặn 5 của đối thủ
      if (oppWinInOne && row === oppWinInOne.row && col === oppWinInOne.col) {
        scoredCandidates.push({
          move: c,
          score: 900000,
          quality: 'best',
          tacticName: 'Cứu Thua Khẩn Cấp',
          threatDescription: 'Bịt tử huyệt ngăn đối thủ đạt 5 quân liên tiếp.',
        });
        continue;
      }

      // C. Nước 4 Mở (Live 4)
      if (isOpenFour(board, row, col, player)) {
        scoredCandidates.push({
          move: c,
          score: 800000,
          quality: 'best',
          tacticName: 'Nước 4 Mở Tuyệt Đối',
          threatDescription: 'Tạo 4 quân thông 2 đầu, chắc chắn thắng ở nước sau.',
        });
        continue;
      }

      // D. Nước VCF
      if (vcfResult && vcfResult.row === row && vcfResult.col === col) {
        scoredCandidates.push({
          move: c,
          score: 700000,
          quality: 'vcf',
          tacticName: 'Sát Cục VCF Liên Hoàn',
          threatDescription: 'Khởi động chuỗi nước 4 ép đối thủ đỡ đến chết.',
        });
        continue;
      }

      // E. Đòn Bẫy Kép 4-3
      if (isFourThreeFork(board, row, col, player)) {
        scoredCandidates.push({
          move: c,
          score: 600000,
          quality: 'best',
          tacticName: 'Đòn Bẫy Kép 4-3',
          threatDescription: 'Tạo đồng thời 1 nước 4 và 1 nước 3 mở không thể đỡ.',
        });
        continue;
      }

      // F. Nước VCT
      if (vctResult && vctResult.row === row && vctResult.col === col) {
        scoredCandidates.push({
          move: c,
          score: 500000,
          quality: 'vct',
          tacticName: 'Đòn Ép VCT Đỉnh Cao',
          threatDescription: 'Khởi tạo chuỗi đe dọa liên hoàn chuyển hóa thành 4-3.',
        });
        continue;
      }

      // G. Đòn Kép 3-3
      if (isDoubleThree(board, row, col, player)) {
        scoredCandidates.push({
          move: c,
          score: 400000,
          quality: 'best',
          tacticName: 'Đòn Kép 3-3 Song Sát',
          threatDescription: 'Mở ra 2 hướng 3 mở cùng lúc khiến đối phương quá tải.',
        });
        continue;
      }

      // H. Chặn đòn 4 hoặc đòn 3-3/4-3 của đối thủ
      if (isOpenFour(board, row, col, opp) || isFourThreeFork(board, row, col, opp)) {
        scoredCandidates.push({
          move: c,
          score: 350000,
          quality: 'good',
          tacticName: 'Phá Bẫy Đối Thủ',
          threatDescription: 'Chiếm tử huyệt phá vỡ đòn bẫy kép của đối phương.',
        });
        continue;
      }

      // I. Nước 3 Mở
      if (isOpenThree(board, row, col, player)) {
        scoredCandidates.push({
          move: c,
          score: 250000,
          quality: 'good',
          tacticName: 'Kiến Tạo 3 Mở',
          threatDescription: 'Tạo nước 3 mở đe dọa biến thành 4 mở ở lượt kế.',
        });
        continue;
      }

      // Đánh giá điểm vị trí thông thường (Tấn công + Phòng thủ)
      const atkScore = evaluatePositionScore(board, row, col, player, 1.0, 1.0);
      const defScore = evaluatePositionScore(board, row, col, opp, 1.0, 1.0);
      const totalScore = Math.floor(atkScore * 1.1 + defScore * 0.9);

      scoredCandidates.push({
        move: c,
        score: totalScore,
        quality: 'passive',
        tacticName: 'Phát Triển Thế Cờ',
        threatDescription: 'Gia tăng sự liên kết và kiểm soát không gian.',
      });
    }

    // Sắp xếp điểm giảm dần
    scoredCandidates.sort((a, b) => b.score - a.score);
    const maxScore = scoredCandidates[0]?.score || 1;

    // Chuẩn hóa phân loại chất lượng nước đi
    return scoredCandidates.map((item, idx) => {
      let quality = item.quality;

      // Nước điểm cao nhất nếu chưa có tag đặc biệt thì là 'best'
      if (idx === 0 && quality === 'passive') {
        quality = 'best';
      } else if (item.score >= maxScore * 0.65 && quality === 'passive') {
        quality = 'good';
      } else if (item.score < maxScore * 0.25) {
        // Nước đi quá kém hoặc bỏ lỡ thế cờ sát cục
        if (winInOne || oppWinInOne) {
          quality = 'blunder';
        } else {
          quality = 'passive';
        }
      }

      return {
        row: item.move.row,
        col: item.move.col,
        score: item.score,
        quality,
        tacticName: item.tacticName,
        threatDescription: item.threatDescription,
      };
    });
  }

  /**
   * Cung cấp lời giải thích chiến thuật chi tiết và sâu sắc cho một ô cờ cụ thể
   */
  public static getDetailedExplanation(
    board: BoardMatrix,
    move: Move,
    player: ActivePlayer
  ): {
    coordLabel: string;
    quality: HeatmapCell['quality'];
    tacticName: string;
    explanation: string;
    pros: string[];
    cons: string[];
    opponentCounterMove?: Move;
    opponentCounterReason?: string;
  } {
    const coordLabel = formatCoord(move.row, move.col);
    const opp: ActivePlayer = player === BLACK ? WHITE : BLACK;

    // 1. Thắng 5 quân ngay lập tức
    if (isFive(board, move.row, move.col, player)) {
      return {
        coordLabel,
        quality: 'win',
        tacticName: 'Thắng Ngay (5 Quân Liên Tiếp)',
        explanation: `Nước cờ tại ${coordLabel} tạo thành Ngũ liên (5 quân liên tiếp). Ván đấu kết thúc với chiến thắng thuộc về bạn!`,
        pros: ['Chiến thắng ngay lập tức 100%', 'Không cần tính toán thêm'],
        cons: [],
      };
    }

    // 2. Nước 4 Mở
    if (isOpenFour(board, move.row, move.col, player)) {
      return {
        coordLabel,
        quality: 'best',
        tacticName: 'Nước 4 Mở Tuyệt Đối (.XXXX.)',
        explanation: `Nước cờ tại ${coordLabel} hình thành 4 quân liên tiếp thông thoáng cả 2 đầu. Đối phương chỉ có thể chặn 1 đầu, đầu còn lại bạn sẽ điền đủ 5 quân ở lượt sau!`,
        pros: ['Chiến thắng tất yếu ở nước sau', 'Đối phương không có phương án hóa giải'],
        cons: [],
      };
    }

    // 3. Đòn Bẫy Kép 4-3
    if (isFourThreeFork(board, move.row, move.col, player)) {
      return {
        coordLabel,
        quality: 'best',
        tacticName: 'Đòn Bẫy Kép 4-3 (Four-Three Fork)',
        explanation: `Đòn đánh sát thương cao nhất Gomoku! Nước cờ tại ${coordLabel} tạo ra đồng thời 1 Nước 4 (bắt đối thủ phải đỡ) và 1 Nước 3 Mở (sẽ hóa 4 mở ở lượt tiếp). Đối phương rơi vào thế cờ tuyệt lộ.`,
        pros: ['Ép nhịp tuyệt đối (Tempo)', 'Chiến thắng không thể ngăn cản'],
        cons: [],
      };
    }

    // 4. Cứu thua chặn 5 quân của đối thủ
    if (isFive(board, move.row, move.col, opp)) {
      return {
        coordLabel,
        quality: 'best',
        tacticName: 'Nước Chặn Tử Huyệt',
        explanation: `Bắt buộc phải đánh vào ${coordLabel} vì đối thủ đang có 4 quân chuẩn bị hoàn thành 5 quân chiến thắng!`,
        pros: ['Cứu vãn ván cờ cận kề thất bại', 'Duy trì cơ hội chiến đấu'],
        cons: ['Mang tính chất phòng ngự bị động'],
      };
    }

    // 5. Đòn Kép 3-3
    if (isDoubleThree(board, move.row, move.col, player)) {
      return {
        coordLabel,
        quality: 'best',
        tacticName: 'Đòn Kép 3-3 (Double Three)',
        explanation: `Nước cờ tại ${coordLabel} mở ra 2 hướng 3 mở song song. Đối phương chỉ được đi 1 quân mỗi lượt nên chỉ chặn được 1 cánh, cánh còn lại sẽ phát triển thành 4 mở.`,
        pros: ['Quá tải khả năng phòng thủ của đối thủ', 'Tạo ưu thế áp đảo'],
        cons: ['Lưu ý: Bị cấm với quân Đen trong luật Renju quốc tế'],
      };
    }

    // 6. Nước 3 Mở
    if (isOpenThree(board, move.row, move.col, player)) {
      return {
        coordLabel,
        quality: 'good',
        tacticName: 'Kiến Tạo Nước 3 Mở (.XXX.)',
        explanation: `Nước cờ tại ${coordLabel} tạo thành 3 quân thông thoáng 2 đầu, gây áp lực trực tiếp bắt buộc đối phương phải tìm cách ngăn chặn ở lượt sau.`,
        pros: ['Nắm quyền chủ động (Tiên cơ)', 'Đe dọa biến thành 4 mở'],
        cons: ['Cần đề phòng đối thủ chặn kèm phản công'],
      };
    }

    // Nước thông thường
    const candidates = getCandidateMoves(board, 2);
    const oppWin = candidates.find(m => isFive(board, m.row, m.col, opp));
    if (oppWin) {
      return {
        coordLabel,
        quality: 'blunder',
        tacticName: 'Sai Lầm Chết Người (Blunder)',
        explanation: `Đánh vào ${coordLabel} là sai lầm nghiêm trọng vì bỏ lỡ điểm nóng phòng ngự ${formatCoord(oppWin.row, oppWin.col)}!`,
        pros: [],
        cons: ['Bỏ lỡ nước chặn sinh tử', 'Để đối thủ thắng ngay nước sau'],
        opponentCounterMove: oppWin,
        opponentCounterReason: `Đối thủ lập tức đánh vào ${formatCoord(oppWin.row, oppWin.col)} và giành chiến thắng!`,
      };
    }

    return {
      coordLabel,
      quality: 'passive',
      tacticName: 'Nước Đi Phát Triển Thế Cờ',
      explanation: `Nước cờ tại ${coordLabel} củng cố cự ly liên kết, gia tăng phạm vi ảnh hưởng ở khu vực xung quanh.`,
      pros: ['Tăng cường liên kết quân', 'Mở rộng hướng phát triển'],
      cons: ['Chưa tạo được áp lực tấn công trực tiếp'],
    };
  }

  /**
   * Giả lập chuỗi 3-5 nước đi tương lai (What-If Branch Simulator)
   */
  public static simulateFutureLine(
    board: BoardMatrix,
    startingMove: Move,
    startingPlayer: ActivePlayer,
    maxSteps: number = 4
  ): WhatIfStep[] {
    const simBoard: BoardMatrix = board.map(row => [...row]);
    const steps: WhatIfStep[] = [];

    let currentPlayer = startingPlayer;
    let currentMove = startingMove;

    for (let step = 1; step <= maxSteps; step++) {
      if (simBoard[currentMove.row][currentMove.col] !== EMPTY) {
        break;
      }

      // Đặt quân mô phỏng
      simBoard[currentMove.row][currentMove.col] = currentPlayer;

      let tactic = 'Phát triển thế trận';
      if (isFive(simBoard, currentMove.row, currentMove.col, currentPlayer)) {
        tactic = 'Ngũ liên thắng cuộc';
      } else if (isOpenFour(simBoard, currentMove.row, currentMove.col, currentPlayer)) {
        tactic = 'Nước 4 mở ép thắng';
      } else if (isFourThreeFork(simBoard, currentMove.row, currentMove.col, currentPlayer)) {
        tactic = 'Đòn bẫy kép 4-3';
      } else if (isOpenThree(simBoard, currentMove.row, currentMove.col, currentPlayer)) {
        tactic = 'Nước 3 mở chủ động';
      }

      const coordStr = formatCoord(currentMove.row, currentMove.col);
      const playerName = currentPlayer === BLACK ? 'Đen' : 'Trắng';

      steps.push({
        stepNumber: step,
        move: { row: currentMove.row, col: currentMove.col },
        player: currentPlayer,
        annotation: `Nước ${step}: ${playerName} đánh ${coordStr} - ${tactic}`,
        tacticName: tactic,
      });

      // Nếu đã thắng hoặc bàn cờ đầy -> dừng mô phỏng
      if (isFive(simBoard, currentMove.row, currentMove.col, currentPlayer)) {
        break;
      }

      // Chuyển sang lượt đối thủ
      currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;

      // Tìm nước đi tốt nhất tiếp theo của bên tiếp theo
      const aiRes = this.ai.findBestMove(simBoard, currentPlayer, 10);
      currentMove = aiRes.move;
    }

    return steps;
  }

  /**
   * Tính toán Đánh giá thế trận (Evaluation Score & Win Rate)
   */
  public static calculateEvaluation(board: BoardMatrix): {
    winProbabilityBlack: number;
    evalScore: number;
    dominantColor: ActivePlayer | 'equal';
    summaryText: string;
  } {
    const candidates = getCandidateMoves(board, 2);
    if (candidates.length === 0) {
      return {
        winProbabilityBlack: 55,
        evalScore: 0.5,
        dominantColor: BLACK,
        summaryText: 'Đen cầm quyền tiên cơ mở màn tại trung tâm.',
      };
    }

    // Đánh giá sức mạnh Đen vs Trắng
    let blackTotal = 0;
    let whiteTotal = 0;

    for (const c of candidates) {
      blackTotal += evaluatePositionScore(board, c.row, c.col, BLACK, 1.0, 1.0);
      whiteTotal += evaluatePositionScore(board, c.row, c.col, WHITE, 1.0, 1.0);
    }

    // Kiểm tra VCF / VCT
    const blackVcf = solveVCF(board, BLACK, 8);
    const whiteVcf = solveVCF(board, WHITE, 8);

    if (blackVcf) {
      return {
        winProbabilityBlack: 99,
        evalScore: +99.0,
        dominantColor: BLACK,
        summaryText: 'Đen sở hữu chuỗi Sát Cục VCF tất thắng!',
      };
    }

    if (whiteVcf) {
      return {
        winProbabilityBlack: 1,
        evalScore: -99.0,
        dominantColor: WHITE,
        summaryText: 'Trắng sở hữu chuỗi Sát Cục VCF tất thắng!',
      };
    }

    const diff = blackTotal - whiteTotal;
    const rawEval = Math.max(-15, Math.min(15, diff / 5000));

    // Sigmoid winrate calculation
    const winRate = Math.round(100 / (1 + Math.exp(-rawEval * 0.35)));

    let dominantColor: ActivePlayer | 'equal' = 'equal';
    let summaryText = 'Thế trận đang giằng co cân bằng giữa Đen và Trắng.';

    if (winRate >= 65) {
      dominantColor = BLACK;
      summaryText = 'Đen đang chiếm ưu thế kiểm soát và chủ động tấn công.';
    } else if (winRate <= 35) {
      dominantColor = WHITE;
      summaryText = 'Trắng đang phòng ngự phản công vững chắc và kiểm soát thế trận.';
    }

    return {
      winProbabilityBlack: winRate,
      evalScore: parseFloat(rawEval.toFixed(1)),
      dominantColor,
      summaryText,
    };
  }
}
