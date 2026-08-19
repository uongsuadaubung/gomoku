import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, BoardMatrix } from './types';
import { SCORES } from './constants';

/**
 * Đánh giá điểm một chuỗi (mẫu hình) theo 1 hướng đối với 1 người chơi
 */
function evaluateLinePattern(
  line: number[],
  player: ActivePlayer
): {
  five: number;
  openFour: number;
  blockedFour: number;
  openThree: number;
  blockedThree: number;
  openTwo: number;
  blockedTwo: number;
} {
  const opp = player === BLACK ? WHITE : BLACK;
  const len = line.length;

  let five = 0;
  let openFour = 0;
  let blockedFour = 0;
  let openThree = 0;
  let blockedThree = 0;
  let openTwo = 0;
  let blockedTwo = 0;

  // Quét các đoạn con độ dài 5 hoặc 6
  // Chuyển chuỗi thành định dạng ký tự để regex / pattern matching siêu nhanh
  let str = '';
  for (let i = 0; i < len; i++) {
    const val = line[i];
    if (val === player) str += '1';
    else if (val === opp) str += '2';
    else str += '0';
  }

  // 1. Kiểm tra 5 quân liên tiếp (Five)
  if (str.includes('11111')) {
    five++;
    return { five, openFour, blockedFour, openThree, blockedThree, openTwo, blockedTwo };
  }

  // 2. Open Four: 011110
  const openFourMatches = str.match(/011110/g);
  if (openFourMatches) openFour += openFourMatches.length;

  // 3. Blocked Four: 211110, 011112, 10111, 11011, 11101, hoặc ở mép bàn cờ
  const blockedFourPatterns = [
    /211110/g,
    /011112/g,
    /10111/g,
    /11011/g,
    /11101/g,
    /^11110/g,
    /01111$/g,
  ];
  for (const pat of blockedFourPatterns) {
    const matches = str.match(pat);
    if (matches) blockedFour += matches.length;
  }

  // 4. Open Three: 01110, 010110, 011010
  const openThreePatterns = [
    /011100/g,
    /001110/g,
    /010110/g,
    /011010/g,
  ];
  for (const pat of openThreePatterns) {
    const matches = str.match(pat);
    if (matches) openThree += matches.length;
  }

  // 5. Blocked Three: 211100, 001112, 210110, 011012, 211010, 010112, 10011, 11001, 10101...
  const blockedThreePatterns = [
    /211100/g,
    /001112/g,
    /210110/g,
    /011012/g,
    /211010/g,
    /010112/g,
    /10011/g,
    /11001/g,
    /10101/g,
    /^11100/g,
    /00111$/g,
  ];
  for (const pat of blockedThreePatterns) {
    const matches = str.match(pat);
    if (matches) blockedThree += matches.length;
  }

  // 6. Open Two: 001100, 01010, 010010
  const openTwoPatterns = [
    /001100/g,
    /01010/g,
    /010010/g,
  ];
  for (const pat of openTwoPatterns) {
    const matches = str.match(pat);
    if (matches) openTwo += matches.length;
  }

  // 7. Blocked Two
  const blockedTwoPatterns = [
    /211000/g,
    /000112/g,
    /210100/g,
    /001012/g,
  ];
  for (const pat of blockedTwoPatterns) {
    const matches = str.match(pat);
    if (matches) blockedTwo += matches.length;
  }

  return { five, openFour, blockedFour, openThree, blockedThree, openTwo, blockedTwo };
}

/**
 * Trích xuất tất cả các hàng, cột, đường chéo từ bàn cờ
 */
function getAllLines(board: BoardMatrix): number[][] {
  const lines: number[][] = [];

  // Hàng ngang (15 hàng)
  for (let r = 0; r < BOARD_SIZE; r++) {
    lines.push([...board[r]]);
  }

  // Hàng dọc (15 cột)
  for (let c = 0; c < BOARD_SIZE; c++) {
    const col: number[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      col.push(board[r][c]);
    }
    lines.push(col);
  }

  // Đường chéo chính (Main Diagonals)
  for (let k = 0; k <= 2 * (BOARD_SIZE - 1); k++) {
    const diag: number[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const c = k - r;
      if (c >= 0 && c < BOARD_SIZE) {
        diag.push(board[r][c]);
      }
    }
    if (diag.length >= 5) lines.push(diag);
  }

  // Đường chéo phụ (Anti Diagonals)
  for (let k = -(BOARD_SIZE - 1); k <= BOARD_SIZE - 1; k++) {
    const diag: number[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const c = r - k;
      if (c >= 0 && c < BOARD_SIZE) {
        diag.push(board[r][c]);
      }
    }
    if (diag.length >= 5) lines.push(diag);
  }

  return lines;
}

/**
 * Tính điểm hình cờ cho 1 đoạn đường thẳng trên toàn bàn cờ
 */
function getBoardLineScore(pat: ReturnType<typeof evaluateLinePattern>): number {
  if (pat.openFour > 0 || pat.blockedFour >= 2) return SCORES.OPEN_FOUR;
  if (pat.blockedFour > 0 && pat.openThree > 0) return SCORES.OPEN_FOUR;
  return (
    pat.blockedFour * SCORES.BLOCKED_FOUR +
    pat.openThree * SCORES.OPEN_THREE +
    pat.blockedThree * SCORES.BLOCKED_THREE +
    pat.openTwo * SCORES.OPEN_TWO +
    pat.blockedTwo * SCORES.BLOCKED_TWO
  );
}

/**
 * Đánh giá điểm tổng thể của toàn bộ bàn cờ cho người chơi (player)
 */
export function evaluateBoardScore(
  board: BoardMatrix,
  aiPlayer: ActivePlayer,
  attackWeight: number,
  defenseWeight: number
): number {
  const oppPlayer: ActivePlayer = aiPlayer === BLACK ? WHITE : BLACK;
  const lines = getAllLines(board);

  let aiScore = 0;
  let oppScore = 0;

  for (const line of lines) {
    // Điểm của AI
    const aiPatterns = evaluateLinePattern(line, aiPlayer);
    if (aiPatterns.five > 0) return SCORES.FIVE;
    aiScore += getBoardLineScore(aiPatterns);

    // Điểm của Đối thủ
    const oppPatterns = evaluateLinePattern(line, oppPlayer);
    if (oppPatterns.five > 0) return -SCORES.FIVE;
    oppScore += getBoardLineScore(oppPatterns);
  }

  return Math.floor(aiScore * attackWeight) - Math.floor(oppScore * defenseWeight);
}

/**
 * Tính điểm cục bộ cho 1 đoạn thẳng quanh vị trí dự kiến đặt quân
 */
function getLocalPatternScore(pat: ReturnType<typeof evaluateLinePattern>): number {
  if (pat.five > 0) return SCORES.FIVE;
  if (pat.openFour > 0) return SCORES.OPEN_FOUR;
  if (pat.blockedFour > 0) return SCORES.BLOCKED_FOUR;
  if (pat.openThree > 0) return SCORES.OPEN_THREE;
  if (pat.blockedThree > 0) return SCORES.BLOCKED_THREE;
  if (pat.openTwo > 0) return SCORES.OPEN_TWO;
  return 0;
}

/**
 * Đánh giá nhanh điểm cục bộ tại 1 vị trí (r, c) để sắp xếp các nước đi ưu tiên (Move Ordering)
 */
export function evaluatePositionScore(
  board: BoardMatrix,
  row: number,
  col: number,
  aiPlayer: ActivePlayer,
  attackWeight: number,
  defenseWeight: number
): number {
  const oppPlayer: ActivePlayer = aiPlayer === BLACK ? WHITE : BLACK;
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  let attackScore = 0;
  let defenseScore = 0;

  // Đánh giá 4 hướng quanh ô này
  for (const dir of directions) {
    // 1. Nếu AI đặt quân vào đây
    board[row][col] = aiPlayer;
    const aiLine = extractLocalLine(board, row, col, dir.dr, dir.dc);
    attackScore += getLocalPatternScore(evaluateLinePattern(aiLine, aiPlayer));

    // 2. Nếu Đối thủ đặt quân vào đây (để chặn đối thủ)
    board[row][col] = oppPlayer;
    const oppLine = extractLocalLine(board, row, col, dir.dr, dir.dc);
    defenseScore += getLocalPatternScore(evaluateLinePattern(oppLine, oppPlayer));
  }

  // Khôi phục lại ô trống
  board[row][col] = EMPTY;

  // Ưu tiên các nước gần tâm bàn cờ hơn một chút
  const center = 7;
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  const centerBonus = Math.max(0, 20 - distFromCenter * 2);

  return Math.floor(attackScore * attackWeight) + Math.floor(defenseScore * defenseWeight) + centerBonus;
}

/**
 * Trích xuất đoạn thẳng cục bộ dài tối đa 9 ô xung quanh vị trí (row, col) theo hướng (dr, dc)
 */
function extractLocalLine(
  board: BoardMatrix,
  row: number,
  col: number,
  dr: number,
  dc: number
): number[] {
  const line: number[] = [];
  // Lấy 4 ô lùi
  for (let step = -4; step <= 4; step++) {
    const r = row + step * dr;
    const c = col + step * dc;
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      line.push(board[r][c]);
    }
  }
  return line;
}
