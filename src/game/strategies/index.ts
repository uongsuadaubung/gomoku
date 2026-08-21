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

export type AnyGameModeStrategy =
  | CampaignStrategy
  | PuzzleStrategy
  | CustomStrategy
  | BlitzStrategy
  | TutorStrategy
  | GuideStrategy;

const strategyMap: Record<GameMode, AnyGameModeStrategy> = {
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
export function getGameStrategy(mode: 'campaign'): CampaignStrategy;
export function getGameStrategy(mode: 'puzzle'): PuzzleStrategy;
export function getGameStrategy(mode: 'custom'): CustomStrategy;
export function getGameStrategy(mode: 'blitz'): BlitzStrategy;
export function getGameStrategy(mode: 'tutor'): TutorStrategy;
export function getGameStrategy(mode: 'guide'): GuideStrategy;
export function getGameStrategy(mode: 'menu'): CampaignStrategy;
export function getGameStrategy(mode: GameMode): AnyGameModeStrategy;
export function getGameStrategy(mode: GameMode): AnyGameModeStrategy {
  return strategyMap[mode] || campaignStrategy;
}

