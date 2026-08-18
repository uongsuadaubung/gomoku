import type { TauntEvent } from './types';
import { GAMEPLAY_TAUNTS } from './gameplayTaunts';
import { IDLE_TAUNTS } from './idleTaunts';
import { INTERACTION_TAUNTS } from './interactionTaunts';
import { SYSTEM_TAUNTS } from './systemTaunts';

export * from './types';
export * from './gameplayTaunts';
export * from './idleTaunts';
export * from './interactionTaunts';
export * from './systemTaunts';

// Tổng hợp toàn bộ kho thoại khổng lồ (>1600 câu) từ các module chuyên biệt
export const TAUNT_DATABASE: Record<TauntEvent, string[]> = {
  ...GAMEPLAY_TAUNTS,
  ...IDLE_TAUNTS,
  ...INTERACTION_TAUNTS,
  ...SYSTEM_TAUNTS,
};
