import { GameMode } from '../types';
import { GameModeStrategy } from './types';
import { CampaignStrategy } from './CampaignStrategy';
import { PuzzleStrategy } from './PuzzleStrategy';
import { CustomStrategy } from './CustomStrategy';

export * from './types';
export * from './CampaignStrategy';
export * from './PuzzleStrategy';
export * from './CustomStrategy';

// Singleton instances để tái sử dụng hiệu quả
const campaignStrategy = new CampaignStrategy();
const puzzleStrategy = new PuzzleStrategy();
const customStrategy = new CustomStrategy();

const strategyMap: Record<GameMode, GameModeStrategy> = {
  campaign: campaignStrategy,
  puzzle: puzzleStrategy,
  custom: customStrategy,
  menu: campaignStrategy, // Mặc định khi ở Menu
};

/**
 * Lấy Strategy tương ứng với GameMode được truyền vào (Strategy Pattern Factory)
 */
export function getGameStrategy(mode: GameMode): GameModeStrategy {
  return strategyMap[mode] || campaignStrategy;
}
