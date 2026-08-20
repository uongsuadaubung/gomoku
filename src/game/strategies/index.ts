import { GameMode } from '../types';
import { GameModeStrategy } from './types';
import { CampaignStrategy } from './CampaignStrategy';
import { PuzzleStrategy } from './PuzzleStrategy';
import { CustomStrategy } from './CustomStrategy';
import { BlitzStrategy } from './BlitzStrategy';
import { TutorStrategy } from './TutorStrategy';
import { GuideStrategy } from './GuideStrategy';

export * from './types';
export * from './BaseStrategy';
export * from './CampaignStrategy';
export * from './PuzzleStrategy';
export * from './CustomStrategy';
export * from './BlitzStrategy';
export * from './TutorStrategy';
export * from './GuideStrategy';

// Singleton instances để tái sử dụng hiệu quả
const campaignStrategy = new CampaignStrategy();
const puzzleStrategy = new PuzzleStrategy();
const customStrategy = new CustomStrategy();
const blitzStrategy = new BlitzStrategy();
const tutorStrategy = new TutorStrategy();
const guideStrategy = new GuideStrategy();

const strategyMap: Record<GameMode, GameModeStrategy> = {
  campaign: campaignStrategy,
  puzzle: puzzleStrategy,
  custom: customStrategy,
  blitz: blitzStrategy,
  tutor: tutorStrategy,
  guide: guideStrategy,
  menu: campaignStrategy, // Mặc định khi ở Menu
};

/**
 * Lấy Strategy tương ứng với GameMode được truyền vào (Strategy Pattern Factory)
 */
export function getGameStrategy(mode: GameMode): GameModeStrategy {
  return strategyMap[mode] || campaignStrategy;
}

