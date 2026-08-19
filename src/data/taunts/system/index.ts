import type { TauntDefinition } from '../types';
import { AFTERNOON_FOOD_COMA } from './afternoonFoodComa';
import { BOARD_STYLE_CHANGE } from './boardStyleChange';
import { CHANGE_BOT_LEVEL_DOWN } from './changeBotLevelDown';
import { CHANGE_BOT_LEVEL_UP } from './changeBotLevelUp';
import { CLICK_OCCUPIED_CELL } from './clickOccupiedCell';
import { DESPERATE_THEME_SWAP } from './desperateThemeSwap';
import { EARLY_MORNING_COFFEE } from './earlyMorningCoffee';
import { LATE_NIGHT_PLAY } from './lateNightPlay';
import { LUNCH_BREAK_RUSH } from './lunchBreakRush';
import { MIDNIGHT_BATTERY_LOW } from './midnightBatteryLow';
import { MONDAY_BLUES } from './mondayBlues';
import { OPEN_BOT_MODAL } from './openBotModal';
import { OPEN_RULES } from './openRules';
import { OPEN_STATS } from './openStats';
import { PERFECT_CENTURY_GAMES } from './perfectCenturyGames';
import { RAGE_QUIT_F5_RELOAD } from './rageQuitF5Reload';
import { RAPID_THEME_CYCLING } from './rapidThemeCycling';
import { RESET_STATS } from './resetStats';
import { SOUND_MUTE } from './soundMute';
import { SOUND_SPAM_TOGGLE } from './soundSpamToggle';
import { SOUND_UNMUTE } from './soundUnmute';
import { SWITCH_BOARD_STYLE_MID_GAME } from './switchBoardStyleMidGame';
import { TAB_BLUR } from './tabBlur';
import { TAB_FOCUS } from './tabFocus';
import { TGIF_FRIDAY_AFTERNOON } from './tgifFridayAfternoon';
import { THEME_CHANGE } from './themeChange';
import { TOGGLE_STEP_NUMBERS } from './toggleStepNumbers';
import { WEEKEND_CHILL } from './weekendChill';
import { WIN_RATE_DROP_BELOW_50 } from './winRateDropBelow50';

export * from './afternoonFoodComa';
export * from './boardStyleChange';
export * from './changeBotLevelDown';
export * from './changeBotLevelUp';
export * from './clickOccupiedCell';
export * from './desperateThemeSwap';
export * from './earlyMorningCoffee';
export * from './lateNightPlay';
export * from './lunchBreakRush';
export * from './midnightBatteryLow';
export * from './mondayBlues';
export * from './openBotModal';
export * from './openRules';
export * from './openStats';
export * from './perfectCenturyGames';
export * from './rageQuitF5Reload';
export * from './rapidThemeCycling';
export * from './resetStats';
export * from './soundMute';
export * from './soundSpamToggle';
export * from './soundUnmute';
export * from './switchBoardStyleMidGame';
export * from './tabBlur';
export * from './tabFocus';
export * from './tgifFridayAfternoon';
export * from './themeChange';
export * from './toggleStepNumbers';
export * from './weekendChill';
export * from './winRateDropBelow50';

export const SYSTEM_TAUNTS: Record<string, TauntDefinition> = {
  AFTERNOON_FOOD_COMA,
  BOARD_STYLE_CHANGE,
  CHANGE_BOT_LEVEL_DOWN,
  CHANGE_BOT_LEVEL_UP,
  CLICK_OCCUPIED_CELL,
  DESPERATE_THEME_SWAP,
  EARLY_MORNING_COFFEE,
  LATE_NIGHT_PLAY,
  LUNCH_BREAK_RUSH,
  MIDNIGHT_BATTERY_LOW,
  MONDAY_BLUES,
  OPEN_BOT_MODAL,
  OPEN_RULES,
  OPEN_STATS,
  PERFECT_CENTURY_GAMES,
  RAGE_QUIT_F5_RELOAD,
  RAPID_THEME_CYCLING,
  RESET_STATS,
  SOUND_MUTE,
  SOUND_SPAM_TOGGLE,
  SOUND_UNMUTE,
  SWITCH_BOARD_STYLE_MID_GAME,
  TAB_BLUR,
  TAB_FOCUS,
  TGIF_FRIDAY_AFTERNOON,
  THEME_CHANGE,
  TOGGLE_STEP_NUMBERS,
  WEEKEND_CHILL,
  WIN_RATE_DROP_BELOW_50,
};
