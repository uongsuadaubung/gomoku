import type { TauntDefinition } from '../types';
import { ACCIDENTAL_SELF_BLOCK } from './accidentalSelfBlock';
import { BLOCK_AND_COUNTER_FOUR } from './blockAndCounterFour';
import { BLOCK_WRONG_END } from './blockWrongEnd';
import { BLUNDER_MOVE } from './blunderMove';
import { BOT_BLOCK_THREAT } from './botBlockThreat';
import { BOT_TRAP } from './botTrap';
import { BOT_WIN } from './botWin';
import { BOT_WIN_LEADING_SCORE } from './botWinLeadingScore';
import { BOX_SURROUND_CENTER } from './boxSurroundCenter';
import { CENTER_MOVE } from './centerMove';
import { CLEAN_SWEEP_DOMINATION } from './cleanSweepDomination';
import { CLOSE_COMBAT_HUG } from './closeCombatHug';
import { CLUTCH_100_STONES } from './clutch100Stones';
import { COMEBACK_WIN } from './comebackWin';
import { CONSECUTIVE_DRAWS } from './consecutiveDraws';
import { CONSECUTIVE_SPEED_LOSSES } from './consecutiveSpeedLosses';
import { COPYCAT_MOVE } from './copycatMove';
import { CORNER_MOVE } from './cornerMove';
import { DEAD_FOUR_BLOCKED } from './deadFourBlocked';
import { DOUBLE_THREE_TRAP } from './doubleThreeTrap';
import { EDGE_WALK_MOVE } from './edgeWalkMove';
import { FAST_MOVE_TAUNT } from './fastMoveTaunt';
import { FORK_ATTACK_DEFENSE_FAIL } from './forkAttackDefenseFail';
import { FULL_DIAGONAL_HIGHWAY } from './fullDiagonalHighway';
import { GAME_DRAW } from './gameDraw';
import { GOD_LEVEL_VICTORY } from './godLevelVictory';
import { IRON_CURTAIN_WIN } from './ironCurtainWin';
import { ISOLATED_FAR_MOVE } from './isolatedFarMove';
import { JUMP_THREE_TRAP } from './jumpThreeTrap';
import { LONG_GAME } from './longGame';
import { MISSED_WINNING_MOVE } from './missedWinningMove';
import { NO_UNDO_WIN } from './noUndoWin';
import { OVERCONFIDENT_BLIND_ATTACK } from './overconfidentBlindAttack';
import { PLAYER_RESIGN } from './playerResign';
import { PLAYER_STREAK_WIN } from './playerStreakWin';
import { PLAYER_UNDO } from './playerUndo';
import { PLAYER_WIN } from './playerWin';
import { PLAYER_WIN_WITH_UNDO } from './playerWinWithUndo';
import { REVENGE_WIN_AFTER_LOSS_STREAK } from './revengeWinAfterLossStreak';
import { RUSH_MOVE } from './rushMove';
import { SPEED_WIN_QUICK } from './speedWinQuick';
import { SPLIT_BOARD_EXPEDITION } from './splitBoardExpedition';
import { SURRENDER_AFTER_LONG_THINKING } from './surrenderAfterLongThinking';
import { SURRENDER_ON_THREAT } from './surrenderOnThreat';
import { SYMMETRY_BREAK_SURPRISE } from './symmetryBreakSurprise';
import { TRIANGLE_FORMATION } from './triangleFormation';
import { TURTLE_DEFENSE } from './turtleDefense';
import { WIN_RIGHT_AFTER_UNDO } from './winRightAfterUndo';

export * from './accidentalSelfBlock';
export * from './blockAndCounterFour';
export * from './blockWrongEnd';
export * from './blunderMove';
export * from './botBlockThreat';
export * from './botTrap';
export * from './botWin';
export * from './botWinLeadingScore';
export * from './boxSurroundCenter';
export * from './centerMove';
export * from './cleanSweepDomination';
export * from './closeCombatHug';
export * from './clutch100Stones';
export * from './comebackWin';
export * from './consecutiveDraws';
export * from './consecutiveSpeedLosses';
export * from './copycatMove';
export * from './cornerMove';
export * from './deadFourBlocked';
export * from './doubleThreeTrap';
export * from './edgeWalkMove';
export * from './fastMoveTaunt';
export * from './forkAttackDefenseFail';
export * from './fullDiagonalHighway';
export * from './gameDraw';
export * from './godLevelVictory';
export * from './ironCurtainWin';
export * from './isolatedFarMove';
export * from './jumpThreeTrap';
export * from './longGame';
export * from './missedWinningMove';
export * from './noUndoWin';
export * from './overconfidentBlindAttack';
export * from './playerResign';
export * from './playerStreakWin';
export * from './playerUndo';
export * from './playerWin';
export * from './playerWinWithUndo';
export * from './revengeWinAfterLossStreak';
export * from './rushMove';
export * from './speedWinQuick';
export * from './splitBoardExpedition';
export * from './surrenderAfterLongThinking';
export * from './surrenderOnThreat';
export * from './symmetryBreakSurprise';
export * from './triangleFormation';
export * from './turtleDefense';
export * from './winRightAfterUndo';

export const GAMEPLAY_TAUNTS: Record<string, TauntDefinition> = {
  ACCIDENTAL_SELF_BLOCK,
  BLOCK_AND_COUNTER_FOUR,
  BLOCK_WRONG_END,
  BLUNDER_MOVE,
  BOT_BLOCK_THREAT,
  BOT_TRAP,
  BOT_WIN,
  BOT_WIN_LEADING_SCORE,
  BOX_SURROUND_CENTER,
  CENTER_MOVE,
  CLEAN_SWEEP_DOMINATION,
  CLOSE_COMBAT_HUG,
  CLUTCH_100_STONES,
  COMEBACK_WIN,
  CONSECUTIVE_DRAWS,
  CONSECUTIVE_SPEED_LOSSES,
  COPYCAT_MOVE,
  CORNER_MOVE,
  DEAD_FOUR_BLOCKED,
  DOUBLE_THREE_TRAP,
  EDGE_WALK_MOVE,
  FAST_MOVE_TAUNT,
  FORK_ATTACK_DEFENSE_FAIL,
  FULL_DIAGONAL_HIGHWAY,
  GAME_DRAW,
  GOD_LEVEL_VICTORY,
  IRON_CURTAIN_WIN,
  ISOLATED_FAR_MOVE,
  JUMP_THREE_TRAP,
  LONG_GAME,
  MISSED_WINNING_MOVE,
  NO_UNDO_WIN,
  OVERCONFIDENT_BLIND_ATTACK,
  PLAYER_RESIGN,
  PLAYER_STREAK_WIN,
  PLAYER_UNDO,
  PLAYER_WIN,
  PLAYER_WIN_WITH_UNDO,
  REVENGE_WIN_AFTER_LOSS_STREAK,
  RUSH_MOVE,
  SPEED_WIN_QUICK,
  SPLIT_BOARD_EXPEDITION,
  SURRENDER_AFTER_LONG_THINKING,
  SURRENDER_ON_THREAT,
  SYMMETRY_BREAK_SURPRISE,
  TRIANGLE_FORMATION,
  TURTLE_DEFENSE,
  WIN_RIGHT_AFTER_UNDO,
};
