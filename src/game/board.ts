import { BOARD_SIZE, EMPTY, ActivePlayer, BoardMatrix, WinInfo, Move } from './types';

/**
 * Khởi tạo ma trận bàn cờ 15x15 rỗng
 */
export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
}

/**
 * Sao chép ma trận bàn cờ
 */
export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map(row => [...row]);
}

/**
 * Kiểm tra xem bàn cờ đã đầy chưa (hòa)
 */
export function isBoardFull(board: BoardMatrix): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) return false;
    }
  }
  return true;
}

/**
 * Đếm tổng số quân cờ trên bàn
 */
export function countStones(board: BoardMatrix): number {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) count++;
    }
  }
  return count;
}

/**
 * Kiểm tra chiến thắng: tìm 5 quân liên tiếp cùng màu
 */
export function checkWin(board: BoardMatrix): WinInfo | null {
  const directions: Array<{
    name: 'horizontal' | 'vertical' | 'main_diagonal' | 'anti_diagonal';
    dr: number;
    dc: number;
  }> = [
    { name: 'horizontal', dr: 0, dc: 1 },
    { name: 'vertical', dr: 1, dc: 0 },
    { name: 'main_diagonal', dr: 1, dc: 1 },
    { name: 'anti_diagonal', dr: 1, dc: -1 },
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const player = board[r][c];
      if (player === EMPTY) continue;

      for (const dir of directions) {
        const line: [number, number][] = [[r, c]];
        let count = 1;

        // Đi tiếp theo hướng dr, dc
        let nr = r + dir.dr;
        let nc = c + dir.dc;

        while (
          nr >= 0 &&
          nr < BOARD_SIZE &&
          nc >= 0 &&
          nc < BOARD_SIZE &&
          board[nr][nc] === player
        ) {
          line.push([nr, nc]);
          count++;
          nr += dir.dr;
          nc += dir.dc;
        }

        // Đủ 5 quân liên tiếp trở lên là thắng
        if (count >= 5) {
          return {
            winner: player as ActivePlayer,
            line: line.slice(0, 5),
            direction: dir.name,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Lấy danh sách các ô tiềm năng (nằm gần các quân cờ hiện có trong bán kính radius)
 * Giúp thu hẹp không gian tìm kiếm từ 225 ô xuống còn 10-25 ô chất lượng cao
 */
export function getCandidateMoves(board: BoardMatrix, radius: number = 2): Move[] {
  const hasStone = new Set<string>();
  const candidates = new Set<string>();
  let stoneCount = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) {
        hasStone.add(`${r},${c}`);
        stoneCount++;
      }
    }
  }

  // Nếu bàn cờ hoàn toàn trống, nước đi chuẩn nhất là chính giữa bàn cờ (7, 7)
  if (stoneCount === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    return [{ row: center, col: center }];
  }

  // Quét các ô trống xung quanh mỗi quân cờ trong bán kính radius
  for (const posStr of hasStone) {
    const [r, c] = posStr.split(',').map(Number);
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (board[nr][nc] === EMPTY) {
            candidates.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  return Array.from(candidates).map(str => {
    const [row, col] = str.split(',').map(Number);
    return { row, col };
  });
}
