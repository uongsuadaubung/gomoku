import type { TauntDefinition } from '../types';
import { BREAK_LOSS_STREAK } from './breakLossStreak';
import { CLICK_AFTER_GAME_OVER } from './clickAfterGameOver';
import { CLICK_BEFORE_START } from './clickBeforeStart';
import { GAME_START } from './gameStart';
import { HESITATION_DANCE } from './hesitationDance';
import { IMMEDIATE_REVENGE_CLICK } from './immediateRevengeClick';
import { LEVEL_UP_ALERT } from './levelUpAlert';
import { LONG_HOVER_CELL } from './longHoverCell';
import { MARATHON_SERIES } from './marathonSeries';
import { MULTI_UNDO } from './multiUndo';
import { PLAYER_GOOD_MOVE } from './playerGoodMove';
import { POKE_BOT } from './pokeBot';
import { RAGE_DOWNGRADE_AFTER_LOSS } from './rageDowngradeAfterLoss';
import { SPAM_POKE_BOT } from './spamPokeBot';
import { STREAK_LOSS } from './streakLoss';
import { SWAP_SIDE_BOT_FIRST } from './swapSideBotFirst';
import { SWAP_SIDE_PLAYER_FIRST } from './swapSidePlayerFirst';
import { UNDO_BEFORE_AI_MOVES } from './undoBeforeAiMoves';

export * from './breakLossStreak';
export * from './clickAfterGameOver';
export * from './clickBeforeStart';
export * from './gameStart';
export * from './hesitationDance';
export * from './immediateRevengeClick';
export * from './levelUpAlert';
export * from './longHoverCell';
export * from './marathonSeries';
export * from './multiUndo';
export * from './playerGoodMove';
export * from './pokeBot';
export * from './rageDowngradeAfterLoss';
export * from './spamPokeBot';
export * from './streakLoss';
export * from './swapSideBotFirst';
export * from './swapSidePlayerFirst';
export * from './undoBeforeAiMoves';

export const INTERACTION_TAUNTS: Record<string, TauntDefinition> = {
  BREAK_LOSS_STREAK,
  CLICK_AFTER_GAME_OVER,
  CLICK_BEFORE_START,
  GAME_START,
  HESITATION_DANCE,
  IMMEDIATE_REVENGE_CLICK,
  LEVEL_UP_ALERT,
  LONG_HOVER_CELL,
  MARATHON_SERIES,
  MULTI_UNDO,
  PLAYER_GOOD_MOVE,
  POKE_BOT,
  RAGE_DOWNGRADE_AFTER_LOSS,
  SPAM_POKE_BOT,
  STREAK_LOSS,
  SWAP_SIDE_BOT_FIRST,
  SWAP_SIDE_PLAYER_FIRST,
  UNDO_BEFORE_AI_MOVES,
};
