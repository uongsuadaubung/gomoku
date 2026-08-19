import { GAME_START } from './gameStart';
import { PLAYER_GOOD_MOVE } from './playerGoodMove';
import { POKE_BOT } from './pokeBot';
import { SWAP_SIDE_BOT_FIRST } from './swapSideBotFirst';
import { SWAP_SIDE_PLAYER_FIRST } from './swapSidePlayerFirst';
import { STREAK_LOSS } from './streakLoss';
import { BREAK_LOSS_STREAK } from './breakLossStreak';
import { LEVEL_UP_ALERT } from './levelUpAlert';
import { CLICK_BEFORE_START } from './clickBeforeStart';
import { MULTI_UNDO } from './multiUndo';
import { SPAM_POKE_BOT } from './spamPokeBot';
import { CLICK_AFTER_GAME_OVER } from './clickAfterGameOver';

export * from './gameStart';
export * from './playerGoodMove';
export * from './pokeBot';
export * from './swapSideBotFirst';
export * from './swapSidePlayerFirst';
export * from './streakLoss';
export * from './breakLossStreak';
export * from './levelUpAlert';
export * from './clickBeforeStart';
export * from './multiUndo';
export * from './spamPokeBot';
export * from './clickAfterGameOver';

export const INTERACTION_TAUNTS = {
  GAME_START,
  PLAYER_GOOD_MOVE,
  POKE_BOT,
  SWAP_SIDE_BOT_FIRST,
  SWAP_SIDE_PLAYER_FIRST,
  STREAK_LOSS,
  BREAK_LOSS_STREAK,
  LEVEL_UP_ALERT,
  CLICK_BEFORE_START,
  MULTI_UNDO,
  SPAM_POKE_BOT,
  CLICK_AFTER_GAME_OVER,
};
