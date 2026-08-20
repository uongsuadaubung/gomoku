import { ActivePlayer, BoardMatrix, MoveHistoryItem, UserStats } from '../game/types';
import { AI_LEVELS } from '../game/constants';
import { TauntEvent } from '../data/taunts/types';
import { TauntService } from './tauntService';

export interface Rule<T> {
  id: string;
  priority: number;
  match: (ctx: T) => boolean;
  taunt: TauntEvent;
  probability?: number;
}

export interface PlayerMoveContext {
  prevBoard: BoardMatrix;
  nextBoard: BoardMatrix;
  row: number;
  col: number;
  player: ActivePlayer;
  ai: ActivePlayer;
  history: MoveHistoryItem[];
  timeSinceLastMove?: number;
}

export interface PreMoveContext {
  row: number;
  col: number;
  history: MoveHistoryItem[];
  player: ActivePlayer;
  ai: ActivePlayer;
  timeSinceLastMove: number;
}

export interface PlayerWinContext {
  moveCount: number;
  hadComeback: boolean;
  undoCount: number;
  wasUndoJustUsed: boolean;
  botEverHadOpenThreat: boolean;
  prevStats: UserStats;
  currentLevelId?: number;
}

export interface BotWinContext {
  moveCount: number;
  wasLastGameSpeedLoss: boolean;
  isHeavyLossStreak: boolean;
  isImmediateRevenge?: boolean;
  durationMs?: number;
  winningMoveRow?: number;
  winningMoveCol?: number;
}

export interface UndoContext {
  isInstantUndo: boolean;
  recentUndoCount: number;
}

export interface IdleContext {
  isPlaying: boolean;
  isAiThinking: boolean;
  isPlayerLastGameLost: boolean;
  hasTriggeredStareAtWinLine: boolean;
}

// -------------------------------------------------------------
// 1. Pipeline đánh giá nước đi chiến thuật của Người chơi
// -------------------------------------------------------------
const PLAYER_MOVE_RULES: Rule<PlayerMoveContext>[] = [
  {
    id: 'overconfident_blind_attack',
    priority: 105,
    match: ctx => TauntService.isOverconfidentBlindAttack(ctx.prevBoard, ctx.nextBoard, ctx.ai, ctx.player, ctx.row, ctx.col),
    taunt: 'OVERCONFIDENT_BLIND_ATTACK',
  },
  {
    id: 'four_three_double_attack',
    priority: 104,
    match: ctx => TauntService.isFourThreeAttack(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'FOUR_THREE_DOUBLE_ATTACK',
  },
  {
    id: 'open_four_blunder',
    priority: 103,
    match: ctx => TauntService.isOpenFourBlunder(ctx.prevBoard, ctx.nextBoard, ctx.ai, ctx.player, ctx.row, ctx.col),
    taunt: 'OPEN_FOUR_BLUNDER',
  },
  {
    id: 'missed_winning_move',
    priority: 102,
    match: ctx => TauntService.hasMissedWinningMove(ctx.prevBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'MISSED_WINNING_MOVE',
  },
  {
    id: 'block_and_counter_four',
    priority: 100,
    match: ctx => TauntService.isBlockAndCounterFour(ctx.prevBoard, ctx.nextBoard, ctx.ai, ctx.player, ctx.row, ctx.col),
    taunt: 'BLOCK_AND_COUNTER_FOUR',
  },
  {
    id: 'block_wrong_end',
    priority: 98,
    match: ctx => TauntService.isBlockWrongEnd(ctx.prevBoard, ctx.nextBoard, ctx.ai, ctx.player, ctx.row, ctx.col),
    taunt: 'BLOCK_WRONG_END',
  },
  {
    id: 'symmetry_break_surprise',
    priority: 95,
    match: ctx => TauntService.isSymmetryBreakSurprise(ctx.history, ctx.row, ctx.col, ctx.player, ctx.ai),
    taunt: 'SYMMETRY_BREAK_SURPRISE',
  },
  {
    id: 'jump_three_trap',
    priority: 92,
    match: ctx => TauntService.isJumpThreeTrap(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'JUMP_THREE_TRAP',
  },
  {
    id: 'double_three_trap',
    priority: 88,
    match: ctx => TauntService.isPlayerDoubleThreat(ctx.nextBoard, ctx.player),
    taunt: 'DOUBLE_THREE_TRAP',
  },
  {
    id: 'fork_attack_defense_fail',
    priority: 85,
    match: ctx => TauntService.isForkAttackDefenseFail(ctx.prevBoard, ctx.ai, ctx.player, ctx.row, ctx.col),
    taunt: 'FORK_ATTACK_DEFENSE_FAIL',
  },
  {
    id: 'overthinking_blunder',
    priority: 83,
    match: ctx => (ctx.timeSinceLastMove !== undefined && ctx.timeSinceLastMove > 20000) && TauntService.isPlayerBlunder(ctx.nextBoard, ctx.ai, ctx.row, ctx.col),
    taunt: 'OVERTHINKING_BLUNDER',
  },
  {
    id: 'blunder_move',
    priority: 82,
    match: ctx => TauntService.isPlayerBlunder(ctx.nextBoard, ctx.ai, ctx.row, ctx.col),
    taunt: 'BLUNDER_MOVE',
  },
  {
    id: 'double_dead_four',
    priority: 81,
    match: ctx => TauntService.isDoubleDeadFour(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'DOUBLE_DEAD_FOUR',
  },
  {
    id: 'dead_four_blocked',
    priority: 80,
    match: ctx => TauntService.isDeadFourBlocked(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'DEAD_FOUR_BLOCKED',
  },
  {
    id: 'accidental_self_block',
    priority: 75,
    match: ctx => TauntService.hasAccidentalSelfBlock(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'ACCIDENTAL_SELF_BLOCK',
  },
  {
    id: 'split_board_expedition',
    priority: 70,
    match: ctx => {
      const playerMoves = ctx.history.filter(m => m.player === ctx.player);
      const lastPlayerMove = playerMoves.length >= 2 ? playerMoves[playerMoves.length - 2] : null;
      return TauntService.isSplitBoardExpedition(lastPlayerMove, { row: ctx.row, col: ctx.col }, ctx.history.length);
    },
    taunt: 'SPLIT_BOARD_EXPEDITION',
  },
  {
    id: 'box_surround_center',
    priority: 68,
    match: ctx => TauntService.isBoxSurroundCenter(ctx.nextBoard, ctx.player, ctx.history.length),
    taunt: 'BOX_SURROUND_CENTER',
  },
  {
    id: 't_shape_formation',
    priority: 67,
    match: ctx => TauntService.isTShapeFormation(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'T_SHAPE_FORMATION',
  },
  {
    id: 'triangle_formation',
    priority: 66,
    match: ctx => TauntService.isTriangleFormation(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'TRIANGLE_FORMATION',
  },
  {
    id: 'diagonal_cross_formation',
    priority: 65,
    match: ctx => TauntService.isDiagonalCrossFormation(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'DIAGONAL_CROSS_FORMATION',
  },
  {
    id: 'turtle_defense',
    priority: 64,
    match: ctx => TauntService.isTurtleDefense(ctx.nextBoard, ctx.player, ctx.ai, ctx.history),
    taunt: 'TURTLE_DEFENSE',
  },
  {
    id: 'zigzag_lightning',
    priority: 63,
    match: ctx => TauntService.isZigzagLightning(ctx.history, ctx.player),
    taunt: 'ZIGZAG_LIGHTNING',
  },
  {
    id: 'full_diagonal_highway',
    priority: 62,
    match: ctx => TauntService.isFullDiagonalHighway(ctx.nextBoard, ctx.player, ctx.row, ctx.col),
    taunt: 'FULL_DIAGONAL_HIGHWAY',
  },
  {
    id: 'checkerboard_weave',
    priority: 61,
    match: ctx => TauntService.isCheckerboardWeave(ctx.history),
    taunt: 'CHECKERBOARD_WEAVE',
  },
  {
    id: 'isolated_far_move',
    priority: 60,
    match: ctx => TauntService.isIsolatedFarMove(ctx.prevBoard, ctx.row, ctx.col),
    taunt: 'ISOLATED_FAR_MOVE',
  },
  {
    id: 'close_combat_hug',
    priority: 55,
    match: ctx => {
      const pMoves = ctx.history.filter(m => m.player === ctx.player).map(m => ({ row: m.row, col: m.col }));
      const bMoves = ctx.history.filter(m => m.player === ctx.ai).map(m => ({ row: m.row, col: m.col }));
      return TauntService.isCloseCombatHug(pMoves, bMoves);
    },
    taunt: 'CLOSE_COMBAT_HUG',
  },
  {
    id: 'player_good_move',
    priority: 40,
    probability: 0.45,
    match: ctx => TauntService.isPlayerThreatMove(ctx.nextBoard, ctx.player),
    taunt: 'PLAYER_GOOD_MOVE',
  },
];

// -------------------------------------------------------------
// 2. Pipeline đánh giá nước mở màn & tốc độ đi cờ (Pre-Move)
// -------------------------------------------------------------
const PRE_MOVE_RULES: Rule<PreMoveContext>[] = [
  {
    id: 'center_move',
    priority: 100,
    match: ctx => ctx.row === 7 && ctx.col === 7 && ctx.history.length <= 1,
    taunt: 'CENTER_MOVE',
  },
  {
    id: 'corner_move',
    priority: 90,
    match: ctx => (ctx.row === 0 || ctx.row === 14) && (ctx.col === 0 || ctx.col === 14),
    taunt: 'CORNER_MOVE',
  },
  {
    id: 'edge_walk_move',
    priority: 80,
    match: ctx => (ctx.row === 0 || ctx.row === 14 || ctx.col === 0 || ctx.col === 14) && ctx.history.length <= 25,
    taunt: 'EDGE_WALK_MOVE',
  },
  {
    id: 'copycat_move',
    priority: 70,
    probability: 0.6,
    match: ctx => {
      if (ctx.history.length < 1) return false;
      const lastBotMove = ctx.history[ctx.history.length - 1];
      return lastBotMove.player === ctx.ai && TauntService.isMirrorMove(lastBotMove.row, lastBotMove.col, ctx.row, ctx.col);
    },
    taunt: 'COPYCAT_MOVE',
  },
  {
    id: 'rush_move',
    priority: 60,
    probability: 0.6,
    match: ctx => ctx.history.length >= 2 && ctx.timeSinceLastMove < 450,
    taunt: 'RUSH_MOVE',
  },
  {
    id: 'fast_move_taunt',
    priority: 50,
    probability: 0.35,
    match: ctx => ctx.history.length >= 2 && ctx.timeSinceLastMove < 800,
    taunt: 'FAST_MOVE_TAUNT',
  },
];

// -------------------------------------------------------------
// 3. Pipeline đánh giá kết quả khi Người chơi thắng
// -------------------------------------------------------------
const PLAYER_WIN_RULES: Rule<PlayerWinContext>[] = [
  {
    id: 'god_level_victory',
    priority: 110,
    match: ctx => ctx.currentLevelId === AI_LEVELS.length,
    taunt: 'GOD_LEVEL_VICTORY',
  },
  {
    id: 'win_right_after_undo',
    priority: 100,
    match: ctx => ctx.wasUndoJustUsed,
    taunt: 'WIN_RIGHT_AFTER_UNDO',
  },
  {
    id: 'speed_win_quick',
    priority: 90,
    match: ctx => ctx.moveCount <= 10,
    taunt: 'SPEED_WIN_QUICK',
  },
  {
    id: 'iron_curtain_win',
    priority: 80,
    match: ctx => ctx.moveCount >= 50,
    taunt: 'IRON_CURTAIN_WIN',
  },
  {
    id: 'clean_sweep_domination',
    priority: 70,
    match: ctx => !ctx.botEverHadOpenThreat && ctx.moveCount >= 10,
    taunt: 'CLEAN_SWEEP_DOMINATION',
  },
  {
    id: 'comeback_win',
    priority: 60,
    match: ctx => ctx.hadComeback,
    taunt: 'COMEBACK_WIN',
  },
  {
    id: 'no_undo_win',
    priority: 50,
    match: ctx => ctx.undoCount === 0 && ctx.moveCount >= 14,
    taunt: 'NO_UNDO_WIN',
  },
  {
    id: 'revenge_win_after_loss_streak',
    priority: 40,
    probability: 0.5,
    match: ctx => ctx.prevStats.losses >= 3 && ctx.prevStats.currentStreak === 0,
    taunt: 'REVENGE_WIN_AFTER_LOSS_STREAK',
  },
  {
    id: 'break_loss_streak',
    priority: 39,
    match: ctx => ctx.prevStats.losses >= 3 && ctx.prevStats.currentStreak === 0,
    taunt: 'BREAK_LOSS_STREAK',
  },
  {
    id: 'player_streak_win',
    priority: 30,
    match: ctx => ctx.prevStats.currentStreak >= 2,
    taunt: 'PLAYER_STREAK_WIN',
  },
  {
    id: 'player_win_default',
    priority: 1,
    match: () => true,
    taunt: 'PLAYER_WIN',
  },
];

// -------------------------------------------------------------
// 4. Pipeline đánh giá kết quả khi Bot thắng
// -------------------------------------------------------------
const BOT_WIN_RULES: Rule<BotWinContext>[] = [
  {
    id: 'unlucky_thirteen_moves',
    priority: 110,
    match: ctx => ctx.moveCount === 13,
    taunt: 'UNLUCKY_THIRTEEN_MOVES',
  },
  {
    id: 'speed_revenge_fail',
    priority: 105,
    match: ctx => !!ctx.isImmediateRevenge && ctx.moveCount <= 10,
    taunt: 'SPEED_REVENGE_FAIL',
  },
  {
    id: 'consecutive_speed_losses',
    priority: 100,
    match: ctx => ctx.moveCount <= 12 && ctx.wasLastGameSpeedLoss,
    taunt: 'CONSECUTIVE_SPEED_LOSSES',
  },
  {
    id: 'corner_death_trap',
    priority: 95,
    match: ctx => ctx.winningMoveRow !== undefined && ctx.winningMoveCol !== undefined && TauntService.isCornerDeathTrap(ctx.winningMoveRow, ctx.winningMoveCol),
    taunt: 'CORNER_DEATH_TRAP',
  },
  {
    id: 'one_minute_bullet_win',
    priority: 85,
    match: ctx => (ctx.durationMs !== undefined && ctx.durationMs <= 60000) || ctx.moveCount <= 8,
    taunt: 'ONE_MINUTE_BULLET_WIN',
  },
  {
    id: 'speed_win_quick',
    priority: 80,
    match: ctx => ctx.moveCount <= 10,
    taunt: 'SPEED_WIN_QUICK',
  },
  {
    id: 'streak_loss',
    priority: 60,
    match: ctx => ctx.isHeavyLossStreak,
    taunt: 'STREAK_LOSS',
  },
  {
    id: 'bot_win_default',
    priority: 1,
    match: () => true,
    taunt: 'BOT_WIN',
  },
];

/**
 * Bộ điều phối đánh giá luật (Rule Engine Evaluator)
 */
export class TauntEvaluator {
  /**
   * Đánh giá và chọn Rule khớp đầu tiên theo độ ưu tiên
   */
  private static executePipeline<T>(rules: Rule<T>[], ctx: T): TauntEvent | null {
    // Rules đã được xếp sẵn theo priority giảm dần
    for (const rule of rules) {
      if (rule.match(ctx)) {
        if (rule.probability === undefined || Math.random() < rule.probability) {
          return rule.taunt;
        }
      }
    }
    return null;
  }

  /**
   * Đánh giá phản xạ trước / trong khi đi nước (mở cờ, đánh nhanh, vị trí đặc biệt)
   */
  static evaluatePreMove(ctx: PreMoveContext): TauntEvent | null {
    return this.executePipeline(PRE_MOVE_RULES, ctx);
  }

  /**
   * Đánh giá kịch bản nước cờ chiến thuật sau khi đặt quân
   */
  static evaluatePlayerMove(ctx: PlayerMoveContext): TauntEvent | null {
    return this.executePipeline(PLAYER_MOVE_RULES, ctx);
  }

  /**
   * Đánh giá kịch bản khi Người chơi giành chiến thắng
   */
  static evaluatePlayerWin(ctx: PlayerWinContext): TauntEvent {
    return this.executePipeline(PLAYER_WIN_RULES, ctx) || 'PLAYER_WIN';
  }

  /**
   * Đánh giá kịch bản khi Bot giành chiến thắng
   */
  static evaluateBotWin(ctx: BotWinContext): TauntEvent {
    return this.executePipeline(BOT_WIN_RULES, ctx) || 'BOT_WIN';
  }

  /**
   * Đánh giá thao tác Undo (hoãn nước cờ)
   */
  static evaluateUndo(ctx: UndoContext): TauntEvent {
    if (ctx.isInstantUndo) return 'UNDO_BEFORE_AI_MOVES';
    if (ctx.recentUndoCount >= 3) return 'MULTI_UNDO';
    return 'PLAYER_UNDO';
  }

  /**
   * Đánh giá kịch bản hòa cờ
   */
  static evaluateDraw(consecutiveDrawsCount: number): TauntEvent {
    if (consecutiveDrawsCount >= 3) return 'TIT_FOR_TAT_DRAWS';
    if (consecutiveDrawsCount === 2) return 'CONSECUTIVE_DRAWS';
    return 'GAME_DRAW';
  }

  /**
   * Đánh giá trạng thái chờ (Idle / AFK)
   */
  static evaluateIdle(ctx: IdleContext): { event: TauntEvent; consumeStareAtWinLine?: boolean } {
    if (ctx.isPlaying) {
      if (ctx.isAiThinking) {
        return { event: 'IDLE_THINKING' };
      }
      return { event: 'IDLE_IN_GAME' };
    }

    // Ngoài trận đấu (idle, sau khi thắng/thua)
    if (ctx.isPlayerLastGameLost) {
      if (!ctx.hasTriggeredStareAtWinLine) {
        return { event: 'STARE_AT_WIN_LINE', consumeStareAtWinLine: true };
      }
      return { event: 'IDLE_AFTER_LOSS' };
    }

    return { event: 'IDLE_PRE_GAME' };
  }
}
