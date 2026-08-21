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

let _campaign: CampaignStrategy | null = null;
let _puzzle: PuzzleStrategy | null = null;
let _custom: CustomStrategy | null = null;
let _blitz: BlitzStrategy | null = null;
let _tutor: TutorStrategy | null = null;
let _guide: GuideStrategy | null = null;

export type AnyGameModeStrategy =
  | CampaignStrategy
  | PuzzleStrategy
  | CustomStrategy
  | BlitzStrategy
  | TutorStrategy
  | GuideStrategy;

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
  switch (mode) {
    case 'puzzle':
      return (_puzzle ??= new PuzzleStrategy());
    case 'custom':
      return (_custom ??= new CustomStrategy());
    case 'blitz':
      return (_blitz ??= new BlitzStrategy());
    case 'tutor':
      return (_tutor ??= new TutorStrategy());
    case 'guide':
      return (_guide ??= new GuideStrategy());
    case 'campaign':
    case 'menu':
    default:
      return (_campaign ??= new CampaignStrategy());
  }
}

