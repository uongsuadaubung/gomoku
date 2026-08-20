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
import { CHECKERBOARD_WEAVE } from './checkerboardWeave';
import { CLEAN_SWEEP_DOMINATION } from './cleanSweepDomination';
import { CLOSE_COMBAT_HUG } from './closeCombatHug';
import { CLUTCH_100_STONES } from './clutch100Stones';
import { COMEBACK_WIN } from './comebackWin';
import { CONSECUTIVE_DRAWS } from './consecutiveDraws';
import { CONSECUTIVE_SPEED_LOSSES } from './consecutiveSpeedLosses';
import { COPYCAT_MOVE } from './copycatMove';
import { CORNER_DEATH_TRAP } from './cornerDeathTrap';
import { CORNER_MOVE } from './cornerMove';
import { DEAD_FOUR_BLOCKED } from './deadFourBlocked';
import { DIAGONAL_CROSS_FORMATION } from './diagonalCrossFormation';
import { DOUBLE_DEAD_FOUR } from './doubleDeadFour';
import { DOUBLE_THREE_TRAP } from './doubleThreeTrap';
import { EDGE_WALK_MOVE } from './edgeWalkMove';
import { FAST_MOVE_TAUNT } from './fastMoveTaunt';
import { FORK_ATTACK_DEFENSE_FAIL } from './forkAttackDefenseFail';
import { FOUR_THREE_DOUBLE_ATTACK } from './fourThreeDoubleAttack';
import { FULL_DIAGONAL_HIGHWAY } from './fullDiagonalHighway';
import { GAME_DRAW } from './gameDraw';
import { GOD_LEVEL_VICTORY } from './godLevelVictory';
import { IRON_CURTAIN_WIN } from './ironCurtainWin';
import { ISOLATED_FAR_MOVE } from './isolatedFarMove';
import { JUMP_THREE_TRAP } from './jumpThreeTrap';
import { LONG_GAME } from './longGame';
import { MISSED_WINNING_MOVE } from './missedWinningMove';
import { NO_UNDO_WIN } from './noUndoWin';
import { ONE_MINUTE_BULLET_WIN } from './oneMinuteBulletWin';
import { OPEN_FOUR_BLUNDER } from './openFourBlunder';
import { OVERCONFIDENT_BLIND_ATTACK } from './overconfidentBlindAttack';
import { OVERTHINKING_BLUNDER } from './overthinkingBlunder';
import { PLAYER_RESIGN } from './playerResign';
import { TIMEOUT_LOSS } from './timeoutLoss';
import { PLAYER_STREAK_WIN } from './playerStreakWin';
import { PLAYER_UNDO } from './playerUndo';
import { PLAYER_WIN } from './playerWin';
import { PLAYER_WIN_WITH_UNDO } from './playerWinWithUndo';
import { REPEATED_UNDO_SAME_MOVE } from './repeatedUndoSameMove';
import { REVENGE_WIN_AFTER_LOSS_STREAK } from './revengeWinAfterLossStreak';
import { RUSH_MOVE } from './rushMove';
import { SPEED_REVENGE_FAIL } from './speedRevengeFail';
import { SPEED_WIN_QUICK } from './speedWinQuick';
import { SPLIT_BOARD_EXPEDITION } from './splitBoardExpedition';
import { SURRENDER_AFTER_LONG_THINKING } from './surrenderAfterLongThinking';
import { SURRENDER_ON_THREAT } from './surrenderOnThreat';
import { SYMMETRY_BREAK_SURPRISE } from './symmetryBreakSurprise';
import { T_SHAPE_FORMATION } from './tShapeFormation';
import { TIT_FOR_TAT_DRAWS } from './titForTatDraws';
import { TRIANGLE_FORMATION } from './triangleFormation';
import { TURTLE_DEFENSE } from './turtleDefense';
import { UNLUCKY_THIRTEEN_MOVES } from './unluckyThirteenMoves';
import { WIN_RIGHT_AFTER_UNDO } from './winRightAfterUndo';
import { ZIGZAG_LIGHTNING } from './zigzagLightning';

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
export * from './checkerboardWeave';
export * from './cleanSweepDomination';
export * from './closeCombatHug';
export * from './clutch100Stones';
export * from './comebackWin';
export * from './consecutiveDraws';
export * from './consecutiveSpeedLosses';
export * from './copycatMove';
export * from './cornerDeathTrap';
export * from './cornerMove';
export * from './deadFourBlocked';
export * from './diagonalCrossFormation';
export * from './doubleDeadFour';
export * from './doubleThreeTrap';
export * from './edgeWalkMove';
export * from './fastMoveTaunt';
export * from './forkAttackDefenseFail';
export * from './fourThreeDoubleAttack';
export * from './fullDiagonalHighway';
export * from './gameDraw';
export * from './godLevelVictory';
export * from './ironCurtainWin';
export * from './isolatedFarMove';
export * from './jumpThreeTrap';
export * from './longGame';
export * from './missedWinningMove';
export * from './noUndoWin';
export * from './oneMinuteBulletWin';
export * from './openFourBlunder';
export * from './overconfidentBlindAttack';
export * from './overthinkingBlunder';
export * from './playerResign';
export * from './playerStreakWin';
export * from './playerUndo';
export * from './playerWin';
export * from './playerWinWithUndo';
export * from './repeatedUndoSameMove';
export * from './revengeWinAfterLossStreak';
export * from './rushMove';
export * from './speedRevengeFail';
export * from './speedWinQuick';
export * from './splitBoardExpedition';
export * from './surrenderAfterLongThinking';
export * from './surrenderOnThreat';
export * from './symmetryBreakSurprise';
export * from './tShapeFormation';
export * from './titForTatDraws';
export * from './triangleFormation';
export * from './turtleDefense';
export * from './unluckyThirteenMoves';
export * from './winRightAfterUndo';
export * from './zigzagLightning';

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
  CHECKERBOARD_WEAVE,
  CLEAN_SWEEP_DOMINATION,
  CLOSE_COMBAT_HUG,
  CLUTCH_100_STONES,
  COMEBACK_WIN,
  CONSECUTIVE_DRAWS,
  CONSECUTIVE_SPEED_LOSSES,
  COPYCAT_MOVE,
  CORNER_DEATH_TRAP,
  CORNER_MOVE,
  DEAD_FOUR_BLOCKED,
  DIAGONAL_CROSS_FORMATION,
  DOUBLE_DEAD_FOUR,
  DOUBLE_THREE_TRAP,
  EDGE_WALK_MOVE,
  FAST_MOVE_TAUNT,
  FORK_ATTACK_DEFENSE_FAIL,
  FOUR_THREE_DOUBLE_ATTACK,
  FULL_DIAGONAL_HIGHWAY,
  GAME_DRAW,
  GOD_LEVEL_VICTORY,
  IRON_CURTAIN_WIN,
  ISOLATED_FAR_MOVE,
  JUMP_THREE_TRAP,
  LONG_GAME,
  MISSED_WINNING_MOVE,
  NO_UNDO_WIN,
  ONE_MINUTE_BULLET_WIN,
  OPEN_FOUR_BLUNDER,
  OVERCONFIDENT_BLIND_ATTACK,
  OVERTHINKING_BLUNDER,
  PLAYER_RESIGN,
  TIMEOUT_LOSS,
  PLAYER_STREAK_WIN,
  PLAYER_UNDO,
  PLAYER_WIN,
  PLAYER_WIN_WITH_UNDO,
  REPEATED_UNDO_SAME_MOVE,
  REVENGE_WIN_AFTER_LOSS_STREAK,
  RUSH_MOVE,
  SPEED_REVENGE_FAIL,
  SPEED_WIN_QUICK,
  SPLIT_BOARD_EXPEDITION,
  SURRENDER_AFTER_LONG_THINKING,
  SURRENDER_ON_THREAT,
  SYMMETRY_BREAK_SURPRISE,
  T_SHAPE_FORMATION,
  TIT_FOR_TAT_DRAWS,
  TRIANGLE_FORMATION,
  TURTLE_DEFENSE,
  UNLUCKY_THIRTEEN_MOVES,
  WIN_RIGHT_AFTER_UNDO,
  ZIGZAG_LIGHTNING,
};
