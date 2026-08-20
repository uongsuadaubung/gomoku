import { describe, it, expect } from 'bun:test';
import { BlitzStrategy } from '../src/game/strategies/BlitzStrategy';
import { UserStats } from '../src/game/types';

describe('Kiểm thử Chiến Lược Cờ Chớp (BlitzStrategy)', () => {
  const blitzStrategy = new BlitzStrategy();

  const createInitialStats = (): UserStats => ({
    campaign: { wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, totalGames: 0 },
    puzzle: { currentLevel: 1, totalSolved: 0, totalFailed: 0, currentStreak: 0, bestStreak: 0, totalGames: 0, solvedByStars: {} },
    custom: { wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, totalGames: 0, byBotLevel: {} },
    blitz: {
      currentLevel: 1,
      highestLevel: 1,
      totalWins: 0,
      totalLosses: 0,
      timeoutLosses: 0,
      bestStreak: 0,
      currentStreak: 0,
      totalGames: 0,
      selectedTimeSeconds: 10,
    },
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    manualLevel: null,
  });

  it('Bắt đầu ở Bot Level 1 (Vỡ Lòng)', () => {
    const stats = createInitialStats();
    const bot = blitzStrategy.getBotLevel(stats);
    expect(bot.id).toBe(1);
    expect(blitzStrategy.canUndo()).toBe(false);
  });

  it('Thắng trận sẽ tăng Level lên 2 và cập nhật chuỗi thắng', () => {
    let stats = createInitialStats();
    stats = blitzStrategy.recordGame(stats, 'win', { timeSeconds: 10 });

    expect(stats.blitz.currentLevel).toBe(2);
    expect(stats.blitz.highestLevel).toBe(1); // Đã vượt qua cấp 1
    expect(stats.blitz.totalWins).toBe(1);
    expect(stats.blitz.currentStreak).toBe(1);
    expect(stats.blitz.bestStreak).toBe(1);

    const nextBot = blitzStrategy.getBotLevel(stats);
    expect(nextBot.id).toBe(2);
  });

  it('Thua trận sẽ kết thúc chuỗi sinh tử và reset Level về 1', () => {
    let stats = createInitialStats();
    // Thắng 3 trận liên tiếp (Lv 1 -> 2 -> 3 -> 4)
    stats = blitzStrategy.recordGame(stats, 'win');
    stats = blitzStrategy.recordGame(stats, 'win');
    stats = blitzStrategy.recordGame(stats, 'win');

    expect(stats.blitz.currentLevel).toBe(4);
    expect(stats.blitz.highestLevel).toBe(3);
    expect(stats.blitz.currentStreak).toBe(3);
    expect(stats.blitz.bestStreak).toBe(3);

    // Thua trận do cháy giờ (Timeout)
    stats = blitzStrategy.recordGame(stats, 'loss', { isTimeout: true });
    expect(stats.blitz.currentLevel).toBe(1); // Reset về 1
    expect(stats.blitz.highestLevel).toBe(3); // Giữ kỷ lục cao nhất
    expect(stats.blitz.currentStreak).toBe(0);
    expect(stats.blitz.timeoutLosses).toBe(1);
    expect(stats.blitz.totalLosses).toBe(1);
  });
});
