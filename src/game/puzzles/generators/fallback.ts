import { BOARD_SIZE, BLACK, WHITE, ActivePlayer, MoveHistoryItem } from '../../types';
import { createEmptyBoard, cloneBoard } from '../../board';
import { PuzzleScenario, PuzzleType } from '../types';
import { BASE_VCF_SKELETON_POOLS, BASE_VCT_SKELETON_POOLS, BASE_DEFENSE_SKELETON_POOLS } from '../skeletons';
import { PUZZLE_TITLES } from '../templates';
import { getVCFSolutionTrace, getVCTSolutionTrace, hasUnstoppableWhiteThreat } from '../utils/validator';

/**
 * Sinh thế cờ dự phòng chuẩn xác theo từng cấp sao (1 - 7 sao) và thể loại khi quá trình tạo ngẫu nhiên đạt giới hạn số lần thử
 */
export function generateFallbackScenario(
  stars: number = 1,
  puzzleType: PuzzleType = 'VCF'
): PuzzleScenario {
  const targetStars = Math.max(1, Math.min(stars, 7));

  const pool = puzzleType === 'VCT'
    ? (BASE_VCT_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[targetStars])
    : (puzzleType === 'DEFENSE'
      ? (BASE_DEFENSE_SKELETON_POOLS[targetStars] ?? BASE_VCT_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[targetStars])
      : (BASE_VCF_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[1]));

  const seed = (pool && pool.length > 0) ? pool[0] : (BASE_VCF_SKELETON_POOLS[1]?.[0] || []);

  const board = createEmptyBoard();
  const placedStones: Array<{ r: number; c: number; player: ActivePlayer }> = [];

  for (const s of seed) {
    const r = 7 + s.r;
    const c = 7 + s.c;
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      board[r][c] = s.player;
      placedStones.push({ r, c, player: s.player });
    }
  }

  // Bảo đảm hạt giống dự phòng tuyệt đối không có 4 mở hoặc đòn sát cục không thể cản phá cho Trắng
  if (hasUnstoppableWhiteThreat(board)) {
    // Khôi phục về hạt giống an toàn tuyệt đối
    const safeSeed = BASE_VCF_SKELETON_POOLS[1]?.[0] ?? [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = 0;
      }
    }
    placedStones.length = 0;
    for (const s of safeSeed) {
      const r = 7 + s.r;
      const c = 7 + s.c;
      board[r][c] = s.player;
      placedStones.push({ r, c, player: s.player });
    }
  }

  const trace = (puzzleType === 'VCT' || puzzleType === 'DEFENSE')
    ? getVCTSolutionTrace(board, targetStars)
    : getVCFSolutionTrace(board, targetStars);

  const blackStones = placedStones.filter(s => s.player === BLACK);
  const whiteStones = placedStones.filter(s => s.player === WHITE);
  const maxLen = Math.max(blackStones.length, whiteStones.length);
  const fallbackHistory: MoveHistoryItem[] = [];
  let sNum = 1;
  const now = Date.now();

  for (let i = 0; i < maxLen; i++) {
    if (i < blackStones.length) {
      fallbackHistory.push({
        row: blackStones[i].r,
        col: blackStones[i].c,
        player: BLACK,
        stepNumber: sNum++,
        timestamp: now - (maxLen - i) * 2000,
      });
    }
    if (i < whiteStones.length) {
      fallbackHistory.push({
        row: whiteStones[i].r,
        col: whiteStones[i].c,
        player: WHITE,
        stepNumber: sNum++,
        timestamp: now - (maxLen - i) * 2000 + 1000,
      });
    }
  }

  const titles = PUZZLE_TITLES[targetStars] || ['Thế Cờ Tuyệt Kỹ'];
  const title = titles[0] || 'Nhất Kích Tất Sát';

  const solutionMoves: Array<{ row: number; col: number; player: ActivePlayer }> =
    trace.success && trace.attackMoves.length > 0
      ? trace.attackMoves.map(m => ({ row: m.r, col: m.c, player: BLACK }))
      : [{ row: 7, col: 7, player: BLACK }];

  const firstMove = solutionMoves[0];

  return {
    id: `scenario_${puzzleType.toLowerCase()}_${targetStars}star_fallback_${Date.now().toString(36)}`,
    stars: targetStars,
    name: `${title} (Kinh Điển)`,
    description: puzzleType === 'VCT'
      ? `Tạo chuỗi đe dọa liên hoàn VCT ${targetStars} nước dứt điểm ván cờ!`
      : (puzzleType === 'DEFENSE'
        ? `Tìm nước cờ hóa giải đòn hiểm của đối phương và phản kích!`
        : `Tìm chuỗi đòn sát cục liên hoàn VCF ${targetStars} nước dứt điểm ván cờ!`),
    optimalMoves: targetStars,
    initialBoard: cloneBoard(board),
    initialMoveHistory: fallbackHistory,
    playerColor: BLACK,
    puzzleType,
    solutionMoves,
    hints: {
      firstMove: { row: firstMove.row, col: firstMove.col },
      zone: {
        minRow: Math.max(0, firstMove.row - 1),
        maxRow: Math.min(BOARD_SIZE - 1, firstMove.row + 1),
        minCol: Math.max(0, firstMove.col - 1),
        maxCol: Math.min(BOARD_SIZE - 1, firstMove.col + 1),
      },
    },
  };
}
