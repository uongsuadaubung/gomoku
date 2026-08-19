import type { TauntEvent } from './types';
import { GAMEPLAY_TAUNTS } from './gameplay';
import { IDLE_TAUNTS } from './idle';
import { INTERACTION_TAUNTS } from './interaction';
import { SYSTEM_TAUNTS } from './system';

export * from './types';
export * from './gameplay';
export * from './idle';
export * from './interaction';
export * from './system';

// Tổng hợp toàn bộ kho thoại khổng lồ (6070 câu) từ 45 module chuyên biệt
export const TAUNT_DATABASE: Record<TauntEvent, string[]> = {
  ...GAMEPLAY_TAUNTS,
  ...IDLE_TAUNTS,
  ...INTERACTION_TAUNTS,
  ...SYSTEM_TAUNTS,
};
