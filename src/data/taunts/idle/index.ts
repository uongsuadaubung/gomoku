import type { TauntDefinition } from '../types';
import { IDLE_AFTER_LOSS } from './idleAfterLoss';
import { IDLE_AFTER_WIN } from './idleAfterWin';
import { IDLE_IN_GAME } from './idleInGame';
import { IDLE_PRE_GAME } from './idlePreGame';
import { IDLE_THINKING } from './idleThinking';
import { STARE_AT_WIN_LINE } from './stareAtWinLine';
import { SUPER_SLOW_MOVE } from './superSlowMove';

export * from './idleAfterLoss';
export * from './idleAfterWin';
export * from './idleInGame';
export * from './idlePreGame';
export * from './idleThinking';
export * from './stareAtWinLine';
export * from './superSlowMove';

export const IDLE_TAUNTS: Record<string, TauntDefinition> = {
  IDLE_AFTER_LOSS,
  IDLE_AFTER_WIN,
  IDLE_IN_GAME,
  IDLE_PRE_GAME,
  IDLE_THINKING,
  STARE_AT_WIN_LINE,
  SUPER_SLOW_MOVE,
};
