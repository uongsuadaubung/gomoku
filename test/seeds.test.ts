import { describe, it, expect } from 'bun:test';
import { createEmptyBoard } from '../src/game/board';
import {
  getVCFSolutionTrace,
  getVCTSolutionTrace,
  hasImmediateWhiteThreat,
  hasUnstoppableWhiteThreat,
  countWinningMoves,
} from '../src/game/puzzles/utils/validator';
import {
  BASE_VCF_SKELETON_POOLS,
  BASE_VCT_SKELETON_POOLS,
  BASE_DEFENSE_SKELETON_POOLS,
} from '../src/game/puzzles/skeletons';
import { generateTacticalScenario } from '../src/game/puzzles/generators/tacticalGenerator';
import { generateFallbackScenario } from '../src/game/puzzles/generators/fallback';
import { SkeletonPattern } from '../src/game/puzzles/types';
import { BLACK, WHITE } from '../src/game/types';

/**
 * Helper tạo bàn cờ từ hạt giống tại tâm (7, 7)
 */
function createBoardFromSkeleton(skeleton: SkeletonPattern) {
  const board = createEmptyBoard();
  for (const stone of skeleton) {
    const r = 7 + stone.r;
    const c = 7 + stone.c;
    board[r][c] = stone.player;
  }
  return board;
}

describe('Kiểm Định Kho Hạt Giống Chiến Thuật (Tactical Seeds)', () => {
  // 1. KIỂM THỬ KHO VCF (1 ĐẾN 7 SAO)
  describe('VCF Seeds (Victory of Continuous Fours)', () => {
    for (let stars = 1; stars <= 7; stars++) {
      const pool = BASE_VCF_SKELETON_POOLS[stars] || [];

      it(`VCF ${stars}⭐: Tất cả ${pool.length} hạt giống phải giải được trong đúng ${stars} nước VCF`, () => {
        expect(pool.length).toBeGreaterThan(0);

        pool.forEach((skeleton, index) => {
          const board = createBoardFromSkeleton(skeleton);
          const trace = getVCFSolutionTrace(board, stars);

          expect(trace.success).toBeTrue();
          expect(trace.moves).toBe(stars);
          expect(trace.attackMoves.length).toBeGreaterThanOrEqual(1);
        });
      });
    }
  });

  // 2. KIỂM THỬ KHO VCT (1 ĐẾN 3 SAO)
  describe('VCT Seeds (Victory of Continuous Threats)', () => {
    for (let stars = 1; stars <= 3; stars++) {
      const pool = BASE_VCT_SKELETON_POOLS[stars] || [];

      it(`VCT ${stars}⭐: Tất cả ${pool.length} hạt giống phải giải được trong đúng ${stars} nước VCT`, () => {
        expect(pool.length).toBeGreaterThan(0);

        pool.forEach((skeleton, index) => {
          const board = createBoardFromSkeleton(skeleton);
          const trace = getVCTSolutionTrace(board, stars);

          expect(trace.success).toBeTrue();
          expect(trace.moves).toBe(stars);
          expect(trace.attackMoves.length).toBeGreaterThanOrEqual(1);
        });
      });
    }
  });

  // 3. KIỂM THỬ KHO DEFENSE
  describe('DEFENSE Seeds (Phòng Thủ & Phản Kích)', () => {
    it('DEFENSE 1⭐: Tất cả hạt giống phòng thủ phải hóa giải và dứt điểm trong 1 nước', () => {
      const pool = BASE_DEFENSE_SKELETON_POOLS[1] || [];
      expect(pool.length).toBeGreaterThan(0);

      pool.forEach((skeleton, index) => {
        const board = createBoardFromSkeleton(skeleton);
        expect(hasImmediateWhiteThreat(board)).toBeTrue();

        const trace = getVCTSolutionTrace(board, 1);
        expect(trace.success).toBeTrue();
        expect(trace.moves).toBe(1);
        expect(trace.attackMoves.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('DEFENSE 2⭐: Tất cả hạt giống phòng thủ 2 sao phải hóa giải và phản công trong đúng 2 nước', () => {
      const pool = BASE_DEFENSE_SKELETON_POOLS[2] || [];
      expect(pool.length).toBeGreaterThan(0);

      pool.forEach((skeleton, index) => {
        const board = createBoardFromSkeleton(skeleton);
        expect(hasImmediateWhiteThreat(board)).toBeTrue();

        const trace = getVCTSolutionTrace(board, 2);
        expect(trace.success).toBeTrue();
        expect(trace.moves).toBe(2);
        expect(trace.attackMoves.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // 4. KIỂM THỬ THUẬT TOÁN FALLBACK CHUẨN XÁC THEO CẤP SAO
  describe('Fallback Scenario Generator (1⭐ đến 7⭐)', () => {
    for (let star = 1; star <= 7; star++) {
      it(`Fallback VCF ${star}⭐ phải có optimalMoves = ${star} và solutionMoves hợp lệ`, () => {
        const fallback = generateFallbackScenario(star, 'VCF');
        expect(fallback.stars).toBe(star);
        expect(fallback.optimalMoves).toBe(star);
        expect(fallback.solutionMoves?.length).toBeGreaterThanOrEqual(1);
        expect(fallback.hints?.firstMove).toBeDefined();

        const trace = getVCFSolutionTrace(fallback.initialBoard, star);
        expect(trace.success).toBeTrue();
        expect(trace.moves).toBe(star);
      });
    }
  });

  // 5. KIỂM THỬ PHÁT HIỆN HIỂM HỌA (WHITE THREAT DETECTION)
  describe('White Threat Detection (hasImmediateWhiteThreat)', () => {
    it('Phát hiện chính xác nước thắng 5 ngay lập tức của Trắng', () => {
      const board = createEmptyBoard();
      board[7][5] = WHITE;
      board[7][6] = WHITE;
      board[7][7] = WHITE;
      board[7][8] = WHITE;
      expect(hasImmediateWhiteThreat(board)).toBeTrue();
    });

    it('Phát hiện chính xác nước 3 mở (Open Three) có thể thành Open 4 của Trắng', () => {
      const board = createEmptyBoard();
      board[7][6] = WHITE;
      board[7][7] = WHITE;
      board[7][8] = WHITE;
      expect(hasImmediateWhiteThreat(board)).toBeTrue();
    });

    it('Trả về false khi Trắng không có đe dọa sát sườn', () => {
      const board = createEmptyBoard();
      board[7][7] = WHITE;
      board[8][8] = BLACK;
      expect(hasImmediateWhiteThreat(board)).toBeFalse();
    });
  });

  // 6. KIỂM THỬ THUẬT TOÁN SINH THẾ CỜ (TACTICAL GENERATOR)
  describe('Tactical Scenario Generator Integration', () => {
    it('Sinh ngẫu nhiên thế cờ VCF 1-7 sao với lời giải chuẩn xác', () => {
      for (let star = 1; star <= 7; star++) {
        const scenario = generateTacticalScenario({ stars: star, type: 'VCF' });
        expect(scenario.stars).toBe(star);
        expect(scenario.puzzleType).toBe('VCF');
        expect(scenario.initialMoveHistory.length).toBeGreaterThan(0);
        expect(scenario.solutionMoves?.length).toBeGreaterThanOrEqual(1);

        const trace = getVCFSolutionTrace(scenario.initialBoard, star);
        expect(trace.success).toBeTrue();
        expect(trace.moves).toBe(star);
      }
    });

    it('Sinh ngẫu nhiên thế cờ VCT 1-2 sao với lời giải chuẩn xác', () => {
      for (let star = 1; star <= 2; star++) {
        const scenario = generateTacticalScenario({ stars: star, type: 'VCT' });
        expect(scenario.stars).toBe(star);
        expect(scenario.puzzleType).toBe('VCT');
        expect(scenario.solutionMoves?.length).toBeGreaterThanOrEqual(1);

        const trace = getVCTSolutionTrace(scenario.initialBoard, star);
        expect(trace.success).toBeTrue();
        expect(trace.moves).toBe(star);
      }
    });

    it('Sinh ngẫu nhiên thế cờ DEFENSE 1 sao với lời giải chuẩn xác và bảo toàn đe dọa', () => {
      const scenario = generateTacticalScenario({ stars: 1, type: 'DEFENSE' });
      expect(scenario.stars).toBe(1);
      expect(scenario.puzzleType).toBe('DEFENSE');
      expect(scenario.hints?.firstMove).toBeDefined();
      expect(hasImmediateWhiteThreat(scenario.initialBoard)).toBeTrue();

      const trace = getVCTSolutionTrace(scenario.initialBoard, 1);
      expect(trace.success).toBeTrue();
      expect(trace.moves).toBe(1);
    });

    it('Lịch sử nước đi (initialMoveHistory) có số thứ tự tăng dần và mốc thời gian hợp lệ', () => {
      const scenario = generateTacticalScenario({ stars: 2 });
      const history = scenario.initialMoveHistory;
      expect(history.length).toBeGreaterThan(0);

      for (let i = 0; i < history.length; i++) {
        expect(history[i].stepNumber).toBe(i + 1);
        if (i > 0) {
          expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
        }
      }
    });

    it('Tuyệt đối KHÔNG BAO GIỜ sinh map có 4 mở hoặc đòn thắng không thể cản phá cho Bot (Trắng)', () => {
      for (let i = 0; i < 6; i++) {
        const scenarioVCF = generateTacticalScenario({ stars: (i % 3) + 1, type: 'VCF' });
        const scenarioVCT = generateTacticalScenario({ stars: (i % 2) + 1, type: 'VCT' });
        const scenarioDEF = generateTacticalScenario({ stars: 1, type: 'DEFENSE' });

        expect(hasUnstoppableWhiteThreat(scenarioVCF.initialBoard)).toBeFalse();
        expect(hasUnstoppableWhiteThreat(scenarioVCT.initialBoard)).toBeFalse();
        expect(hasUnstoppableWhiteThreat(scenarioDEF.initialBoard)).toBeFalse();

        // Đối với thế cờ DEFENSE: Nước đầu tiên của người chơi phải hóa giải hoàn toàn nước thắng của Bot
        if (scenarioDEF.solutionMoves && scenarioDEF.solutionMoves.length > 0) {
          const m = scenarioDEF.solutionMoves[0];
          const b = scenarioDEF.initialBoard.map(row => [...row]);
          b[m.row][m.col] = 1; // BLACK
          expect(countWinningMoves(b, 2)).toBe(0); // WHITE (Bot) không còn bất kỳ nước thắng nào
        }
      }
    });

    it('Hỗ trợ đầy đủ các mức độ phân bổ mật độ quân (sparse, normal, dense)', () => {
      const sparse = generateTacticalScenario({ stars: 1, density: 'sparse' });
      const normal = generateTacticalScenario({ stars: 1, density: 'normal' });
      const dense = generateTacticalScenario({ stars: 1, density: 'dense' });

      expect(sparse.initialMoveHistory.length).toBeGreaterThan(0);
      expect(normal.initialMoveHistory.length).toBeGreaterThan(0);
      expect(dense.initialMoveHistory.length).toBeGreaterThan(0);
    });
  });
});
