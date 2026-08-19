import { BOARD_SIZE, EMPTY, BLACK, WHITE, BoardMatrix } from '../../types';
import { cloneBoard, checkWin } from '../../board';
import { solveVCF } from '../../vcf';
import { solveVCT, getVCTSolutionTrace } from '../../vct';
import { SolutionTraceResult } from '../types';

export { getVCTSolutionTrace };

/**
 * Kiểm định chính xác lời giải VCF theo thời gian thực và trích xuất chuỗi nước tấn công
 */
export function getVCFSolutionTrace(initialBoard: BoardMatrix, targetStars: number): SolutionTraceResult {
  const b = cloneBoard(initialBoard);
  let moves = 0;
  const attackMoves: Array<{ r: number; c: number }> = [];

  while (moves < targetStars + 2) {
    const move = solveVCF(b, BLACK, targetStars + 2);
    if (!move) return { success: false, moves, attackMoves };

    b[move.row][move.col] = BLACK;
    attackMoves.push({ r: move.row, c: move.col });
    moves++;

    const win = checkWin(b);
    if (win) {
      return { success: moves === targetStars, moves, attackMoves };
    }

    const blocks: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (b[r][c] === EMPTY) {
          b[r][c] = BLACK;
          if (checkWin(b)) blocks.push({ r, c });
          b[r][c] = EMPTY;
        }
      }
    }

    if (blocks.length === 0 || blocks.length >= 2) {
      return { success: moves + 1 === targetStars, moves: moves + 1, attackMoves };
    } else {
      b[blocks[0].r][blocks[0].c] = WHITE;
    }
  }

  return { success: false, moves, attackMoves };
}

/**
 * Kiểm tra nhanh xem Trắng có nước thắng 5 ngay lập tức hoặc đòn 3 mở (Open Three) tạo sát cục
 */
export function hasImmediateWhiteThreat(board: BoardMatrix): boolean {
  // 1. Kiểm tra Trắng có nước 4 thành 5 ngay lập tức (Win in 1 move)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) {
        board[r][c] = WHITE;
        const win = checkWin(board);
        board[r][c] = EMPTY;
        if (win && win.winner === WHITE) return true;
      }
    }
  }

  // 2. Quét nhanh 4 hướng tìm Open 3 của Trắng (_ O O O _)
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const { dr, dc } of directions) {
        const r4 = r + 4 * dr;
        const c4 = c + 4 * dc;
        if (r4 >= 0 && r4 < BOARD_SIZE && c4 >= 0 && c4 < BOARD_SIZE) {
          if (
            board[r][c] === EMPTY &&
            board[r + dr][c + dc] === WHITE &&
            board[r + 2 * dr][c + 2 * dc] === WHITE &&
            board[r + 3 * dr][c + 3 * dc] === WHITE &&
            board[r4][c4] === EMPTY
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
