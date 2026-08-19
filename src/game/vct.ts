import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, BoardMatrix, Move } from './types';
import { checkWin, getCandidateMoves, cloneBoard } from './board';
import { solveVCF } from './vcf';
import {
  isFourOrFive,
  isOpenThree,
  isFourThreeFork,
  isDoubleThree,
  BOARD_DIRECTIONS,
} from './threatUtils';

export { isFourOrFive, isOpenThree, isFourThreeFork, isDoubleThree, BOARD_DIRECTIONS };


/**
 * Tìm các ô đối thủ cần chặn khi bị đe dọa bởi nước 4 hoặc nước 3
 */
function findDefenseMovesForThreat(
  board: BoardMatrix,
  attackPlayer: ActivePlayer,
  attackRow: number,
  attackCol: number,
  isFour: boolean
): Move[] {
  const defenseMoves: Move[] = [];
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (const dir of directions) {
    for (let dist = -4; dist <= 4; dist++) {
      if (dist === 0) continue;
      const r = attackRow + dir.dr * dist;
      const c = attackCol + dir.dc * dist;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
        board[r][c] = attackPlayer;
        const makesWin = checkWin(board);
        const makesFour = isFourOrFive(board, r, c, attackPlayer);
        board[r][c] = EMPTY;

        if (isFour) {
          if (makesWin && makesWin.winner === attackPlayer) {
            if (!defenseMoves.some(m => m.row === r && m.col === c)) defenseMoves.push({ row: r, col: c });
          }
        } else {
          // Đối với nước 3 mở, đối thủ chặn ở ô có thể tạo 4 hoặc 5
          if (makesFour) {
            if (!defenseMoves.some(m => m.row === r && m.col === c)) defenseMoves.push({ row: r, col: c });
          }
        }
      }
    }
  }

  return defenseMoves;
}

/**
 * Tìm kiếm nước thắng VCT (Victory by Continuous Threats)
 */
export function solveVCT(
  board: BoardMatrix,
  attackPlayer: ActivePlayer,
  maxDepth = 8,
  currentDepth = 0
): Move | null {
  if (currentDepth >= maxDepth) return null;

  const candidates = getCandidateMoves(board, 2);
  const threatMoves: Array<{ move: Move; isFork: boolean; isFour: boolean }> = [];

  for (const m of candidates) {
    // A. Kiểm tra nếu đi nước này thắng ngay (5 quân)
    board[m.row][m.col] = attackPlayer;
    const win = checkWin(board);
    board[m.row][m.col] = EMPTY;
    if (win && win.winner === attackPlayer) {
      return m;
    }

    // B. Kiểm tra nếu nước này là Đòn Bẫy Đôi 4-3 hoặc Song Tam 3-3
    if (isFourThreeFork(board, m.row, m.col, attackPlayer) || isDoubleThree(board, m.row, m.col, attackPlayer)) {
      return m; // Thắng tuyệt đối ngay nước này!
    }

    // C. Kiểm tra nếu nước này tạo 4 hoặc tạo 3 mở
    const four = isFourOrFive(board, m.row, m.col, attackPlayer);
    const three = isOpenThree(board, m.row, m.col, attackPlayer);
    if (four || three) {
      threatMoves.push({ move: m, isFork: false, isFour: four });
    }
  }

  // 2. Kiểm tra nếu có đòn VCF sát cục ngay
  const vcfWin = solveVCF(board, attackPlayer, maxDepth - currentDepth);
  if (vcfWin) return vcfWin;

  if (threatMoves.length === 0) return null;

  const oppPlayer: ActivePlayer = attackPlayer === BLACK ? WHITE : BLACK;

  for (const threat of threatMoves) {
    board[threat.move.row][threat.move.col] = attackPlayer;

    const defenseMoves = findDefenseMovesForThreat(board, attackPlayer, threat.move.row, threat.move.col, threat.isFour);

    if (defenseMoves.length === 0) {
      board[threat.move.row][threat.move.col] = EMPTY;
      return threat.move;
    }

    let allBlocksLeadToWin = true;
    for (const b of defenseMoves) {
      board[b.row][b.col] = oppPlayer;
      const nextWin = solveVCT(board, attackPlayer, maxDepth, currentDepth + 1);
      board[b.row][b.col] = EMPTY;

      if (!nextWin) {
        allBlocksLeadToWin = false;
        break;
      }
    }

    board[threat.move.row][threat.move.col] = EMPTY;

    if (allBlocksLeadToWin) {
      return threat.move;
    }
  }

  return null;
}

/**
 * Trích xuất chuỗi nước tấn công VCT và kiểm tra số nước đi chính xác
 */
export function getVCTSolutionTrace(initialBoard: BoardMatrix, targetStars: number): {
  success: boolean;
  moves: number;
  attackMoves: Array<{ r: number; c: number }>;
} {
  const b = cloneBoard(initialBoard);
  let moves = 0;
  const attackMoves: Array<{ r: number; c: number }> = [];

  while (moves < targetStars + 2) {
    const move = solveVCT(b, BLACK, targetStars + 2);
    if (!move) return { success: false, moves, attackMoves };

    b[move.row][move.col] = BLACK;
    attackMoves.push({ r: move.row, c: move.col });
    moves++;

    const win = checkWin(b);
    if (win) {
      return { success: moves === targetStars, moves, attackMoves };
    }

    // Kiểm tra nếu nước vừa đánh tạo Bẫy Đôi 4-3 hoặc Song Tam -> Thắng ở nước kế tiếp
    if (isFourThreeFork(b, move.row, move.col, BLACK) || isDoubleThree(b, move.row, move.col, BLACK)) {
      return { success: moves === targetStars, moves, attackMoves };
    }

    const defenseMoves = findDefenseMovesForThreat(
      b,
      BLACK,
      move.row,
      move.col,
      isFourOrFive(b, move.row, move.col, BLACK)
    );

    if (defenseMoves.length === 0) {
      return { success: moves === targetStars, moves, attackMoves };
    } else {
      b[defenseMoves[0].row][defenseMoves[0].col] = WHITE;
    }
  }

  return { success: false, moves, attackMoves };
}
