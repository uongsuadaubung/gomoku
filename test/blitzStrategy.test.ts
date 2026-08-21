import { describe, it, expect, mock } from 'bun:test';
import { BlitzStrategy } from '../src/game/strategies/BlitzStrategy';
import { BLACK } from '../src/game/types';
import { AI_LEVELS } from '../src/game/constants';
import { createEmptyBoard } from '../src/game/board';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Cờ Chớp Sinh Tử (BlitzStrategy)', () => {
  const strategy = new BlitzStrategy();

  describe('Cấu hình và Quy tắc Cờ Chớp', () => {
    it('Bắt đầu ở Bot Level 1 (Vỡ Lòng)', () => {
      const stats = createTestStats();
      const bot = strategy.getBotLevel({ stats });
      expect(bot.id).toBe(1);
    });

    it('Cấm tuyệt đối đi lại (canUndo) trong chế độ Cờ Chớp', () => {
      expect(strategy.canUndo()).toBe(false);
    });

    it('Hiển thị tiêu đề và mô tả kết thúc ván phù hợp với từng trạng thái', () => {
      // 1. Thắng trận
      const winTitle = strategy.getGameOverTitle({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[0],
      });
      expect(winTitle.text).toContain('Vượt Cấp Cờ Chớp');

      // 2. Cháy giờ (Timeout)
      const timeoutTitle = strategy.getGameOverTitle({
        won: false,
        draw: false,
        lastResigned: false,
        isBlitzTimeout: true,
        botConfig: AI_LEVELS[0],
      });
      expect(timeoutTitle.text).toContain('Cháy Giờ (Timeout)');

      // 3. Thua bình thường
      const lossDesc = strategy.getGameOverDescription({
        won: false,
        draw: false,
        lastResigned: false,
        isBlitzTimeout: false,
        botConfig: AI_LEVELS[0],
      });
      expect(lossDesc).toContain('Chuỗi sinh tử kết thúc');
    });

    it('Hiển thị thông tin tóm tắt chế độ có thời gian và cấp độ (getModeSummary)', () => {
      const summary = strategy.getModeSummary({
        won: true,
        draw: false,
        lastResigned: false,
        blitzTimeLimit: 15,
        botConfig: AI_LEVELS[2], // Level 3
      });
      expect(summary).toBe('Cờ Chớp (15s - Cấp 3)');
    });
  });

  describe('Tiến trình Leo Tháp Sinh Tử (recordGame)', () => {
    it('Thắng trận sẽ tăng Level lên 2, cập nhật kỷ lục highestLevel và thời gian chọn', () => {
      let stats = createTestStats();
      stats = strategy.recordGame(stats, 'win', { timeSeconds: 15 });

      expect(stats.blitz.currentLevel).toBe(2);
      expect(stats.blitz.highestLevel).toBe(1); // Đã vượt qua cấp 1
      expect(stats.blitz.totalWins).toBe(1);
      expect(stats.blitz.currentStreak).toBe(1);
      expect(stats.blitz.bestStreak).toBe(1);
      expect(stats.blitz.selectedTimeSeconds).toBe(15);

      const nextBot = strategy.getBotLevel({ stats });
      expect(nextBot.id).toBe(2);
    });

    it('Thua trận sẽ kết thúc chuỗi sinh tử và reset Level về 1', () => {
      let stats = createTestStats();
      // Thắng 3 trận liên tiếp (Lv 1 -> 2 -> 3 -> 4)
      stats = strategy.recordGame(stats, 'win');
      stats = strategy.recordGame(stats, 'win');
      stats = strategy.recordGame(stats, 'win');

      expect(stats.blitz.currentLevel).toBe(4);
      expect(stats.blitz.highestLevel).toBe(3);
      expect(stats.blitz.currentStreak).toBe(3);
      expect(stats.blitz.bestStreak).toBe(3);

      // Thua trận do cháy giờ (Timeout)
      stats = strategy.recordGame(stats, 'loss', { isTimeout: true });
      expect(stats.blitz.currentLevel).toBe(1); // Reset về 1
      expect(stats.blitz.highestLevel).toBe(3); // Giữ kỷ lục cao nhất
      expect(stats.blitz.currentStreak).toBe(0);
      expect(stats.blitz.timeoutLosses).toBe(1);
      expect(stats.blitz.totalLosses).toBe(1);
    });

    it('Không vượt quá Cấp 12 tối đa khi thắng liên tục', () => {
      let stats = createTestStats({ blitz: { currentLevel: 12, highestLevel: 11, totalWins: 11, totalLosses: 0, timeoutLosses: 0, bestStreak: 11, currentStreak: 11, totalGames: 11, selectedTimeSeconds: 10 } });
      stats = strategy.recordGame(stats, 'win');
      expect(stats.blitz.currentLevel).toBe(12);
      expect(stats.blitz.highestLevel).toBe(12);
    });
  });

  describe('Vòng Đời Đếm Giờ Cờ Chớp (Timer Lifecycle Hooks)', () => {
    it('Tự động khởi động đồng hồ đếm ngược khi người chơi cầm Đen bắt đầu ván', () => {
      const mockStartTimer = mock(() => {});
      const board = createEmptyBoard();

      strategy.onGameStart({
        lastGameResult: null,
        botConfig: AI_LEVELS[0],
        board,
        playerColor: BLACK,
        services: {
          startBlitzTimer: mockStartTimer,
        },
      });

      expect(mockStartTimer).toHaveBeenCalledTimes(1);
    });

    it('Tự động chạy đồng hồ ở lượt người chơi và dừng khi người chơi đã hạ cờ', () => {
      const mockStartTimer = mock(() => {});
      const mockStopTimer = mock(() => {});
      const board = createEmptyBoard();

      // Vào lượt người chơi
      strategy.onPlayerTurnStart({
        board,
        playerColor: BLACK,
        services: {
          startBlitzTimer: mockStartTimer,
        },
      });
      expect(mockStartTimer).toHaveBeenCalledTimes(1);

      // Người chơi hạ cờ
      strategy.onPlayerMove({
        previousBoard: board,
        currentBoard: board,
        move: { row: 7, col: 7 },
        playerColor: BLACK,
        services: {
          stopBlitzTimer: mockStopTimer,
        },
      });
      expect(mockStopTimer).toHaveBeenCalledTimes(1);
    });
  });
});
