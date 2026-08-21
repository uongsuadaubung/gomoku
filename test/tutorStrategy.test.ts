import { describe, it, expect, mock } from 'bun:test';
import { TutorStrategy } from '../src/game/strategies/TutorStrategy';
import { BLACK, WHITE } from '../src/game/types';
import { AI_LEVELS } from '../src/game/constants';
import { createEmptyBoard } from '../src/game/board';
import { createTestStats } from './testHelpers';

describe('Kiểm thử Chiến Lược Học Viện Gia Sư (TutorStrategy)', () => {
  const strategy = new TutorStrategy();

  describe('Cấu hình và Nhận diện Giao Diện', () => {
    it('Lấy bot đúng theo tutorLevel được chỉ định hoặc stats.tutor.currentLevel', () => {
      // 1. Theo tutorLevel
      const bot4 = strategy.getBotLevel({ tutorLevel: 4, stats: createTestStats() });
      expect(bot4.id).toBe(4);

      // 2. Theo stats.tutor.currentLevel
      const stats = createTestStats({ tutor: { currentLevel: 6, highestLevel: 6, totalWins: 5, totalLosses: 0, currentStreak: 5, bestStreak: 5, totalGames: 5, byBotLevel: {} } });
      const bot6 = strategy.getBotLevel({ stats });
      expect(bot6.id).toBe(6);
    });

    it('Cho phép đi lại (canUndo) để học hỏi cùng Gia sư', () => {
      expect(strategy.canUndo()).toBe(true);
    });

    it('Ẩn BotCharacter đối thủ để nhường không gian cho Gia sư Gomo', () => {
      expect(strategy.shouldShowBotCharacter()).toBe(false);
    });

    it('Hiển thị tiêu đề và tóm tắt theo phong cách Học Viện Gomo', () => {
      const winTitle = strategy.getGameOverTitle({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[0],
      });
      expect(winTitle.text).toContain('Thắng Trận Học Viện Gomo');

      const resignTitle = strategy.getGameOverTitle({
        won: false,
        draw: false,
        lastResigned: true,
        botConfig: AI_LEVELS[0],
      });
      expect(resignTitle.text).toContain('Bạn Đã Nhận Thua');

      const summary = strategy.getModeSummary({
        won: true,
        draw: false,
        lastResigned: false,
        botConfig: AI_LEVELS[1],
      });
      expect(summary).toBe(`Học Viện Gomo (Đối thủ: Cấp 2 - ${AI_LEVELS[1].vietnameseName})`);
    });
  });

  describe('Ghi nhận và Thăng Cấp Đối Thủ Học Viện (recordGame)', () => {
    it('Thắng trận: tăng điểm, nâng currentLevel và highestLevel, ghi nhận byBotLevel', () => {
      let stats = createTestStats();
      // Thắng Bot Cấp 1
      stats = strategy.recordGame(stats, 'win', { botLevel: 1 });

      expect(stats.tutor.totalWins).toBe(1);
      expect(stats.tutor.currentStreak).toBe(1);
      expect(stats.tutor.bestStreak).toBe(1);
      expect(stats.tutor.currentLevel).toBe(2); // Lên Cấp 2
      expect(stats.tutor.highestLevel).toBe(2);
      expect(stats.tutor.byBotLevel[1]).toEqual({ wins: 1, losses: 0, draws: 0 });
    });

    it('Thắng bot cấp thấp hơn cấp độ hiện tại: không đẩy lùi hoặc tăng sai currentLevel', () => {
      let stats = createTestStats({ tutor: { currentLevel: 5, highestLevel: 5, totalWins: 4, totalLosses: 0, currentStreak: 4, bestStreak: 4, totalGames: 4, byBotLevel: {} } });
      // Đang ở cấp 5, đá tập lại với Cấp 2
      stats = strategy.recordGame(stats, 'win', { botLevel: 2 });

      expect(stats.tutor.totalWins).toBe(5);
      expect(stats.tutor.currentLevel).toBe(5); // Vẫn ở cấp 5
      expect(stats.tutor.highestLevel).toBe(5);
      expect(stats.tutor.byBotLevel[2].wins).toBe(1);
    });

    it('Không vượt quá Cấp 12 tối đa', () => {
      let stats = createTestStats({ tutor: { currentLevel: 12, highestLevel: 12, totalWins: 11, totalLosses: 0, currentStreak: 11, bestStreak: 11, totalGames: 11, byBotLevel: {} } });
      stats = strategy.recordGame(stats, 'win', { botLevel: 12 });

      expect(stats.tutor.currentLevel).toBe(12);
      expect(stats.tutor.highestLevel).toBe(12);
    });

    it('Thua trận: tăng losses, reset streak, bảo lưu currentLevel và highestLevel', () => {
      let stats = createTestStats({ tutor: { currentLevel: 4, highestLevel: 4, totalWins: 3, totalLosses: 0, currentStreak: 3, bestStreak: 3, totalGames: 3, byBotLevel: {} } });
      stats = strategy.recordGame(stats, 'loss', { botLevel: 4 });

      expect(stats.tutor.totalLosses).toBe(1);
      expect(stats.tutor.currentStreak).toBe(0);
      expect(stats.tutor.currentLevel).toBe(4);
      expect(stats.tutor.highestLevel).toBe(4);
      expect(stats.tutor.byBotLevel[4].losses).toBe(1);
    });
  });

  describe('Tương tác Vòng Đời & Lời Thoại Gia Sư (Lifecycle Voice Hooks)', () => {
    it('onGameStart: reset session, chào mở màn và phân tích nước mở đầu', () => {
      const mockReset = mock(() => {});
      const mockSpeech = mock(() => {});
      const mockPreMove = mock(() => {});
      const board = createEmptyBoard();

      strategy.onGameStart({
        lastGameResult: null,
        botConfig: AI_LEVELS[0],
        board,
        playerColor: BLACK,
        services: {
          resetTutorMatchSession: mockReset,
          triggerTutorSpeech: mockSpeech,
          analyzePreMove: mockPreMove,
        },
      });

      expect(mockReset).toHaveBeenCalledTimes(1);
      expect(mockSpeech).toHaveBeenCalledWith('TUTOR_START_GAME', { botName: AI_LEVELS[0].vietnameseName, level: 1 });
      expect(mockPreMove).toHaveBeenCalledWith(board, BLACK);
    });

    it('onPlayerTurnStart: kích hoạt phân tích bàn cờ trước khi đánh', () => {
      const mockPreMove = mock(() => {});
      const board = createEmptyBoard();

      strategy.onPlayerTurnStart({
        board,
        playerColor: BLACK,
        services: {
          analyzePreMove: mockPreMove,
        },
      });
      expect(mockPreMove).toHaveBeenCalledWith(board, BLACK);
    });

    it('onPlayerMove: đánh giá chất lượng nước đi vừa đánh', () => {
      const mockEvaluate = mock(() => {});
      const board = createEmptyBoard();

      strategy.onPlayerMove({
        previousBoard: board,
        currentBoard: board,
        move: { row: 7, col: 7 },
        playerColor: BLACK,
        services: {
          evaluatePostMove: mockEvaluate,
        },
      });
      expect(mockEvaluate).toHaveBeenCalledWith(board, { row: 7, col: 7 }, BLACK);
    });

    it('onUndo: xóa đánh giá gần nhất, phát thoại hướng dẫn và phân tích lại', () => {
      const mockPop = mock(() => {});
      const mockSpeech = mock(() => {});
      const mockPreMove = mock(() => {});
      const board = createEmptyBoard();

      strategy.onUndo({
        board,
        playerColor: BLACK,
        isInstantUndo: false,
        recentUndoCount: 1,
        services: {
          popLastEvaluation: mockPop,
          triggerTutorSpeech: mockSpeech,
          analyzePreMove: mockPreMove,
        },
      });

      expect(mockPop).toHaveBeenCalledTimes(1);
      expect(mockSpeech).toHaveBeenCalledWith('TUTOR_UNDO_FEEDBACK');
      expect(mockPreMove).toHaveBeenCalledWith(board, BLACK);
    });

    it('onResign / onPlayerWin / onBotWin / onDraw: chốt tổng kết trận đấu', () => {
      const mockFinalize = mock(() => {});
      const mockSpeech = mock(() => {});

      // Resign
      strategy.onResign({
        botConfig: AI_LEVELS[0],
        board: createEmptyBoard(),
        aiColor: WHITE,
        isAiThinking: false,
        isLongThinking: false,
        services: {
          finalizeMatchReview: mockFinalize,
          triggerTutorSpeech: mockSpeech,
        },
      });
      expect(mockFinalize).toHaveBeenCalledWith('resign', AI_LEVELS[0].vietnameseName, 1);
      expect(mockSpeech).toHaveBeenCalledWith('GAME_OVER_PLAYER_RESIGN', { botName: AI_LEVELS[0].vietnameseName, level: 1 });

      // Player Win
      strategy.onPlayerWin({
        botConfig: AI_LEVELS[0],
        oldLevel: 1,
        prevStats: createTestStats(),
        newStats: createTestStats(),
        moveCount: 15,
        hadComeback: false,
        undoCount: 0,
        wasUndoJustUsed: false,
        botEverHadOpenThreat: false,
        services: {
          finalizeMatchReview: mockFinalize,
          triggerTutorSpeech: mockSpeech,
        },
      });
      expect(mockFinalize).toHaveBeenCalledWith('win', AI_LEVELS[0].vietnameseName, 1);
      expect(mockSpeech).toHaveBeenCalledWith('GAME_OVER_PLAYER_WIN', { botName: AI_LEVELS[0].vietnameseName, level: 1, nextLevel: 2 });

      // Bot Win
      strategy.onBotWin({
        botConfig: AI_LEVELS[0],
        moveCount: 20,
        durationMs: 45000,
        winningMove: { row: 7, col: 7 },
        wasLastGameSpeedLoss: false,
        isHeavyLossStreak: false,
        isImmediateRevenge: false,
        services: {
          finalizeMatchReview: mockFinalize,
          triggerTutorSpeech: mockSpeech,
        },
      });
      expect(mockFinalize).toHaveBeenCalledWith('loss', AI_LEVELS[0].vietnameseName, 1);
      expect(mockSpeech).toHaveBeenCalledWith('GAME_OVER_PLAYER_LOSS', { botName: AI_LEVELS[0].vietnameseName, level: 1 });

      // Draw
      strategy.onDraw({
        botConfig: AI_LEVELS[0],
        consecutiveDrawsCount: 1,
        services: {
          finalizeMatchReview: mockFinalize,
          triggerTutorSpeech: mockSpeech,
        },
      });
      expect(mockFinalize).toHaveBeenCalledWith('draw', AI_LEVELS[0].vietnameseName, 1);
      expect(mockSpeech).toHaveBeenCalledWith('GAME_OVER_DRAW', { botName: AI_LEVELS[0].vietnameseName, level: 1 });
    });
  });
});
