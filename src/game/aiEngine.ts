import {
  EMPTY,
  BLACK,
  WHITE,
  ActivePlayer,
  BoardMatrix,
  Move,
  AIStats,
} from './types';
import { checkWin, getCandidateMoves, isBoardFull } from './board';
import { evaluateBoardScore, evaluatePositionScore } from './evaluator';
import { zobrist, TranspositionTable } from './zobrist';
import { solveVCF } from './vcf';
import { getLevelConfigByWins, SCORES } from './constants';

export class AIEngine {
  private tt: TranspositionTable;
  private nodesCount: number = 0;
  private startTime: number = 0;
  private timeLimitMs: number = 2500; // Tối đa 2.5s suy nghĩ
  private isCancelled: boolean = false;

  constructor() {
    this.tt = new TranspositionTable(150000);
  }

  public cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Tính toán nước đi tốt nhất dựa trên cấp độ và trạng thái bàn cờ
   */
  public findBestMove(
    board: BoardMatrix,
    aiPlayer: ActivePlayer,
    levelId: number,
    onProgress?: (depth: number, nodes: number, currentBest?: Move, score?: number) => void
  ): { move: Move; stats: AIStats } {
    this.isCancelled = false;
    this.nodesCount = 0;
    this.startTime = performance.now();
    this.tt.clear();

    const oppPlayer: ActivePlayer = aiPlayer === BLACK ? WHITE : BLACK;
    const levelConfig = getLevelConfigByWins(0, levelId);
    const maxSearchDepth = levelConfig.depth;
    const candidateLimit = levelConfig.candidateCount;

    // Lấy danh sách ô ứng viên lân cận
    const rawCandidates = getCandidateMoves(board, 2);
    if (rawCandidates.length === 0) {
      return {
        move: { row: 7, col: 7 },
        stats: {
          depth: 1,
          nodesEvaluated: 1,
          timeMs: 0,
          winProbability: 50,
          bestScore: 0,
        },
      };
    }

    if (rawCandidates.length === 1) {
      return {
        move: rawCandidates[0],
        stats: {
          depth: 1,
          nodesEvaluated: 1,
          timeMs: 0,
          winProbability: 50,
          bestScore: 0,
        },
      };
    }

    // 1. KIỂM TRA ĐÒN THẮNG NGAY / CHẶN NGAY (Immediate Win / Urgent Defense)
    // Giúp bot không bao giờ bỏ sót nước 5 của mình hoặc nước 5 của đối thủ
    for (const cand of rawCandidates) {
      // Nếu AI đi vào đây thắng luôn
      board[cand.row][cand.col] = aiPlayer;
      const winAi = checkWin(board);
      board[cand.row][cand.col] = EMPTY;
      if (winAi && winAi.winner === aiPlayer) {
        return {
          move: cand,
          stats: {
            depth: 1,
            nodesEvaluated: this.nodesCount,
            timeMs: Math.round(performance.now() - this.startTime),
            winProbability: 100,
            bestScore: SCORES.FIVE,
          },
        };
      }
    }

    for (const cand of rawCandidates) {
      // Nếu Đối thủ đi vào đây sẽ thắng -> Phải chặn ngay!
      board[cand.row][cand.col] = oppPlayer;
      const winOpp = checkWin(board);
      board[cand.row][cand.col] = EMPTY;
      if (winOpp && winOpp.winner === oppPlayer) {
        return {
          move: cand,
          stats: {
            depth: 1,
            nodesEvaluated: this.nodesCount,
            timeMs: Math.round(performance.now() - this.startTime),
            winProbability: 50,
            bestScore: SCORES.FIVE / 2,
          },
        };
      }
    }

    // 2. TÌM KIẾM SÁT CỤC VCF NẾU Ở CẤP ĐỘ CAO (Level 5, 6)
    if (levelConfig.vcfEnabled) {
      const vcfMove = solveVCF(board, aiPlayer, 12);
      if (vcfMove) {
        return {
          move: vcfMove,
          stats: {
            depth: 8,
            nodesEvaluated: this.nodesCount,
            timeMs: Math.round(performance.now() - this.startTime),
            winProbability: 99,
            bestScore: SCORES.OPEN_FOUR,
            vcfFound: true,
          },
        };
      }
    }

    // 3. ĐÁNH GIÁ VÀ SẮP XẾP ỨNG VIÊN (Move Ordering)
    const scoredCandidates = rawCandidates
      .map(c => ({
        ...c,
        score: evaluatePositionScore(board, c.row, c.col, aiPlayer),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Lọc lấy top N ứng viên sáng giá nhất theo cấu hình Level
    const topCandidates = scoredCandidates.slice(0, candidateLimit);

    // 4. LEVEL 1: XỬ LÝ NHẸ NHÀNG (HEURISTIC + SOFT RANDOM)
    if (levelConfig.depth === 1) {
      this.nodesCount = topCandidates.length;
      let selectedMove = topCandidates[0];

      // Nếu có tỷ lệ ngẫu nhiên mềm (randomness), cho phép chọn trong top 3 nước tốt
      if (levelConfig.randomness > 0 && topCandidates.length >= 3 && Math.random() < levelConfig.randomness) {
        const randomIndex = Math.floor(Math.random() * Math.min(3, topCandidates.length));
        selectedMove = topCandidates[randomIndex];
      }

      const evalScore = evaluateBoardScore(board, aiPlayer);
      const winProb = this.calculateWinProbability(evalScore);

      return {
        move: selectedMove,
        stats: {
          depth: 1,
          nodesEvaluated: this.nodesCount,
          timeMs: Math.round(performance.now() - this.startTime),
          winProbability: winProb,
          bestScore: selectedMove.score || 0,
        },
      };
    }

    // 5. CÁC LEVEL CAO HƠN: CHẠY MINIMAX VỚI ALPHA-BETA PRUNING & ITERATIVE DEEPENING
    let globalBestMove = topCandidates[0];
    let globalBestScore = -Infinity;
    let initialHash = zobrist.computeHash(board);

    for (let currentDepth = 2; currentDepth <= maxSearchDepth; currentDepth += 2) {
      if (this.isCancelled || performance.now() - this.startTime > this.timeLimitMs) {
        break;
      }

      let alpha = -Infinity;
      let beta = Infinity;
      let depthBestMove = globalBestMove;
      let depthBestScore = -Infinity;

      for (const cand of topCandidates) {
        board[cand.row][cand.col] = aiPlayer;
        let nextHash = zobrist.togglePiece(initialHash, cand.row, cand.col, aiPlayer);

        const score = -this.minimax(
          board,
          currentDepth - 1,
          -beta,
          -alpha,
          oppPlayer,
          aiPlayer,
          nextHash,
          candidateLimit
        );

        board[cand.row][cand.col] = EMPTY;

        if (score > depthBestScore) {
          depthBestScore = score;
          depthBestMove = cand;
        }

        alpha = Math.max(alpha, score);
        if (alpha >= beta) break; // Alpha-beta cutoff
      }

      globalBestMove = depthBestMove;
      globalBestScore = depthBestScore;

      if (onProgress) {
        onProgress(currentDepth, this.nodesCount, globalBestMove, globalBestScore);
      }

      // Nếu đã tìm thấy đường thắng tuyệt đối thì không cần tìm sâu hơn
      if (globalBestScore >= SCORES.FIVE / 2) {
        break;
      }
    }

    // Nếu ở Level 2-3 có randomness nhẹ, đôi khi chọn nước đi gần tốt nhất
    if (levelConfig.randomness > 0 && topCandidates.length > 2 && Math.random() < levelConfig.randomness) {
      const altMove = topCandidates.find(
        m => m.row !== globalBestMove.row || m.col !== globalBestMove.col
      );
      if (altMove && (altMove.score || 0) >= (topCandidates[0].score || 0) * 0.8) {
        globalBestMove = altMove;
      }
    }

    const elapsedMs = Math.max(1, Math.round(performance.now() - this.startTime));
    const winProbability = this.calculateWinProbability(globalBestScore);

    return {
      move: globalBestMove,
      stats: {
        depth: maxSearchDepth,
        nodesEvaluated: this.nodesCount,
        timeMs: elapsedMs,
        winProbability,
        bestScore: globalBestScore,
      },
    };
  }

  /**
   * Thuật toán Minimax kết hợp Alpha-Beta & Bảng băm Zobrist
   */
  private minimax(
    board: BoardMatrix,
    depth: number,
    alpha: number,
    beta: number,
    currentPlayer: ActivePlayer,
    aiPlayer: ActivePlayer,
    currentHash: number,
    candidateLimit: number
  ): number {
    this.nodesCount++;

    if (this.isCancelled || (this.nodesCount % 1000 === 0 && performance.now() - this.startTime > this.timeLimitMs)) {
      return evaluateBoardScore(board, aiPlayer);
    }

    // Tra cứu Transposition Table
    const ttEntry = this.tt.get(currentHash);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'EXACT') return ttEntry.score;
      if (ttEntry.flag === 'LOWERBOUND') alpha = Math.max(alpha, ttEntry.score);
      else if (ttEntry.flag === 'UPPERBOUND') beta = Math.min(beta, ttEntry.score);
      if (alpha >= beta) return ttEntry.score;
    }

    const oppPlayer: ActivePlayer = currentPlayer === BLACK ? WHITE : BLACK;

    // Kiểm tra lá cây: Có người thắng hoặc đạt độ sâu cực đại hoặc bàn cờ đầy
    const win = checkWin(board);
    if (win) {
      return win.winner === aiPlayer ? SCORES.FIVE + depth * 1000 : -SCORES.FIVE - depth * 1000;
    }

    if (depth <= 0 || isBoardFull(board)) {
      const score = evaluateBoardScore(board, aiPlayer);
      return currentPlayer === aiPlayer ? score : -score;
    }

    const rawCandidates = getCandidateMoves(board, 2);
    if (rawCandidates.length === 0) return 0;

    // Move Ordering
    const sortedCandidates = rawCandidates
      .map(c => ({
        ...c,
        score: evaluatePositionScore(board, c.row, c.col, currentPlayer),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, Math.max(6, Math.min(candidateLimit, 12)));

    let maxScore = -Infinity;
    let originalAlpha = alpha;

    for (const cand of sortedCandidates) {
      board[cand.row][cand.col] = currentPlayer;
      let nextHash = zobrist.togglePiece(currentHash, cand.row, cand.col, currentPlayer);

      const score = -this.minimax(
        board,
        depth - 1,
        -beta,
        -alpha,
        oppPlayer,
        aiPlayer,
        nextHash,
        candidateLimit
      );

      board[cand.row][cand.col] = EMPTY;

      if (score > maxScore) {
        maxScore = score;
      }

      alpha = Math.max(alpha, score);
      if (alpha >= beta) {
        break; // Alpha-beta cutoff
      }
    }

    // Lưu vào Transposition Table
    let flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND' = 'EXACT';
    if (maxScore <= originalAlpha) flag = 'UPPERBOUND';
    else if (maxScore >= beta) flag = 'LOWERBOUND';

    this.tt.set(currentHash, {
      depth,
      score: maxScore,
      flag,
    });

    return maxScore;
  }

  /**
   * Tính toán tỷ lệ phần trăm thắng ước tính dựa trên điểm đánh giá thế trận
   */
  private calculateWinProbability(score: number): number {
    if (score >= SCORES.FIVE / 2) return 99;
    if (score <= -SCORES.FIVE / 2) return 1;
    // Chuyển đổi bằng hàm Sigmoid mượt mà
    const normalized = score / 50000;
    const prob = 1 / (1 + Math.exp(-normalized));
    return Math.min(99, Math.max(1, Math.round(prob * 100)));
  }
}
