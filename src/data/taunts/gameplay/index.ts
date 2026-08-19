import { BOT_WIN } from './botWin';
import { PLAYER_RESIGN } from './playerResign';
import { PLAYER_UNDO } from './playerUndo';
import { BLUNDER_MOVE } from './blunderMove';
import { BOT_TRAP } from './botTrap';
import { FAST_MOVE_TAUNT } from './fastMoveTaunt';
import { BOT_BLOCK_THREAT } from './botBlockThreat';
import { CORNER_MOVE } from './cornerMove';
import { CENTER_MOVE } from './centerMove';
import { LONG_GAME } from './longGame';
import { GAME_DRAW } from './gameDraw';
import { PLAYER_WIN } from './playerWin';
import { PLAYER_STREAK_WIN } from './playerStreakWin';
import { RUSH_MOVE } from './rushMove';

export * from './botWin';
export * from './playerResign';
export * from './playerUndo';
export * from './blunderMove';
export * from './botTrap';
export * from './fastMoveTaunt';
export * from './botBlockThreat';
export * from './cornerMove';
export * from './centerMove';
export * from './longGame';
export * from './gameDraw';
export * from './playerWin';
export * from './playerStreakWin';
export * from './rushMove';

export const GAMEPLAY_TAUNTS = {
  BOT_WIN,
  PLAYER_RESIGN,
  PLAYER_UNDO,
  BLUNDER_MOVE,
  BOT_TRAP,
  FAST_MOVE_TAUNT,
  BOT_BLOCK_THREAT,
  CORNER_MOVE,
  CENTER_MOVE,
  LONG_GAME,
  GAME_DRAW,
  PLAYER_WIN,
  PLAYER_STREAK_WIN,
  RUSH_MOVE,
};
