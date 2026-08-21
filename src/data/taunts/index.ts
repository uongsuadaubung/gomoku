import type { TauntEvent, TauntDefinition } from './types';
import { GAMEPLAY_TAUNTS } from './gameplay';
import { IDLE_TAUNTS } from './idle';
import { INTERACTION_TAUNTS } from './interaction';
import { SYSTEM_TAUNTS } from './system';

export * from './types';
export * from './gameplay';
export * from './idle';
export * from './interaction';
export * from './system';

// Tổng hợp Registry định nghĩa các sự kiện (chứa metadata mood và câu thoại)
export const TAUNT_REGISTRY: Record<TauntEvent, TauntDefinition> = {
  ...GAMEPLAY_TAUNTS,
  ...IDLE_TAUNTS,
  ...INTERACTION_TAUNTS,
  ...SYSTEM_TAUNTS,
};

// Cung cấp mảng câu thoại cho script kiểm thử và các module cần danh sách thô
export const TAUNT_DATABASE: Record<string, string[]> = Object.fromEntries(
  Object.entries(TAUNT_REGISTRY).map(([k, v]) => [k, v.texts])
);
