import { describe, it, expect } from 'bun:test';
import {
  getGameStrategy,
  CampaignStrategy,
  CustomStrategy,
  BlitzStrategy,
  PuzzleStrategy,
  TutorStrategy,
  GuideStrategy,
} from '../src/game/strategies';

describe('Kiểm thử Strategy Factory (getGameStrategy)', () => {
  it('Khởi tạo đúng Strategy tương ứng với từng GameMode', () => {
    const campaign = getGameStrategy('campaign');
    expect(campaign).toBeInstanceOf(CampaignStrategy);
    expect(campaign.mode).toBe('campaign');

    const custom = getGameStrategy('custom');
    expect(custom).toBeInstanceOf(CustomStrategy);
    expect(custom.mode).toBe('custom');

    const blitz = getGameStrategy('blitz');
    expect(blitz).toBeInstanceOf(BlitzStrategy);
    expect(blitz.mode).toBe('blitz');

    const puzzle = getGameStrategy('puzzle');
    expect(puzzle).toBeInstanceOf(PuzzleStrategy);
    expect(puzzle.mode).toBe('puzzle');

    const tutor = getGameStrategy('tutor');
    expect(tutor).toBeInstanceOf(TutorStrategy);
    expect(tutor.mode).toBe('tutor');

    const guide = getGameStrategy('guide');
    expect(guide).toBeInstanceOf(GuideStrategy);
    expect(guide.mode).toBe('guide');
  });

  it('Trả về CampaignStrategy mặc định khi mode là menu hoặc không xác định', () => {
    const menuStrategy = getGameStrategy('menu');
    expect(menuStrategy).toBeInstanceOf(CampaignStrategy);

    const unknownStrategy = getGameStrategy('unknown' as any);
    expect(unknownStrategy).toBeInstanceOf(CampaignStrategy);
  });

  it('Đảm bảo tính chất Singleton (tái sử dụng instance đã khởi tạo)', () => {
    const blitz1 = getGameStrategy('blitz');
    const blitz2 = getGameStrategy('blitz');
    expect(blitz1).toBe(blitz2);

    const tutor1 = getGameStrategy('tutor');
    const tutor2 = getGameStrategy('tutor');
    expect(tutor1).toBe(tutor2);
  });
});
