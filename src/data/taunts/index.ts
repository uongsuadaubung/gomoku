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

// Tổng hợp Registry định nghĩa 45 sự kiện (chứa metadata mood và câu thoại)
export const TAUNT_REGISTRY: Record<TauntEvent, TauntDefinition> = {
  ...GAMEPLAY_TAUNTS,
  ...IDLE_TAUNTS,
  ...INTERACTION_TAUNTS,
  ...SYSTEM_TAUNTS,
} as Record<TauntEvent, TauntDefinition>;

// Cung cấp backward-compatibility cho các nơi cần lấy trực tiếp mảng câu thoại
export const TAUNT_DATABASE: Record<TauntEvent, string[]> = Object.fromEntries(
  Object.entries(TAUNT_REGISTRY).map(([k, v]) => [k, v.texts])
) as Record<TauntEvent, string[]>;
