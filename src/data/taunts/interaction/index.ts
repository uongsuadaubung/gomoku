import type { TauntDefinition } from '../types';
import { BREAK_LOSS_STREAK } from './breakLossStreak';
import { CLICK_AFTER_GAME_OVER } from './clickAfterGameOver';
import { CLICK_BEFORE_START } from './clickBeforeStart';
import { GAME_START } from './gameStart';
import { LEVEL_UP_ALERT } from './levelUpAlert';
import { MULTI_UNDO } from './multiUndo';
import { PLAYER_GOOD_MOVE } from './playerGoodMove';
import { POKE_BOT } from './pokeBot';
import { SPAM_POKE_BOT } from './spamPokeBot';
import { STREAK_LOSS } from './streakLoss';
import { SWAP_SIDE_BOT_FIRST } from './swapSideBotFirst';
import { SWAP_SIDE_PLAYER_FIRST } from './swapSidePlayerFirst';

export * from './breakLossStreak';
export * from './clickAfterGameOver';
export * from './clickBeforeStart';
export * from './gameStart';
export * from './levelUpAlert';
export * from './multiUndo';
export * from './playerGoodMove';
export * from './pokeBot';
export * from './spamPokeBot';
export * from './streakLoss';
export * from './swapSideBotFirst';
export * from './swapSidePlayerFirst';

export const INTERACTION_TAUNTS: Record<string, TauntDefinition> = {
  BREAK_LOSS_STREAK,
  CLICK_AFTER_GAME_OVER,
  CLICK_BEFORE_START,
  GAME_START,
  LEVEL_UP_ALERT,
  MULTI_UNDO,
  PLAYER_GOOD_MOVE,
  POKE_BOT,
  SPAM_POKE_BOT,
  STREAK_LOSS,
  SWAP_SIDE_BOT_FIRST,
  SWAP_SIDE_PLAYER_FIRST,
};
