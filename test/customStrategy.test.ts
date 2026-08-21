import { describe, it, expect, mock } from 'bun:test';
import { CustomStrategy } from '../src/game/strategies/CustomStrategy';
import { BLACK, WHITE } from '../src/game/types';
import { AI_LEVELS } from '../src/game/constants';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Đấu Tập (CustomStrategy)', () => {
  const strategy = new CustomStrategy();

  describe('Cấu hình và Chọn Cấp Độ Bot (getBotLevel)', () => {
    it('Lấy bot đúng theo customConfig.botLevel đã chọn', () => {
      // Chọn Bot Cấp 5
      const bot5 = strategy.getBotLevel({ customConfig: { botLevel: 5, playerColor: BLACK } } as any);
      expect(bot5.id).toBe(5);

      // Chọn Bot Cấp 12
      const bot12 = strategy.getBotLevel({ customConfig: { botLevel: 12, playerColor: BLACK } } as any);
      expect(bot12.id).toBe(12);
    });

    it('Tự động kẹp giá trị nếu botLevel vượt ngoài giới hạn (1-12)', () => {
      // Cấp 1
      const bot1 = strategy.getBotLevel({ customConfig: { botLevel: 1, playerColor: BLACK } } as any);
      expect(bot1.id).toBe(1);

      // Vượt trên (99) -> Cấp 12 (kẹp max)
      const botOver = strategy.getBotLevel({ customConfig: { botLevel: 99, playerColor: BLACK } } as any);
      expect(botOver.id).toBe(12);
    });

    it('Mặc định Bot Cấp 3 khi không có customConfig', () => {
      const defaultBot = strategy.getBotLevel({} as any);
      expect(defaultBot.id).toBe(3);
    });
  });

  describe('Quy tắc Đấu Tập và Luân phiên Quân Cờ', () => {
    it('Cho phép đi lại (canUndo) trong Đấu Tập', () => {
      expect(strategy.canUndo()).toBe(true);
    });

    it('Giữ nguyên phe quân cờ người chơi đã chọn (không tự động đảo phe)', () => {
      // Cấu hình cầm Đen -> Tiếp tục cầm Đen (true)
      expect(strategy.getNextSeriesPlayerSide({
        currentPlayerColor: WHITE,
        customConfig: { botLevel: 5, playerColor: BLACK },
      })).toBe(true);

      // Cấu hình cầm Trắng -> Tiếp tục cầm Trắng (false)
      expect(strategy.getNextSeriesPlayerSide({
        currentPlayerColor: BLACK,
        customConfig: { botLevel: 5, playerColor: WHITE },
      })).toBe(false);
    });

    it('Hiển thị tên chế độ kèm tên đối thủ (getModeSummary)', () => {
      const summary = strategy.getModeSummary({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[4], // Level 5
      });
      expect(summary).toBe(`Đấu Tập (Bot ${AI_LEVELS[4].vietnameseName})`);
    });
  });

  describe('Ghi nhận Kết Quả Trận Đấu theo từng Cấp Bot (recordGame)', () => {
    it('Ghi nhận thắng trận tổng và cập nhật chi tiết byBotLevel', () => {
      let stats = createTestStats();
      // Thắng Bot Cấp 5
      stats = strategy.recordGame(stats, 'win', { botLevel: 5 });

      expect(stats.custom.wins).toBe(1);
      expect(stats.custom.currentStreak).toBe(1);
      expect(stats.custom.bestStreak).toBe(1);
      expect(stats.custom.totalGames).toBe(1);

      // Chi tiết theo cấp bot
      expect(stats.custom.byBotLevel[5]).toEqual({ wins: 1, losses: 0, draws: 0 });
    });

    it('Ghi nhận thua trận: reset streak và cộng losses cho bot tương ứng', () => {
      let stats = createTestStats();
      // Thắng 2 trận
      stats = strategy.recordGame(stats, 'win', { botLevel: 3 });
      stats = strategy.recordGame(stats, 'win', { botLevel: 3 });
      expect(stats.custom.currentStreak).toBe(2);

      // Thua trận ở Bot Cấp 7
      stats = strategy.recordGame(stats, 'loss', { botLevel: 7 });
      expect(stats.custom.losses).toBe(1);
      expect(stats.custom.currentStreak).toBe(0);
      expect(stats.custom.bestStreak).toBe(2);
      expect(stats.custom.byBotLevel[3].wins).toBe(2);
      expect(stats.custom.byBotLevel[7].losses).toBe(1);
    });

    it('Ghi nhận hòa trận cho bot tương ứng', () => {
      let stats = createTestStats();
      stats = strategy.recordGame(stats, 'draw', { botLevel: 4 });

      expect(stats.custom.draws).toBe(1);
      expect(stats.custom.byBotLevel[4].draws).toBe(1);
    });
  });

  describe('Khởi tạo Trận Đấu (enterMode & startMatch)', () => {
    it('enterMode khởi tạo cấu hình Đấu Tập với botLevel truyền vào', () => {
      const mockSetCustomConfig = mock(() => {});
      const mockSetGameMode = mock(() => {});
      const mockSetCurrentTurn = mock(() => {});
      const mockSetPlayerColor = mock(() => {});

      const ctx: any = {
        campaignLevelConfig: () => ({ id: 4 }),
        series: {
          customConfig: () => null,
          setCustomConfig: mockSetCustomConfig,
          setIsSeriesActive: () => {},
          setSeriesGameNumber: () => {},
          setLastResigned: () => {},
        },
        setGameMode: mockSetGameMode,
        setBoard: () => {},
        setMoveHistory: () => {},
        setLastMove: () => {},
        setWinInfo: () => {},
        setAiStats: () => {},
        setIsAiThinking: () => {},
        setAiThinkingProgress: () => {},
        setGameStatus: () => {},
        setMatchStage: () => {},
        setCurrentTurn: mockSetCurrentTurn,
        setPlayerColor: mockSetPlayerColor,
        taunt: { clearTauntQueue: () => {}, resetIdleTimer: () => {} },
        soundService: { playClickSound: () => {} },
      };

      strategy.enterMode(ctx, { botLevel: 6 });
      expect(mockSetCustomConfig).toHaveBeenCalledWith({
        botLevel: 6,
        playerColor: BLACK,
      });
      expect(mockSetGameMode).toHaveBeenCalledWith('custom');
      expect(mockSetPlayerColor).toHaveBeenCalledWith(BLACK);
    });

    it('startMatch khởi tạo ván mới với phe quân cờ người chơi chọn', () => {
      const mockSetCustomConfig = mock(() => {});
      const mockStartNewGame = mock(() => {});
      const mockSetGameMode = mock(() => {});

      const ctx: any = {
        series: {
          customConfig: () => ({ botLevel: 2 }),
          setCustomConfig: mockSetCustomConfig,
          setIsSeriesActive: () => {},
          setSeriesGameNumber: () => {},
          setLastResigned: () => {},
        },
        setGameMode: mockSetGameMode,
        startNewGame: mockStartNewGame,
      };

      // Chọn chơi Trắng (playAsBlack = false)
      strategy.startMatch(ctx, { botLevel: 8, playAsBlack: false });
      expect(mockSetGameMode).toHaveBeenCalledWith('custom');
      expect(mockSetCustomConfig).toHaveBeenCalledWith({
        botLevel: 8,
        playerColor: WHITE,
      });
      expect(mockStartNewGame).toHaveBeenCalledWith(false);
    });
  });
});
