import { describe, it, expect, mock } from 'bun:test';
import { CampaignStrategy } from '../src/game/strategies/CampaignStrategy';
import { BLACK, WHITE } from '../src/game/types';
import { AI_LEVELS } from '../src/game/constants';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Chiến Dịch (CampaignStrategy)', () => {
  const strategy = new CampaignStrategy();

  describe('Xác định Cấp Độ Bot (getBotLevel)', () => {
    it('Xác định cấp độ tự động theo số trận thắng khi manualLevel = null', () => {
      // 0 trận thắng -> Cấp 1 (Vỡ Lòng, minWins: 0)
      const stats1 = createTestStats({ campaign: { wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0, totalGames: 0 } });
      expect(strategy.getBotLevel({ stats: stats1 }).id).toBe(1);

      // 4 trận thắng -> Cấp 2 (Tân Thủ, minWins: 3, maxWins: 5)
      const stats2 = createTestStats({ campaign: { wins: 4, losses: 0, draws: 0, currentStreak: 4, bestStreak: 4, totalGames: 4 } });
      expect(strategy.getBotLevel({ stats: stats2 }).id).toBe(2);

      // 35 trận thắng -> Cấp 12 (Thần Cờ, minWins: 33)
      const stats12 = createTestStats({ campaign: { wins: 35, losses: 0, draws: 0, currentStreak: 35, bestStreak: 35, totalGames: 35 } });
      expect(strategy.getBotLevel({ stats: stats12 }).id).toBe(12);
    });

    it('Ưu tiên manualLevel khi người chơi chọn cấp độ cố định', () => {
      // 100 trận thắng nhưng đặt manualLevel = 3 -> vẫn trả về Cấp 3
      const stats = createTestStats({
        manualLevel: 3,
        campaign: { wins: 100, losses: 0, draws: 0, currentStreak: 10, bestStreak: 50, totalGames: 100 },
      });
      expect(strategy.getBotLevel({ stats }).id).toBe(3);
    });
  });

  describe('Tính năng và Cấu hình Trận Đấu', () => {
    it('Cho phép đi lại (canUndo) trong chế độ Chiến Dịch', () => {
      expect(strategy.canUndo()).toBe(true);
    });

    it('Luân phiên đổi màu quân sau mỗi ván cờ (getNextSeriesPlayerSide)', () => {
      expect(strategy.getNextSeriesPlayerSide({ currentPlayerColor: BLACK })).toBe(false); // Đen -> Trắng (false)
      expect(strategy.getNextSeriesPlayerSide({ currentPlayerColor: WHITE })).toBe(true);  // Trắng -> Đen (true)
    });

    it('Hiển thị thông tin tóm tắt chế độ chuẩn xác (getModeSummary)', () => {
      const summary = strategy.getModeSummary({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[0],
      });
      expect(summary).toBe(`Chiến Dịch (Bot ${AI_LEVELS[0].vietnameseName})`);
    });
  });

  describe('Ghi nhận Kết Quả Trận Đấu (recordGame)', () => {
    it('Thắng trận: tăng wins, currentStreak, bestStreak, totalGames và đồng bộ cấp cao', () => {
      let stats = createTestStats();
      stats = strategy.recordGame(stats, 'win');

      expect(stats.campaign.wins).toBe(1);
      expect(stats.campaign.currentStreak).toBe(1);
      expect(stats.campaign.bestStreak).toBe(1);
      expect(stats.campaign.totalGames).toBe(1);

      // Đồng bộ trường cấp cao
      expect(stats.wins).toBe(1);
      expect(stats.currentStreak).toBe(1);
      expect(stats.bestStreak).toBe(1);
      expect(stats.totalGames).toBe(1);
    });

    it('Thua trận: tăng losses, reset currentStreak về 0, giữ nguyên bestStreak', () => {
      let stats = createTestStats();
      // Thắng 3 trận liên tiếp
      stats = strategy.recordGame(stats, 'win');
      stats = strategy.recordGame(stats, 'win');
      stats = strategy.recordGame(stats, 'win');
      expect(stats.campaign.currentStreak).toBe(3);
      expect(stats.campaign.bestStreak).toBe(3);

      // Thua 1 trận
      stats = strategy.recordGame(stats, 'loss');
      expect(stats.campaign.losses).toBe(1);
      expect(stats.campaign.currentStreak).toBe(0);
      expect(stats.campaign.bestStreak).toBe(3);
      expect(stats.campaign.totalGames).toBe(4);

      // Đồng bộ cấp cao
      expect(stats.losses).toBe(1);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(3);
      expect(stats.totalGames).toBe(4);
    });

    it('Hòa trận: tăng draws và totalGames, giữ nguyên streak', () => {
      let stats = createTestStats();
      stats = strategy.recordGame(stats, 'draw');

      expect(stats.campaign.draws).toBe(1);
      expect(stats.campaign.totalGames).toBe(1);
      expect(stats.draws).toBe(1);
      expect(stats.totalGames).toBe(1);
    });
  });

  describe('Sự kiện Thăng Cấp (onPlayerWin)', () => {
    it('Kích hoạt thông báo Level Up khi lên cấp mới ở chế độ tự động (manualLevel === null)', () => {
      const mockSetTimeout = mock((fn: () => void) => fn());
      const mockPlaySound = mock(() => {});
      const mockSetAlert = mock(() => {});
      const mockTriggerTaunt = mock(() => {});

      // oldLevel = 1, newStats wins = 3 (đủ lên Cấp 2)
      const prevStats = createTestStats({ wins: 2 });
      const newStats = createTestStats({ wins: 3, manualLevel: null });

      strategy.onPlayerWin({
        botConfig: AI_LEVELS[0],
        oldLevel: 1,
        prevStats,
        newStats,
        moveCount: 10,
        hadComeback: false,
        undoCount: 0,
        wasUndoJustUsed: false,
        botEverHadOpenThreat: false,
        services: {
          setSafeTimeout: mockSetTimeout,
          playLevelUpSound: mockPlaySound,
          setShowLevelUpAlert: mockSetAlert,
          triggerTaunt: mockTriggerTaunt,
        },
      });

      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
      expect(mockPlaySound).toHaveBeenCalledTimes(1);
      expect(mockSetAlert).toHaveBeenCalledWith(AI_LEVELS[1]); // Lên Level 2
      expect(mockTriggerTaunt).toHaveBeenCalledWith('LEVEL_UP_ALERT', 400);
    });

    it('Không kích hoạt Level Up khi đang ở chế độ thủ công (manualLevel !== null)', () => {
      const mockSetTimeout = mock((fn: () => void) => fn());

      const prevStats = createTestStats({ wins: 2 });
      const newStats = createTestStats({ wins: 3, manualLevel: 5 });

      strategy.onPlayerWin({
        botConfig: AI_LEVELS[0],
        oldLevel: 1,
        prevStats,
        newStats,
        moveCount: 10,
        hadComeback: false,
        undoCount: 0,
        wasUndoJustUsed: false,
        botEverHadOpenThreat: false,
        services: {
          setSafeTimeout: mockSetTimeout,
        },
      });

      expect(mockSetTimeout).not.toHaveBeenCalled();
    });
  });
});
