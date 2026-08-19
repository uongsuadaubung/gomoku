import type { TauntDefinition } from '../types';
import { BREAK_LOSS_STREAK } from './breakLossStreak';
import { CLICK_AFTER_GAME_OVER } from './clickAfterGameOver';
import { CLICK_BEFORE_START } from './clickBeforeStart';
import { CLICK_OWN_STONE } from './clickOwnStone';
import { COPY_TAUNT_TEXT } from './copyTauntText';
import { CTRL_Z_SHORTCUT_ATTEMPT } from './ctrlZShortcutAttempt';
import { DEVTOOLS_INSPECT_HACK } from './devtoolsInspectHack';
import { DOUBLE_CLICK_STONE } from './doubleClickStone';
import { DRAG_SELECT_PANIC } from './dragSelectPanic';
import { GAME_START } from './gameStart';
import { HESITATION_DANCE } from './hesitationDance';
import { HOVER_UNDO_HESITATION } from './hoverUndoHesitation';
import { IMMEDIATE_REVENGE_CLICK } from './immediateRevengeClick';
import { KEYBOARD_SMASH_SPAM } from './keyboardSmashSpam';
import { LEVEL_UP_ALERT } from './levelUpAlert';
import { LONG_HOVER_CELL } from './longHoverCell';
import { MARATHON_SERIES } from './marathonSeries';
import { MOUSE_JIGGLE_PANIC } from './mouseJigglePanic';
import { MOUSE_LEAVE_VIEWPORT } from './mouseLeaveViewport';
import { MULTI_UNDO } from './multiUndo';
import { PLAYER_GOOD_MOVE } from './playerGoodMove';
import { POKE_BOT } from './pokeBot';
import { QUICK_MULTI_CELL_CLICKS } from './quickMultiCellClicks';
import { RAGE_DOWNGRADE_AFTER_LOSS } from './rageDowngradeAfterLoss';
import { RESIGN_WHILE_AI_THINKING } from './resignWhileAiThinking';
import { RIGHT_CLICK_INSPECT } from './rightClickInspect';
import { SCREENSHOT_ATTEMPT } from './screenshotAttempt';
import { SPACEBAR_SMASH } from './spacebarSmash';
import { SPAM_POKE_BOT } from './spamPokeBot';
import { STREAK_LOSS } from './streakLoss';
import { SWAP_SIDE_BOT_FIRST } from './swapSideBotFirst';
import { SWAP_SIDE_PLAYER_FIRST } from './swapSidePlayerFirst';
import { UNDO_BEFORE_AI_MOVES } from './undoBeforeAiMoves';
import { WHEEL_ZOOM_ATTEMPT } from './wheelZoomAttempt';
import { WINDOW_RESIZE_PANIC } from './windowResizePanic';

export * from './breakLossStreak';
export * from './clickAfterGameOver';
export * from './clickBeforeStart';
export * from './clickOwnStone';
export * from './copyTauntText';
export * from './ctrlZShortcutAttempt';
export * from './devtoolsInspectHack';
export * from './doubleClickStone';
export * from './dragSelectPanic';
export * from './gameStart';
export * from './hesitationDance';
export * from './hoverUndoHesitation';
export * from './immediateRevengeClick';
export * from './keyboardSmashSpam';
export * from './levelUpAlert';
export * from './longHoverCell';
export * from './marathonSeries';
export * from './mouseJigglePanic';
export * from './mouseLeaveViewport';
export * from './multiUndo';
export * from './playerGoodMove';
export * from './pokeBot';
export * from './quickMultiCellClicks';
export * from './rageDowngradeAfterLoss';
export * from './resignWhileAiThinking';
export * from './rightClickInspect';
export * from './screenshotAttempt';
export * from './spacebarSmash';
export * from './spamPokeBot';
export * from './streakLoss';
export * from './swapSideBotFirst';
export * from './swapSidePlayerFirst';
export * from './undoBeforeAiMoves';
export * from './wheelZoomAttempt';
export * from './windowResizePanic';

export const INTERACTION_TAUNTS: Record<string, TauntDefinition> = {
  BREAK_LOSS_STREAK,
  CLICK_AFTER_GAME_OVER,
  CLICK_BEFORE_START,
  CLICK_OWN_STONE,
  COPY_TAUNT_TEXT,
  CTRL_Z_SHORTCUT_ATTEMPT,
  DEVTOOLS_INSPECT_HACK,
  DOUBLE_CLICK_STONE,
  DRAG_SELECT_PANIC,
  GAME_START,
  HESITATION_DANCE,
  HOVER_UNDO_HESITATION,
  IMMEDIATE_REVENGE_CLICK,
  KEYBOARD_SMASH_SPAM,
  LEVEL_UP_ALERT,
  LONG_HOVER_CELL,
  MARATHON_SERIES,
  MOUSE_JIGGLE_PANIC,
  MOUSE_LEAVE_VIEWPORT,
  MULTI_UNDO,
  PLAYER_GOOD_MOVE,
  POKE_BOT,
  QUICK_MULTI_CELL_CLICKS,
  RAGE_DOWNGRADE_AFTER_LOSS,
  RESIGN_WHILE_AI_THINKING,
  RIGHT_CLICK_INSPECT,
  SCREENSHOT_ATTEMPT,
  SPACEBAR_SMASH,
  SPAM_POKE_BOT,
  STREAK_LOSS,
  SWAP_SIDE_BOT_FIRST,
  SWAP_SIDE_PLAYER_FIRST,
  UNDO_BEFORE_AI_MOVES,
  WHEEL_ZOOM_ATTEMPT,
  WINDOW_RESIZE_PANIC,
};
