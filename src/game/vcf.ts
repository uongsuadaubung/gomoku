import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, BoardMatrix, Move } from './types';
import { checkWin, getCandidateMoves } from './board';
import { evaluatePositionScore } from './evaluator';
import { isFourOrFive, BOARD_DIRECTIONS } from './threatUtils';

/**
 * Tìm ô đối thủ bắt buộc phải chặn khi bị tạo nước 4
 */
function findDefenseMovesForFour(board: BoardMatrix, attackPlayer: ActivePlayer, attackRow?: number, attackCol?: number): Move[] {
  const oppPlayer: ActivePlayer = attackPlayer === BLACK ? WHITE : BLACK;
  const defenseMoves: Move[] = [];

  // Lấy các ô cần kiểm tra: nếu có attackRow, attackCol thì chỉ quét trong phạm vi tia của nước vừa đánh
  const checkCells: Array<{ row: number; col: number }> = [];
  if (attackRow !== undefined && attackCol !== undefined) {
    for (const dir of BOARD_DIRECTIONS) {
      for (let dist = -4; dist <= 4; dist++) {
        if (dist === 0) continue;
        const r = attackRow + dir.dr * dist;
        const c = attackCol + dir.dc * dist;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
          if (!checkCells.some(cell => cell.row === r && cell.col === c)) {
            checkCells.push({ row: r, col: c });
          }
        }
      }
    }
  } else {
    checkCells.push(...getCandidateMoves(board, 2));
  }

  for (const move of checkCells) {
    // Nếu attackPlayer đánh vào đây tạo ra 5 quân -> Đây chính là ô đối thủ phải chặn!
    board[move.row][move.col] = attackPlayer;
    const attackWin = checkWin(board);
    board[move.row][move.col] = EMPTY;

    if (attackWin && attackWin.winner === attackPlayer) {
      defenseMoves.push(move);
    }
  }

  return defenseMoves;
}

/**
 * Thuật toán VCF (Victory by Continuous Fours)
 * Tìm chuỗi thắng cưỡng bức bằng các nước tạo Four liên tục
 */
export function solveVCF(
  board: BoardMatrix,
  attackPlayer: ActivePlayer,
  maxDepth = 10,
  currentDepth = 0
): Move | null {
  if (currentDepth >= maxDepth) return null;

  const candidates = getCandidateMoves(board, 2);
  const fourCandidates: Move[] = [];

  // Lọc nhanh: Chỉ duyệt những ô tạo ra Four (4 quân) hoặc Five (5 quân)
  for (const move of candidates) {
    if (isFourOrFive(board, move.row, move.col, attackPlayer)) {
      fourCandidates.push(move);
    }
  }

  if (fourCandidates.length === 0) return null;

  for (const move of fourCandidates) {
    // 1. Kiểm tra nếu đi nước này thắng ngay (5 quân liên tiếp)
    board[move.row][move.col] = attackPlayer;
    const win = checkWin(board);
    if (win && win.winner === attackPlayer) {
      board[move.row][move.col] = EMPTY;
      return move;
    }

    // 2. Tìm các ô mà đối thủ bắt buộc phải nhảy vào chặn
    const defenseMoves = findDefenseMovesForFour(board, attackPlayer, move.row, move.col);

    if (defenseMoves.length === 0) {
      // Đối thủ không chặn được (tức là 4 mở 2 đầu hoặc double 4) -> Thắng tuyệt đối!
      board[move.row][move.col] = EMPTY;
      return move;
    }

    // Nếu có ô chặn, thử cho đối thủ chặn và đệ quy tìm nước tạo 4 tiếp theo
    let allDefensesLeadToWin = true;
    const oppPlayer: ActivePlayer = attackPlayer === BLACK ? WHITE : BLACK;

    for (const def of defenseMoves) {
      board[def.row][def.col] = oppPlayer;
      const nextWinMove = solveVCF(board, attackPlayer, maxDepth, currentDepth + 1);
      board[def.row][def.col] = EMPTY;

      if (!nextWinMove) {
        allDefensesLeadToWin = false;
        break;
      }
    }

    board[move.row][move.col] = EMPTY;

    if (allDefensesLeadToWin) {
      return move;
    }
  }

  return null;
}
