import type { TauntDefinition } from '../types';
import { BOARD_STYLE_CHANGE } from './boardStyleChange';
import { CHANGE_BOT_LEVEL_DOWN } from './changeBotLevelDown';
import { CHANGE_BOT_LEVEL_UP } from './changeBotLevelUp';
import { CLICK_OCCUPIED_CELL } from './clickOccupiedCell';
import { OPEN_BOT_MODAL } from './openBotModal';
import { OPEN_RULES } from './openRules';
import { OPEN_STATS } from './openStats';
import { RESET_STATS } from './resetStats';
import { SOUND_MUTE } from './soundMute';
import { SOUND_UNMUTE } from './soundUnmute';
import { TAB_BLUR } from './tabBlur';
import { TAB_FOCUS } from './tabFocus';
import { THEME_CHANGE } from './themeChange';
import { TOGGLE_STEP_NUMBERS } from './toggleStepNumbers';

export * from './boardStyleChange';
export * from './changeBotLevelDown';
export * from './changeBotLevelUp';
export * from './clickOccupiedCell';
export * from './openBotModal';
export * from './openRules';
export * from './openStats';
export * from './resetStats';
export * from './soundMute';
export * from './soundUnmute';
export * from './tabBlur';
export * from './tabFocus';
export * from './themeChange';
export * from './toggleStepNumbers';

export const SYSTEM_TAUNTS: Record<string, TauntDefinition> = {
  BOARD_STYLE_CHANGE,
  CHANGE_BOT_LEVEL_DOWN,
  CHANGE_BOT_LEVEL_UP,
  CLICK_OCCUPIED_CELL,
  OPEN_BOT_MODAL,
  OPEN_RULES,
  OPEN_STATS,
  RESET_STATS,
  SOUND_MUTE,
  SOUND_UNMUTE,
  TAB_BLUR,
  TAB_FOCUS,
  THEME_CHANGE,
  TOGGLE_STEP_NUMBERS,
};
