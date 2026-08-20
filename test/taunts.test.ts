import { describe, it, expect } from 'bun:test';
import { TauntEvaluator } from '../src/services/tauntEvaluator';
import { TauntService } from '../src/services/tauntService';

describe('Kiểm Định Ngữ Cảnh Thoại Cà Khịa (Taunt Context Verification)', () => {
  it('Khi Người chơi THẮNG và AFK trên bàn cờ -> Phải kích hoạt IDLE_AFTER_WIN', () => {
    const result = TauntEvaluator.evaluateIdle({
      isPlaying: false,
      isAiThinking: false,
      isPlayerLastGameLost: false,
      isPlayerLastGameWon: true,
      hasTriggeredStareAtWinLine: false,
    });

    expect(result.event).toBe('IDLE_AFTER_WIN');

    const taunt = TauntService.getTaunt('IDLE_AFTER_WIN', { undoCount: 0, botWins: 0, playerWins: 1 });
    expect(taunt.text).toBeDefined();
    expect(taunt.text.length).toBeGreaterThan(0);
  });

  it('Khi Người chơi THUA và AFK -> Phải kích hoạt STARE_AT_WIN_LINE hoặc IDLE_AFTER_LOSS', () => {
    const result1 = TauntEvaluator.evaluateIdle({
      isPlaying: false,
      isAiThinking: false,
      isPlayerLastGameLost: true,
      isPlayerLastGameWon: false,
      hasTriggeredStareAtWinLine: false,
    });
    expect(result1.event).toBe('STARE_AT_WIN_LINE');

    const result2 = TauntEvaluator.evaluateIdle({
      isPlaying: false,
      isAiThinking: false,
      isPlayerLastGameLost: true,
      isPlayerLastGameWon: false,
      hasTriggeredStareAtWinLine: true,
    });
    expect(result2.event).toBe('IDLE_AFTER_LOSS');
  });

  it('Khi mở màn ván mới sau khi vừa THẮNG -> Phải kích hoạt START_AFTER_WIN', () => {
    const event = TauntEvaluator.evaluateGameStart('win');
    expect(event).toBe('START_AFTER_WIN');

    const taunt = TauntService.getTaunt('START_AFTER_WIN');
    expect(taunt.text).toBeDefined();
    expect(taunt.text.length).toBeGreaterThan(0);
  });

  it('Khi mở màn ván mới sau khi vừa THUA -> Phải kích hoạt START_AFTER_LOSS', () => {
    const event = TauntEvaluator.evaluateGameStart('loss');
    expect(event).toBe('START_AFTER_LOSS');

    const taunt = TauntService.getTaunt('START_AFTER_LOSS');
    expect(taunt.text).toBeDefined();
    expect(taunt.text.length).toBeGreaterThan(0);
  });

  it('Khi mở màn ván mới từ Menu hoặc sau ván Hòa -> Kích hoạt GAME_START', () => {
    expect(TauntEvaluator.evaluateGameStart(null)).toBe('GAME_START');
    expect(TauntEvaluator.evaluateGameStart('draw')).toBe('GAME_START');
  });
});
