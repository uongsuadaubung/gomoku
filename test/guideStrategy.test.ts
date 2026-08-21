import { describe, it, expect, mock } from 'bun:test';
import { GuideStrategy } from '../src/game/strategies/GuideStrategy';
import { EMPTY, BLACK } from '../src/game/types';
import { AI_LEVELS } from '../src/game/constants';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Kỳ Viện Bách Khoa (GuideStrategy)', () => {
  const strategy = new GuideStrategy();

  describe('Cấu hình và Nhận diện Giao Diện', () => {
    it('Sử dụng cấu hình Bot Thần Cờ Cấp 12 cho phân tích thế trận', () => {
      const bot = strategy.getBotLevel({} as any);
      expect(bot.id).toBe(12);
      expect(bot.name).toBe(AI_LEVELS[11].name);
    });

    it('Cho phép đi lại (canUndo) khi luyện tập giáo trình', () => {
      expect(strategy.canUndo()).toBe(true);
    });

    it('Ẩn BotCharacter và kích hoạt Master View & Guide Overlay', () => {
      expect(strategy.shouldShowBotCharacter()).toBe(false);
      expect(strategy.shouldShowGuideOverlay()).toBe(true);
      expect(strategy.shouldShowGuideMasterView()).toBe(true);
    });

    it('Không làm thay đổi chỉ số UserStats (recordGame giữ nguyên)', () => {
      const initial = createTestStats();
      const after = strategy.recordGame(initial, 'win');
      expect(after).toBe(initial);
    });
  });

  describe('Khởi tạo Tab Giáo Trình vs Bàn Cờ Nháp (enterMode)', () => {
    it('Khởi tạo tab bài học (lessons) và gọi resumeLatestLesson', () => {
      const mockSetGuideTab = mock(() => {});
      const mockResumeLesson = mock(() => {});
      const mockStopBlitz = mock(() => {});

      const ctx: any = {
        blitz: { stopBlitzTimer: mockStopBlitz },
        series: {
          setIsSeriesActive: () => {},
          setSeriesGameNumber: () => {},
          setLastResigned: () => {},
        },
        guide: {
          setGuideTab: mockSetGuideTab,
          resumeLatestLesson: mockResumeLesson,
          startSandboxMode: () => {},
        },
        setGameMode: () => {},
        setAiStats: () => {},
        setIsAiThinking: () => {},
        setGameStatus: () => {},
        setMatchStage: () => {},
        soundService: { playClickSound: () => {} },
      };

      strategy.enterMode(ctx, { tab: 'lessons' });
      expect(mockStopBlitz).toHaveBeenCalledTimes(1);
      expect(mockSetGuideTab).toHaveBeenCalledWith('lessons');
      expect(mockResumeLesson).toHaveBeenCalledTimes(1);
    });

    it('Khởi tạo tab bàn cờ nháp (sandbox) và gọi startSandboxMode', () => {
      const mockSetGuideTab = mock(() => {});
      const mockStartSandbox = mock(() => {});

      const ctx: any = {
        blitz: { stopBlitzTimer: () => {} },
        series: {
          setIsSeriesActive: () => {},
          setSeriesGameNumber: () => {},
          setLastResigned: () => {},
        },
        guide: {
          setGuideTab: mockSetGuideTab,
          resumeLatestLesson: () => {},
          startSandboxMode: mockStartSandbox,
        },
        setGameMode: () => {},
        setAiStats: () => {},
        setIsAiThinking: () => {},
        setGameStatus: () => {},
        setMatchStage: () => {},
        soundService: { playClickSound: () => {} },
      };

      strategy.enterMode(ctx, { tab: 'sandbox' });
      expect(mockSetGuideTab).toHaveBeenCalledWith('sandbox');
      expect(mockStartSandbox).toHaveBeenCalledTimes(1);
    });
  });

  describe('Điều phối Nước Đi Riêng Biệt (handleCustomMove)', () => {
    it('Định tuyến nước đi tới handleLessonMove khi đang ở tab lessons', () => {
      const mockLessonMove = mock(() => {});
      const result = strategy.handleCustomMove({
        row: 7,
        col: 7,
        services: {
          guide: {
            guideTab: () => 'lessons',
            handleLessonMove: mockLessonMove,
            handleSandboxCellClick: () => {},
          } as any,
        },
      });

      expect(result).toBe(true);
      expect(mockLessonMove).toHaveBeenCalledWith(7, 7);
    });

    it('Định tuyến nước đi tới handleSandboxCellClick khi đang ở tab sandbox', () => {
      const mockSandboxClick = mock(() => {});
      const result = strategy.handleCustomMove({
        row: 5,
        col: 6,
        services: {
          guide: {
            guideTab: () => 'sandbox',
            handleLessonMove: () => {},
            handleSandboxCellClick: mockSandboxClick,
          } as any,
        },
      });

      expect(result).toBe(true);
      expect(mockSandboxClick).toHaveBeenCalledWith(5, 6);
    });
  });

  describe('Tương tác Hover Ô Cờ Nháp (onCellHover)', () => {
    it('Cập nhật ô được chọn khi hover vào ô trống trong chế độ sandbox', () => {
      const mockSetSelected = mock(() => {});
      const handled = strategy.onCellHover({
        row: 3,
        col: 4,
        cell: EMPTY,
        services: {
          guide: {
            guideTab: () => 'sandbox',
            setSelectedSandboxCell: mockSetSelected,
          } as any,
        },
      });

      expect(handled).toBe(true);
      expect(mockSetSelected).toHaveBeenCalledWith({ row: 3, col: 4 });
    });

    it('Không bắt sự kiện hover khi ô cờ đã có quân hoặc ở tab lessons', () => {
      const mockSetSelected = mock(() => {});
      // Ô đã có quân
      const handledFilled = strategy.onCellHover({
        row: 3,
        col: 4,
        cell: BLACK,
        services: {
          guide: {
            guideTab: () => 'sandbox',
            setSelectedSandboxCell: mockSetSelected,
          } as any,
        },
      });
      expect(handledFilled).toBe(false);

      // Ở tab lessons
      const handledLesson = strategy.onCellHover({
        row: 3,
        col: 4,
        cell: EMPTY,
        services: {
          guide: {
            guideTab: () => 'lessons',
            setSelectedSandboxCell: mockSetSelected,
          } as any,
        },
      });
      expect(handledLesson).toBe(false);
      expect(mockSetSelected).not.toHaveBeenCalled();
    });
  });
});
