import {
  EMPTY,
  BLACK,
  WHITE,
  ActivePlayer,
  BoardMatrix,
  Move,
  AIStats,
  LevelConfig,
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
   * Tính toán nước đi tốt nhất dựa trên Decision Pipeline chuẩn hóa
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

    // Lấy danh sách ô ứng viên lân cận (bán kính 2 ô quanh các quân cờ)
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

    // ─────────────────────────────────────────────────────────────
    // STAGE 1: BỘ LỌC NHẬN THỨC ĐE DỌA TRỰC DIỆN (Threat Perception)
    // ─────────────────────────────────────────────────────────────
    const threatMove = this.checkImmediateThreats(board, aiPlayer, oppPlayer, rawCandidates, levelConfig);
    if (threatMove) {
      return {
        move: threatMove.move,
        stats: {
          depth: 1,
          nodesEvaluated: this.nodesCount,
          timeMs: Math.round(performance.now() - this.startTime),
          winProbability: threatMove.winProbability,
          bestScore: threatMove.score,
        },
      };
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 2: TÌM KIẾM SÁT CỤC CHIẾN THUẬT (Tactical VCF Solver)
    // ─────────────────────────────────────────────────────────────
    if (levelConfig.vcfDepth > 0) {
      const vcfMove = solveVCF(board, aiPlayer, levelConfig.vcfDepth);
      if (vcfMove) {
        return {
          move: vcfMove,
          stats: {
            depth: Math.min(8, levelConfig.vcfDepth),
            nodesEvaluated: this.nodesCount,
            timeMs: Math.round(performance.now() - this.startTime),
            winProbability: 99,
            bestScore: SCORES.OPEN_FOUR,
            vcfFound: true,
          },
        };
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 3 & 4: ĐÁNH GIÁ CỤC DIỆN & CHÍNH SÁCH RA QUYẾT ĐỊNH
    // ─────────────────────────────────────────────────────────────
    return this.searchAndSelectMove(board, aiPlayer, oppPlayer, levelConfig, rawCandidates, onProgress);
  }

  /**
   * STAGE 1: Kiểm tra nước thắng ngay hoặc nước chặn khẩn cấp theo tầm nhìn của level
   */
  private checkImmediateThreats(
    board: BoardMatrix,
    aiPlayer: ActivePlayer,
    oppPlayer: ActivePlayer,
    candidates: Move[],
    config: LevelConfig
  ): { move: Move; score: number; winProbability: number } | null {
    // 1. Kiểm tra nếu AI có nước 5 để thắng ngay lập tức
    for (const cand of candidates) {
      board[cand.row][cand.col] = aiPlayer;
      const winAi = checkWin(board);
      board[cand.row][cand.col] = EMPTY;
      if (winAi && winAi.winner === aiPlayer) {
        return { move: cand, score: SCORES.FIVE, winProbability: 100 };
      }
    }

    // 2. Kiểm tra nếu Đối thủ có nước 5 (cần chặn khẩn cấp)
    // Tầm nhìn đe dọa (threatVision) quyết định xác suất AI nhận biết và chặn kịp thời
    const seesOppThreat = Math.random() < config.threatVision;
    if (seesOppThreat) {
      for (const cand of candidates) {
        board[cand.row][cand.col] = oppPlayer;
        const winOpp = checkWin(board);
        board[cand.row][cand.col] = EMPTY;
        if (winOpp && winOpp.winner === oppPlayer) {
          return { move: cand, score: SCORES.FIVE / 2, winProbability: 50 };
        }
      }
    }

    return null;
  }

  /**
   * STAGE 3 & 4: Tìm kiếm theo độ sâu và áp dụng chính sách chọn nước đi (Boltzmann/Softmax Policy)
   */
  private searchAndSelectMove(
    board: BoardMatrix,
    aiPlayer: ActivePlayer,
    oppPlayer: ActivePlayer,
    config: LevelConfig,
    rawCandidates: Move[],
    onProgress?: (depth: number, nodes: number, currentBest?: Move, score?: number) => void
  ): { move: Move; stats: AIStats } {
    // Chấm điểm và sắp xếp ứng viên theo Heuristic weights của level
    const scoredCandidates = rawCandidates
      .map(c => ({
        ...c,
        score: evaluatePositionScore(board, c.row, c.col, aiPlayer, config.attackWeight, config.defenseWeight),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const topCandidates = scoredCandidates.slice(0, config.candidateCount);

    // CẤP ĐỘ 1-PLY (Depth === 1): Chọn trực tiếp qua Heuristic kết hợp Softmax Policy
    if (config.depth <= 1) {
      this.nodesCount = topCandidates.length;
      const selectedMove = this.selectMoveByPolicy(topCandidates, config.temperature);
      const evalScore = evaluateBoardScore(board, aiPlayer, config.attackWeight, config.defenseWeight);
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

    // CÁC CẤP ĐỘ MINIMAX (Depth >= 2): Iterative Deepening với Alpha-Beta Pruning
    let globalBestMove: Move = topCandidates[0];
    let globalBestScore = -Infinity;
    const initialHash = zobrist.computeHash(board);

    for (let currentDepth = 2; currentDepth <= config.depth; currentDepth += 2) {
      if (this.isCancelled || performance.now() - this.startTime > this.timeLimitMs) {
        break;
      }

      let alpha = -Infinity;
      const beta = Infinity;
      let depthBestMove: Move = globalBestMove;
      let depthBestScore = -Infinity;

      for (const cand of topCandidates) {
        board[cand.row][cand.col] = aiPlayer;
        const nextHash = zobrist.togglePiece(initialHash, cand.row, cand.col, aiPlayer);

        const score = -this.minimax(
          board,
          currentDepth - 1,
          -beta,
          -alpha,
          oppPlayer,
          aiPlayer,
          nextHash,
          config
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

      // Đã tìm thấy chuỗi thắng tuyệt đối thì dừng tìm kiếm
      if (globalBestScore >= SCORES.FIVE / 2) {
        break;
      }
    }

    // Áp dụng Softmax Temperature Policy cho nước đi nếu level có temperature > 0
    let finalMove: Move = globalBestMove;
    if (config.temperature > 0 && topCandidates.length >= 2) {
      finalMove = this.selectMoveByPolicy(topCandidates, config.temperature);
    }

    const elapsedMs = Math.max(1, Math.round(performance.now() - this.startTime));
    const winProbability = this.calculateWinProbability(globalBestScore);

    return {
      move: finalMove,
      stats: {
        depth: config.depth,
        nodesEvaluated: this.nodesCount,
        timeMs: elapsedMs,
        winProbability,
        bestScore: globalBestScore,
      },
    };
  }

  /**
   * STAGE 4: Chính sách chọn nước đi theo phân phối xác suất Boltzmann / Softmax
   * Giúp AI cấp thấp đánh rất mềm mại, tự nhiên, mô phỏng đúng cảm giác đối thủ người thật
   */
  private selectMoveByPolicy(candidates: Move[], temperature: number): Move {
    if (temperature <= 0 || candidates.length <= 1) {
      return candidates[0];
    }

    // Phân phối trọng số rank-based softmax: weight_i = exp(-i / (temperature * 2.5))
    const scale = temperature * 2.5;
    const weights = candidates.map((_, i) => Math.exp(-i / scale));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let randomThreshold = Math.random() * totalWeight;
    for (let i = 0; i < candidates.length; i++) {
      randomThreshold -= weights[i];
      if (randomThreshold <= 0) {
        return candidates[i];
      }
    }

    return candidates[0];
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
    config: LevelConfig
  ): number {
    this.nodesCount++;

    if (this.isCancelled || (this.nodesCount % 1000 === 0 && performance.now() - this.startTime > this.timeLimitMs)) {
      return evaluateBoardScore(board, aiPlayer, config.attackWeight, config.defenseWeight);
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
      const score = evaluateBoardScore(board, aiPlayer, config.attackWeight, config.defenseWeight);
      return currentPlayer === aiPlayer ? score : -score;
    }

    const rawCandidates = getCandidateMoves(board, 2);
    if (rawCandidates.length === 0) return 0;

    // Move Ordering
    const sortedCandidates = rawCandidates
      .map(c => ({
        ...c,
        score: evaluatePositionScore(board, c.row, c.col, currentPlayer, config.attackWeight, config.defenseWeight),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, Math.max(6, Math.min(config.candidateCount, 12)));

    let maxScore = -Infinity;
    const originalAlpha = alpha;

    for (const cand of sortedCandidates) {
      board[cand.row][cand.col] = currentPlayer;
      const nextHash = zobrist.togglePiece(currentHash, cand.row, cand.col, currentPlayer);

      const score = -this.minimax(
        board,
        depth - 1,
        -beta,
        -alpha,
        oppPlayer,
        aiPlayer,
        nextHash,
        config
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
