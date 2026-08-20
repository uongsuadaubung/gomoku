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
 * Đếm số lượng nước đi mà người chơi cụ thể (White hoặc Black) có thể thắng 5 ngay trong 1 nước
 */
export function countWinningMoves(board: BoardMatrix, player: typeof BLACK | typeof WHITE): number {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) {
        board[r][c] = player;
        const win = checkWin(board);
        board[r][c] = EMPTY;
        if (win && win.winner === player) {
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Kiểm tra xem một người chơi có đòn 4 mở liên tiếp (_ P P P P _) 2 đầu trống không
 * (Đòn 4 mở không thể ngăn chặn vì chặn 1 đầu thì đầu kia vẫn thắng)
 */
export function hasOpenFour(board: BoardMatrix, player: typeof BLACK | typeof WHITE): boolean {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const { dr, dc } of directions) {
        const r5 = r + 5 * dr;
        const c5 = c + 5 * dc;
        if (r5 >= 0 && r5 < BOARD_SIZE && c5 >= 0 && c5 < BOARD_SIZE) {
          if (
            board[r][c] === EMPTY &&
            board[r + dr][c + dc] === player &&
            board[r + 2 * dr][c + 2 * dc] === player &&
            board[r + 3 * dr][c + 3 * dc] === player &&
            board[r + 4 * dr][c + 4 * dc] === player &&
            board[r5][c5] === EMPTY
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Kiểm tra xem Trắng (Bot) có đòn sát cục không thể cản phá hay không:
 * - Trắng đã có 5 quân (thắng sẵn)
 * - Trắng có 4 mở (_ O O O O _)
 * - Trắng có từ 2 nước thắng 5 trở lên cùng lúc (Double Four, Tứ Đôi, chặn 1 đầu thì đầu kia thắng)
 */
export function hasUnstoppableWhiteThreat(board: BoardMatrix): boolean {
  const win = checkWin(board);
  if (win && win.winner === WHITE) return true;

  if (hasOpenFour(board, WHITE)) return true;

  if (countWinningMoves(board, WHITE) >= 2) return true;

  return false;
}

/**
 * Kiểm tra xem Trắng có bất kỳ đe dọa trực tiếp nào không (thắng trong 1 nước hoặc 3 mở)
 */
export function hasImmediateWhiteThreat(board: BoardMatrix): boolean {
  // 1. Trắng có ít nhất 1 nước thắng 5 ngay lập tức
  if (countWinningMoves(board, WHITE) >= 1) return true;

  // 2. Quét 4 hướng tìm Open 3 của Trắng (_ O O O _)
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
