import type { TauntDefinition } from '../types';
import { BLUNDER_MOVE } from './blunderMove';
import { BOT_BLOCK_THREAT } from './botBlockThreat';
import { BOT_TRAP } from './botTrap';
import { BOT_WIN } from './botWin';
import { CENTER_MOVE } from './centerMove';
import { CORNER_MOVE } from './cornerMove';
import { FAST_MOVE_TAUNT } from './fastMoveTaunt';
import { GAME_DRAW } from './gameDraw';
import { LONG_GAME } from './longGame';
import { PLAYER_RESIGN } from './playerResign';
import { PLAYER_STREAK_WIN } from './playerStreakWin';
import { PLAYER_UNDO } from './playerUndo';
import { PLAYER_WIN } from './playerWin';
import { RUSH_MOVE } from './rushMove';

export * from './blunderMove';
export * from './botBlockThreat';
export * from './botTrap';
export * from './botWin';
export * from './centerMove';
export * from './cornerMove';
export * from './fastMoveTaunt';
export * from './gameDraw';
export * from './longGame';
export * from './playerResign';
export * from './playerStreakWin';
export * from './playerUndo';
export * from './playerWin';
export * from './rushMove';

export const GAMEPLAY_TAUNTS: Record<string, TauntDefinition> = {
  BLUNDER_MOVE,
  BOT_BLOCK_THREAT,
  BOT_TRAP,
  BOT_WIN,
  CENTER_MOVE,
  CORNER_MOVE,
  FAST_MOVE_TAUNT,
  GAME_DRAW,
  LONG_GAME,
  PLAYER_RESIGN,
  PLAYER_STREAK_WIN,
  PLAYER_UNDO,
  PLAYER_WIN,
  RUSH_MOVE,
};
