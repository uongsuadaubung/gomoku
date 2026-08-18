import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, BoardMatrix, Move } from './types';
import { checkWin, getCandidateMoves } from './board';
import { evaluatePositionScore } from './evaluator';

/**
 * Kiểm tra xem một nước đi có tạo ra chuỗi 4 quân (Four) hoặc 5 quân (Five) cho player hay không
 */
function isFourOrFive(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  board[row][col] = player;
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  let makesThreat = false;

  for (const dir of directions) {
    let count = 1;
    // Đếm về trước
    let r = row + dir.dr;
    let c = col + dir.dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r += dir.dr;
      c += dir.dc;
    }
    // Đếm về sau
    r = row - dir.dr;
    c = col - dir.dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r -= dir.dr;
      c -= dir.dc;
    }

    if (count >= 4) {
      makesThreat = true;
      break;
    }
  }

  board[row][col] = EMPTY;
  return makesThreat;
}

/**
 * Tìm ô đối thủ bắt buộc phải chặn khi bị tạo nước 4
 */
function findDefenseMovesForFour(board: BoardMatrix, attackPlayer: ActivePlayer): Move[] {
  const oppPlayer: ActivePlayer = attackPlayer === BLACK ? WHITE : BLACK;
  const candidates = getCandidateMoves(board, 2);
  const defenseMoves: Move[] = [];

  for (const move of candidates) {
    // Nếu đối thủ đánh vào đây mà hóa giải hoặc thắng
    board[move.row][move.col] = oppPlayer;
    const win = checkWin(board);
    board[move.row][move.col] = EMPTY;

    if (win) {
      return [move];
    }

    // Nếu attackPlayer đánh vào đây tạo ra 5 quân -> Đây chính là ô đối thủ phải chặn!
    board[move.row][move.col] = attackPlayer;
    const attackWin = checkWin(board);
    board[move.row][move.col] = EMPTY;

    if (attackWin) {
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
  // Sắp xếp các nước đi có điểm cục bộ cao nhất (VCF ưu tiên tấn công dồn dập)
  const sortedCandidates = candidates
    .map(m => ({
      ...m,
      score: evaluatePositionScore(board, m.row, m.col, attackPlayer, 1.0, 0.0),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  for (const move of sortedCandidates) {
    // 1. Kiểm tra nếu đi nước này thắng ngay
    board[move.row][move.col] = attackPlayer;
    const win = checkWin(board);
    if (win && win.winner === attackPlayer) {
      board[move.row][move.col] = EMPTY;
      return move;
    }

    // 2. Kiểm tra nếu nước này tạo thành Four
    const isThreat = isFourOrFive(board, move.row, move.col, attackPlayer);
    if (!isThreat) {
      board[move.row][move.col] = EMPTY;
      continue;
    }

    // 3. Tìm các ô mà đối thủ bắt buộc phải nhảy vào chặn
    const defenseMoves = findDefenseMovesForFour(board, attackPlayer);

    if (defenseMoves.length === 0) {
      // Đối thủ không chặn được (tức là 4 mở 2 đầu hoặc double 4) -> Thắng tuyệt đối!
      board[move.row][move.col] = EMPTY;
      return move;
    }

    // Nếu chỉ có 1 hoặc 2 ô chặn, thử cho đối thủ chặn và đệ quy tìm tiếp
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
