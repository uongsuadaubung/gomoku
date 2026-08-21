import { describe, it, expect, mock } from 'bun:test';
import { PuzzleStrategy } from '../src/game/strategies/PuzzleStrategy';
import { AI_LEVELS } from '../src/game/constants';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Thế Cờ Giữa Trận (PuzzleStrategy)', () => {
  const strategy = new PuzzleStrategy();

  describe('Cấu hình và Quy tắc Thế Cờ', () => {
    it('Chế độ thế cờ luôn đấu với Bot Cấp cao nhất (Bot Cấp 12)', () => {
      const bot = strategy.getBotLevel();
      expect(bot.id).toBe(12);
      expect(bot.name).toBe(AI_LEVELS[AI_LEVELS.length - 1].name);
    });

    it('Cấm tuyệt đối đi lại (canUndo) để rèn luyện tư duy tính toán', () => {
      expect(strategy.canUndo()).toBe(false);
    });

    it('Hiển thị số nước đi bổ sung chuẩn xác (getMoveCountDisplay)', () => {
      // Ván cờ thế có 10 nước ban đầu, người chơi và AI đi thêm tổng cộng 14 nước -> 4 nước thêm
      expect(strategy.getMoveCountDisplay(14, 10)).toBe('4 nước thêm');
      // Không truyền initialLength -> tính tổng
      expect(strategy.getMoveCountDisplay(6)).toBe('6 nước thêm');
    });

    it('Hiển thị tiêu đề và tóm tắt theo từng kết quả giải thế cờ', () => {
      const winTitle = strategy.getGameOverTitle({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[11],
      });
      expect(winTitle.text).toContain('Giải Thế Cờ Thành Công');

      const lossTitle = strategy.getGameOverTitle({
        won: false,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[11],
      });
      expect(lossTitle.text).toContain('Chưa Giải Được');

      const summary = strategy.getModeSummary({
        won: true,
        draw: false,
        lastResigned: false,
        currentPuzzleName: 'Tam Trùng Tứ Điểm (VCF 3⭐)',
        botConfig: AI_LEVELS[11],
      });
      expect(summary).toBe('Tam Trùng Tứ Điểm (VCF 3⭐)');
    });
  });

  describe('Tiến trình Mở Khóa và Đánh Giá Sao (recordGame)', () => {
    it('Giải thành công thế cờ cùng cấp: thăng cấp sao tiếp theo và đếm solvedByStars', () => {
      let stats = createTestStats();
      // Bắt đầu ở Cấp 1, giải thế cờ 1 sao
      stats = strategy.recordGame(stats, 'win', { stars: 1 });

      expect(stats.puzzle.totalSolved).toBe(1);
      expect(stats.puzzle.currentStreak).toBe(1);
      expect(stats.puzzle.bestStreak).toBe(1);
      expect(stats.puzzle.solvedByStars[1]).toBe(1);
      expect(stats.puzzle.currentLevel).toBe(2); // Đã mở khóa Cấp 2
    });

    it('Giải thành công thế cờ thấp hơn cấp độ hiện tại: không tăng currentLevel', () => {
      let stats = createTestStats({ puzzle: { currentLevel: 4, totalSolved: 3, totalFailed: 0, currentStreak: 3, bestStreak: 3, totalGames: 3, solvedByStars: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 } } });
      // Đang ở cấp 4, giải lại bài 2 sao
      stats = strategy.recordGame(stats, 'win', { stars: 2 });

      expect(stats.puzzle.totalSolved).toBe(4);
      expect(stats.puzzle.solvedByStars[2]).toBe(2);
      expect(stats.puzzle.currentLevel).toBe(4); // Giữ nguyên cấp 4
    });

    it('Cấp độ sao tối đa không vượt quá 7', () => {
      let stats = createTestStats({ puzzle: { currentLevel: 7, totalSolved: 10, totalFailed: 0, currentStreak: 10, bestStreak: 10, totalGames: 10, solvedByStars: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 } } });
      stats = strategy.recordGame(stats, 'win', { stars: 7 });

      expect(stats.puzzle.currentLevel).toBe(7);
    });

    it('Thất bại: tăng totalFailed, reset streak và không bị tụt cấp sao đã mở', () => {
      let stats = createTestStats({ puzzle: { currentLevel: 5, totalSolved: 8, totalFailed: 1, currentStreak: 4, bestStreak: 4, totalGames: 9, solvedByStars: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 0 } } });
      stats = strategy.recordGame(stats, 'loss', { stars: 5 });

      expect(stats.puzzle.totalFailed).toBe(2);
      expect(stats.puzzle.currentStreak).toBe(0);
      expect(stats.puzzle.bestStreak).toBe(4);
      expect(stats.puzzle.currentLevel).toBe(5); // Bảo lưu cấp 5
    });
  });

  describe('Dọn dẹp Ván Cờ Thế sau khi Kết Thúc (GameOver Hooks)', () => {
    it('Xóa active puzzle khi thắng, thua hoặc hòa', () => {
      const mockClear = mock(() => {});
      const baseCtx = {
        botConfig: AI_LEVELS[11],
        oldLevel: 12,
        prevStats: createTestStats(),
        newStats: createTestStats(),
        moveCount: 10,
        hadComeback: false,
        undoCount: 0,
        wasUndoJustUsed: false,
        botEverHadOpenThreat: false,
        isTimeout: false,
        services: {
          clearActivePuzzle: mockClear,
          triggerTaunt: () => {},
        },
      };

      strategy.onPlayerWin(baseCtx as any);
      expect(mockClear).toHaveBeenCalledTimes(1);

      strategy.onBotWin(baseCtx as any);
      expect(mockClear).toHaveBeenCalledTimes(2);

      strategy.onDraw(baseCtx as any);
      expect(mockClear).toHaveBeenCalledTimes(3);
    });
  });
});
