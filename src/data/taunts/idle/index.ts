import { IDLE_THINKING } from './idleThinking';
import { IDLE_IN_GAME } from './idleInGame';
import { IDLE_PRE_GAME } from './idlePreGame';
import { IDLE_AFTER_LOSS } from './idleAfterLoss';
import { SUPER_SLOW_MOVE } from './superSlowMove';

export * from './idleThinking';
export * from './idleInGame';
export * from './idlePreGame';
export * from './idleAfterLoss';
export * from './superSlowMove';

export const IDLE_TAUNTS = {
  IDLE_THINKING,
  IDLE_IN_GAME,
  IDLE_PRE_GAME,
  IDLE_AFTER_LOSS,
  SUPER_SLOW_MOVE,
};
