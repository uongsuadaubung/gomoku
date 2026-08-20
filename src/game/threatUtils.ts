import { BOARD_SIZE, EMPTY, ActivePlayer, BoardMatrix } from './types';

export const BOARD_DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
] as const;

/**
 * Kiểm tra xem một nước đi có tạo thành 5 quân liên tiếp (Ngũ liên - Thắng ngay lập tức) hay không
 */
export function isFive(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r = row + dir.dr;
      let c = col + dir.dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r += dir.dr;
        c += dir.dc;
      }
      r = row - dir.dr;
      c = col - dir.dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r -= dir.dr;
        c -= dir.dc;
      }

      if (count >= 5) {
        return true;
      }
    }
    return false;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem một nước đi có tạo thành 4 quân (Four) hoặc 5 quân (Five) hay không
 */
export function isFourOrFive(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r = row + dir.dr;
      let c = col + dir.dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r += dir.dr;
        c += dir.dc;
      }
      r = row - dir.dr;
      c = col - dir.dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r -= dir.dr;
        c -= dir.dc;
      }

      if (count >= 4) {
        return true;
      }
    }
    return false;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem một nước đi có tạo thành Nước Bốn Mở (Open Four - Cả 2 đầu đều thoáng) hay không
 */
export function isOpenFour(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r1 = row + dir.dr;
      let c1 = col + dir.dc;
      while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
        count++;
        r1 += dir.dr;
        c1 += dir.dc;
      }
      let r2 = row - dir.dr;
      let c2 = col - dir.dc;
      while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
        count++;
        r2 -= dir.dr;
        c2 -= dir.dc;
      }

      if (count === 4) {
        const openHead1 = r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === EMPTY;
        const openHead2 = r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === EMPTY;
        if (openHead1 && openHead2) {
          return true;
        }
      }
    }
    return false;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem một nước đi có tạo thành Nước Ba Mở (Open Three) hay không
 */
export function isOpenThree(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r1 = row + dir.dr;
      let c1 = col + dir.dc;
      while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
        count++;
        r1 += dir.dr;
        c1 += dir.dc;
      }
      let r2 = row - dir.dr;
      let c2 = col - dir.dc;
      while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
        count++;
        r2 -= dir.dr;
        c2 -= dir.dc;
      }

      if (count === 3) {
        const openHead1 = r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === EMPTY;
        const openHead2 = r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === EMPTY;
        if (openHead1 && openHead2) {
          return true;
        }
      }
    }
    return false;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem một nước đi có tạo thành Đòn Bẫy Đôi 4-3 (Four-Three Fork) hay không
 */
export function isFourThreeFork(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    let fourCount = 0;
    let openThreeCount = 0;

    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r1 = row + dir.dr;
      let c1 = col + dir.dc;
      while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
        count++;
        r1 += dir.dr;
        c1 += dir.dc;
      }
      let r2 = row - dir.dr;
      let c2 = col - dir.dc;
      while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
        count++;
        r2 -= dir.dr;
        c2 -= dir.dc;
      }

      if (count >= 4) {
        fourCount++;
      } else if (count === 3) {
        const openHead1 = r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === EMPTY;
        const openHead2 = r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === EMPTY;
        if (openHead1 && openHead2) {
          openThreeCount++;
        }
      }
    }

    return fourCount >= 1 && openThreeCount >= 1;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem một nước đi có tạo thành Song Tam 3-3 (Double Open Three) hay không
 */
export function isDoubleThree(board: BoardMatrix, row: number, col: number, player: ActivePlayer): boolean {
  const original = board[row][col];
  board[row][col] = player;
  try {
    let openThreeCount = 0;

    for (const dir of BOARD_DIRECTIONS) {
      let count = 1;
      let r1 = row + dir.dr;
      let c1 = col + dir.dc;
      while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
        count++;
        r1 += dir.dr;
        c1 += dir.dc;
      }
      let r2 = row - dir.dr;
      let c2 = col - dir.dc;
      while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
        count++;
        r2 -= dir.dr;
        c2 -= dir.dc;
      }

      if (count === 3) {
        const openHead1 = r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === EMPTY;
        const openHead2 = r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === EMPTY;
        if (openHead1 && openHead2) {
          openThreeCount++;
        }
      }
    }

    return openThreeCount >= 2;
  } finally {
    board[row][col] = original;
  }
}

/**
 * Kiểm tra xem nước đi có thuộc giai đoạn khai cuộc kiểm soát trung tâm (<= 4 quân trên bàn, gần tâm) không
 */
export function isOpeningCenterMove(board: BoardMatrix, row: number, col: number): boolean {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) {
        count++;
        if (count > 4) return false;
      }
    }
  }
  return Math.abs(row - 7) <= 3 && Math.abs(col - 7) <= 3;
}

/**
 * Đếm số lượng quân đồng minh xung quanh trong bán kính radius
 */
export function countFriendlyNeighbors(
  board: BoardMatrix,
  row: number,
  col: number,
  player: ActivePlayer,
  radius: number = 2
): number {
  let count = 0;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
        count++;
      }
    }
  }
  return count;
}

