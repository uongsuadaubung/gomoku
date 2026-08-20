import { describe, it, expect, mock } from 'bun:test';
import { TutorStrategy } from '../src/game/strategies/TutorStrategy';
import { BlitzStrategy } from '../src/game/strategies/BlitzStrategy';
import { CampaignStrategy } from '../src/game/strategies/CampaignStrategy';
import { CustomStrategy } from '../src/game/strategies/CustomStrategy';
import { PuzzleStrategy } from '../src/game/strategies/PuzzleStrategy';
import { BLACK, WHITE } from '../src/game/types';
import { createEmptyBoard } from '../src/game/board';
import { AI_LEVELS } from '../src/game/constants';

describe('Kiểm thử Lifecycle Hooks của GameModeStrategy', () => {
  it('TutorStrategy kích hoạt đúng speech và phân tích trong các lifecycle hooks', () => {
    const tutorStrategy = new TutorStrategy();
    const mockSpeech = mock(() => {});
    const mockPreMove = mock(() => {});
    const mockPostMove = mock(() => {});

    const board = createEmptyBoard();

    // 1. onGameStart
    tutorStrategy.onGameStart({
      lastGameResult: null,
      botConfig: AI_LEVELS[0],
      board,
      playerColor: BLACK,
      services: {
        triggerTutorSpeech: mockSpeech,
        analyzePreMove: mockPreMove,
      },
    });
    expect(mockSpeech).toHaveBeenCalledWith('TUTOR_START_GAME', { botName: AI_LEVELS[0].vietnameseName, level: 1 });
    expect(mockPreMove).toHaveBeenCalledTimes(1);

    // 2. onPlayerTurnStart
    tutorStrategy.onPlayerTurnStart({
      board,
      playerColor: BLACK,
      services: {
        analyzePreMove: mockPreMove,
      },
    });
    expect(mockPreMove).toHaveBeenCalledTimes(2);

    // 3. onPlayerMove
    tutorStrategy.onPlayerMove({
      previousBoard: board,
      currentBoard: board,
      move: { row: 7, col: 7 },
      playerColor: BLACK,
      services: {
        evaluatePostMove: mockPostMove,
      },
    });
    expect(mockPostMove).toHaveBeenCalledTimes(1);

    // 4. onUndo
    tutorStrategy.onUndo({
      board,
      playerColor: BLACK,
      isInstantUndo: false,
      recentUndoCount: 1,
      services: {
        triggerTutorSpeech: mockSpeech,
        analyzePreMove: mockPreMove,
      },
    });
    expect(mockSpeech).toHaveBeenCalledWith('TUTOR_UNDO_FEEDBACK');
    expect(mockPreMove).toHaveBeenCalledTimes(3);

    // 5. onPlayerWin
    tutorStrategy.onPlayerWin({
      botConfig: AI_LEVELS[0],
      oldLevel: 1,
      prevStats: {} as any,
      newStats: {} as any,
      moveCount: 15,
      hadComeback: false,
      undoCount: 0,
      wasUndoJustUsed: false,
      botEverHadOpenThreat: false,
      services: {
        triggerTutorSpeech: mockSpeech,
      },
    });
    expect(mockSpeech).toHaveBeenCalledWith('GAME_OVER_PLAYER_WIN', {
      botName: AI_LEVELS[0].vietnameseName,
      level: 1,
      nextLevel: 2,
    });
  });

  it('BlitzStrategy kích hoạt đúng timer khi vào lượt người chơi và hạ cờ', () => {
    const blitzStrategy = new BlitzStrategy();
    const mockStartTimer = mock(() => {});
    const mockStopTimer = mock(() => {});

    const board = createEmptyBoard();

    // 1. onPlayerTurnStart
    blitzStrategy.onPlayerTurnStart({
      board,
      playerColor: BLACK,
      services: {
        startBlitzTimer: mockStartTimer,
      },
    });
    expect(mockStartTimer).toHaveBeenCalledTimes(1);

    // 2. onPlayerMove
    blitzStrategy.onPlayerMove({
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

  it('getNextSeriesPlayerSide hoạt động đa hình đúng theo từng Strategy', () => {
    const campaignStrategy = new CampaignStrategy();
    const customStrategy = new CustomStrategy();

    // Campaign: đổi màu quân luân phiên
    expect(campaignStrategy.getNextSeriesPlayerSide({ currentPlayerColor: BLACK })).toBe(false);
    expect(campaignStrategy.getNextSeriesPlayerSide({ currentPlayerColor: WHITE })).toBe(true);

    // Custom: giữ nguyên màu quân đã cấu hình
    expect(customStrategy.getNextSeriesPlayerSide({
      currentPlayerColor: WHITE,
      customConfig: { botLevel: 5, playerColor: BLACK },
    })).toBe(true);

    expect(customStrategy.getNextSeriesPlayerSide({
      currentPlayerColor: BLACK,
      customConfig: { botLevel: 5, playerColor: WHITE },
    })).toBe(false);
  });

  it('getCurrentStreak và các hàm presentation hiển thị chuẩn xác theo từng Strategy', () => {
    const tutorStrategy = new TutorStrategy();
    const blitzStrategy = new BlitzStrategy();
    const puzzleStrategy = new PuzzleStrategy();

    // 1. Streak
    const dummyStats: any = {
      tutor: { currentStreak: 4 },
      blitz: { currentStreak: 7 },
      puzzle: { currentStreak: 2 },
    };
    expect(tutorStrategy.getCurrentStreak(dummyStats)).toBe(4);
    expect(blitzStrategy.getCurrentStreak(dummyStats)).toBe(7);
    expect(puzzleStrategy.getCurrentStreak(dummyStats)).toBe(2);

    // 2. Presentation Title
    expect(tutorStrategy.getGameOverTitle({
      won: true,
      draw: false,
      lastResigned: false,
      botConfig: AI_LEVELS[0],
    }).text).toContain('Học Viện');

    expect(blitzStrategy.getGameOverTitle({
      won: false,
      draw: false,
      lastResigned: false,
      botConfig: AI_LEVELS[0],
      isBlitzTimeout: true,
    }).text).toContain('Cháy Giờ');

    expect(puzzleStrategy.getGameOverTitle({
      won: true,
      draw: false,
      lastResigned: false,
      botConfig: AI_LEVELS[0],
    }).text).toContain('Giải Thế Cờ Thành Công');

    // 3. Move Count display
    expect(puzzleStrategy.getMoveCountDisplay(12, 8)).toBe('4 nước thêm');
    expect(tutorStrategy.getMoveCountDisplay(12)).toBe('12 nước');
  });

  it('shouldShowBotCharacter trả về false cho TutorStrategy và true cho các Strategy khác', () => {
    const tutor = new TutorStrategy();
    const campaign = new CampaignStrategy();
    const blitz = new BlitzStrategy();
    const custom = new CustomStrategy();
    const puzzle = new PuzzleStrategy();

    expect(tutor.shouldShowBotCharacter()).toBe(false);
    expect(campaign.shouldShowBotCharacter()).toBe(true);
    expect(blitz.shouldShowBotCharacter()).toBe(true);
    expect(custom.shouldShowBotCharacter()).toBe(true);
    expect(puzzle.shouldShowBotCharacter()).toBe(true);
  });
});

