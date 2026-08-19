import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, BoardMatrix, MoveHistoryItem } from './types';
import { createEmptyBoard, cloneBoard, checkWin } from './board';
import { solveVCF } from './vcf';

export type PuzzleDifficulty = number;

export interface PuzzleScenario {
  id: string;
  stars: number;
  name: string;
  description: string;
  optimalMoves: number;
  initialBoard: BoardMatrix;
  initialMoveHistory: MoveHistoryItem[];
  playerColor: ActivePlayer;
}

// Hàm kiểm định chính xác lời giải VCF theo thời gian thực (On-the-fly validation)
function verifyVCFSolution(initialBoard: BoardMatrix, targetStars: number): { success: boolean; moves: number } {
  const b = cloneBoard(initialBoard);
  let moves = 0;

  while (moves < targetStars + 2) {
    const move = solveVCF(b, BLACK, 12);
    if (!move) return { success: false, moves };

    b[move.row][move.col] = BLACK;
    moves++;

    const win = checkWin(b);
    if (win) {
      return { success: moves === targetStars, moves };
    }

    const blocks: { r: number; c: number }[] = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (b[r][c] === 0) {
          b[r][c] = BLACK;
          if (checkWin(b)) blocks.push({ r, c });
          b[r][c] = 0;
        }
      }
    }

    if (blocks.length === 0 || blocks.length >= 2) {
      return { success: moves + 1 === targetStars, moves: moves + 1 };
    } else {
      b[blocks[0].r][blocks[0].c] = WHITE;
    }
  }

  return { success: false, moves };
}

// 8 phép biến đổi không gian ngẫu nhiên
function applyRandomSymmetry(stones: Array<{ r: number; c: number; player: ActivePlayer }>): Array<{ r: number; c: number; player: ActivePlayer }> {
  const sym = Math.floor(Math.random() * 8);
  const shouldFlip = sym >= 4;
  const rot = sym % 4;

  return stones.map(s => {
    let r = s.r;
    let c = shouldFlip ? -s.c : s.c;

    // Phép quay tọa độ 0°, 90°, 180°, 270°
    if (rot === 1) [r, c] = [c, -r];
    else if (rot === 2) [r, c] = [-r, -c];
    else if (rot === 3) [r, c] = [-c, r];

    return { r, c, player: s.player };
  });
}

// Bộ khung hạt giống chuẩn mực 1 - 7 sao
const BASE_SKELETONS: Record<number, Array<{ r: number; c: number; player: ActivePlayer }>> = {
  1: [
    { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK },
    { r: 0, c: 1, player: BLACK }, { r: 0, c: 2, player: BLACK },
    { r: 0, c: -3, player: WHITE }, { r: 0, c: 3, player: WHITE },
    { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
  ],
  2: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: 4, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
  ],
  3: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: 3, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
    { r: 2, c: 1, player: WHITE },
  ],
  4: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
    { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 4, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
    { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE },
  ],
  5: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
    { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
    { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: BLACK }, { r: 4, c: -1, player: WHITE }, { r: 4, c: 6, player: WHITE },
    { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
    { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE },
  ],
  6: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
    { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
    { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: WHITE }, { r: 4, c: -2, player: WHITE },
    { r: -2, c: 0, player: BLACK }, { r: -3, c: 0, player: WHITE },
    { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
    { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE }, { r: 2, c: -1, player: WHITE },
  ],
  7: [
    { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
    { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
    { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
    { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: WHITE }, { r: 4, c: -2, player: WHITE },
    { r: 3, c: -1, player: BLACK }, { r: 1, c: -3, player: BLACK }, { r: 5, c: 1, player: WHITE },
    { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
    { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE },
    { r: 2, c: -1, player: WHITE }, { r: 3, c: -3, player: WHITE },
  ],
};

const PUZZLE_TITLES: Record<number, string[]> = {
  1: ['Nhất Kích Tất Sát', 'Đoạt Mệnh Trực Tung', 'Tà Phong Trảm', 'Đoạn Kim Quyết', 'Phi Long Tại Thiên', 'Bạch Hổ Xuất Sơn', 'Lôi Đình Vạn Quân'],
  2: ['Song Đao Hợp Bích', 'Gọng Kìm Chữ V', 'Giao Tiễn Đoạt Hồn', 'Lưỡng Nghi Phân Định', 'Song Long Hí Châu', 'Âm Dương Hợp Nhất', 'Song Kiếm Hợp Bích'],
  3: ['Tam Tiên Quy Đạo', 'Tam Xoa Kích', 'Tam Tuyệt Kiếm', 'Tam Tinh Tụ Đỉnh', 'Tam Giác Trận Đồ', 'Tam Thể Hợp Nhất', 'Tam Long Xuất Hải'],
  4: ['Tứ Tượng Quần Ma', 'Tứ Hải Giao Phong', 'Tứ Trận Hợp Long', 'Tứ Linh Quy Vị', 'Tứ Phương Thần Trận', 'Tứ Kiếm Tru Tiên', 'Tứ Cực Hợp Kích'],
  5: ['Ngũ Long Tuyệt Sát', 'Ngũ Hành Bát Quái', 'Ngũ Hổ Vồ Mồi', 'Ngũ Lôi Oanh Đỉnh', 'Ngũ Tinh Liên Châu', 'Ngũ Thần Tụ Hội', 'Ngũ Ma Loạn Thế'],
  6: ['Lục Trận Hợp Kích', 'Lục Hợp Bát Hoang', 'Lục Ma Tuyệt Kỹ', 'Lục Đạo Luân Hồi', 'Lục Tinh Thần Trận', 'Lục Kiếm Trảm Tiên', 'Lục Tuyệt Thần Công'],
  7: ['Thất Tinh Bắc Đẩu', 'Thất Kiếm Trảm Yêu', 'Thất Tuyệt Trận Đồ', 'Thất Diệt Ma Công', 'Thất Sát Phá Quân', 'Thất Long Quy Tụ', 'Thất Trảm Vô Song'],
};

/**
 * Sinh thế cờ chiến thuật ngẫu nhiên 100% On-the-fly và kiểm định VCF tức thì trước khi xuất xưởng
 */
export function generateTacticalScenario(requestedStars: number = 1): PuzzleScenario {
  const targetStars = Math.max(1, Math.min(requestedStars, 7));

  for (let attempt = 1; attempt <= 20; attempt++) {
    const rawStones = BASE_SKELETONS[targetStars] || BASE_SKELETONS[1];
    const transformed = applyRandomSymmetry(rawStones);

    // Dời tâm ngẫu nhiên (-1 đến +1)
    const centerRow = 7 + (Math.floor(Math.random() * 3) - 1);
    const centerCol = 7 + (Math.floor(Math.random() * 3) - 1);

    const board = createEmptyBoard();
    const moveHistory: MoveHistoryItem[] = [];
    let stepNumber = 1;
    let outOfBounds = false;

    for (const s of transformed) {
      const finalR = centerRow + s.r;
      const finalC = centerCol + s.c;

      if (finalR < 0 || finalR >= BOARD_SIZE || finalC < 0 || finalC >= BOARD_SIZE) {
        outOfBounds = true;
        break;
      }

      board[finalR][finalC] = s.player;
      moveHistory.push({
        row: finalR,
        col: finalC,
        player: s.player,
        stepNumber: stepNumber++,
        timestamp: Date.now() - (transformed.length - stepNumber) * 1000,
      });
    }

    if (outOfBounds) continue;

    // Xác thực bằng bộ giải VCF tức thì
    const verify = verifyVCFSolution(board, targetStars);
    if (verify.success) {
      // Bổ sung 1-2 quân cờ nhiễu tự nhiên
      const decoyCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < decoyCount; i++) {
        const dr = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.floor(Math.random() * 2));
        const dc = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.floor(Math.random() * 2));
        const decoyR = centerRow + dr;
        const decoyC = centerCol + dc;
        if (
          decoyR >= 0 && decoyR < BOARD_SIZE &&
          decoyC >= 0 && decoyC < BOARD_SIZE &&
          board[decoyR][decoyC] === EMPTY
        ) {
          const decoyPlayer: ActivePlayer = i % 2 === 0 ? WHITE : BLACK;
          board[decoyR][decoyC] = decoyPlayer;
          moveHistory.push({
            row: decoyR,
            col: decoyC,
            player: decoyPlayer,
            stepNumber: stepNumber++,
            timestamp: Date.now(),
          });
        }
      }

      const titles = PUZZLE_TITLES[targetStars] || ['Thế Cờ Chiến Thuật'];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const id = `scenario_${targetStars}star_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      return {
        id,
        stars: requestedStars,
        name: requestedStars > 7 ? `Thế Cờ Đỉnh Cao Mức ${requestedStars}` : `${title} #${Math.floor(Math.random() * 900) + 100}`,
        description: requestedStars > 7
          ? `Thử thách cực hạn dành cho cao thủ Mức ${requestedStars}! Tìm đòn sát cục dứt điểm ván cờ.`
          : `Tìm chuỗi đòn sát cục liên hoàn dứt điểm ván cờ!`,
        optimalMoves: targetStars,
        initialBoard: cloneBoard(board),
        initialMoveHistory: moveHistory,
        playerColor: BLACK,
      };
    }
  }

  // Fallback khẩn cấp nếu quá 20 lần thử (gần như không bao giờ chạm tới)
  return {
    id: `fallback_${Date.now()}`,
    stars: requestedStars,
    name: 'Nhất Kích Tất Sát',
    description: 'Tìm đòn sát cục dứt điểm ngay lập tức.',
    optimalMoves: 1,
    initialBoard: createEmptyBoard(),
    initialMoveHistory: [],
    playerColor: BLACK,
  };
}
