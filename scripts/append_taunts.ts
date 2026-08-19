import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TauntEvent } from '../src/data/taunts/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tauntsDir = path.resolve(__dirname, '../src/data/taunts');

/**
 * =========================================================================
 * ✍️ BẢNG ĐIỀN CÂU THOẠI MỚI CẦN BỔ SUNG (APPEND TAUNTS)
 * =========================================================================
 * - Điền câu thoại mới vào mảng tương ứng.
 * - Mảng rỗng [] sẽ được tự động bỏ qua, không làm thay đổi file.
 * - Bắt buộc phải có đủ 100% tất cả sự kiện (93/93 sự kiện - Type-safe 100%).
 * - Tự động lọc trùng nếu câu thoại đã có sẵn trong file.
 *
 * 🚀 Cách chạy: bun run taunts:append
 */
export const NEW_TAUNTS_TO_APPEND: Record<TauntEvent, string[]> = {
  // ── 1. DIỄN BIẾN TRẬN ĐẤU (Gameplay - 42 sự kiện) ──
  ACCIDENTAL_SELF_BLOCK: [],
  BLOCK_AND_COUNTER_FOUR: [],
  BLOCK_WRONG_END: [],
  BLUNDER_MOVE: [],
  BOT_BLOCK_THREAT: [],
  BOT_TRAP: [],
  BOT_WIN: [],
  BOT_WIN_LEADING_SCORE: [],
  CENTER_MOVE: [],
  CLEAN_SWEEP_DOMINATION: [],
  CLOSE_COMBAT_HUG: [],
  CLUTCH_100_STONES: [],
  COMEBACK_WIN: [],
  CONSECUTIVE_SPEED_LOSSES: [],
  COPYCAT_MOVE: [],
  CORNER_MOVE: [],
  DEAD_FOUR_BLOCKED: [],
  DOUBLE_THREE_TRAP: [],
  EDGE_WALK_MOVE: [],
  FAST_MOVE_TAUNT: [],
  FORK_ATTACK_DEFENSE_FAIL: [],
  GAME_DRAW: [],
  IRON_CURTAIN_WIN: [],
  ISOLATED_FAR_MOVE: [],
  LONG_GAME: [],
  MISSED_WINNING_MOVE: [],
  NO_UNDO_WIN: [],
  PLAYER_RESIGN: [],
  PLAYER_STREAK_WIN: [],
  PLAYER_UNDO: [],
  PLAYER_WIN: [],
  PLAYER_WIN_WITH_UNDO: [],
  REVENGE_WIN_AFTER_LOSS_STREAK: [],
  RUSH_MOVE: [],
  SPEED_WIN_QUICK: [],
  SPLIT_BOARD_EXPEDITION: [],
  SURRENDER_AFTER_LONG_THINKING: [],
  SURRENDER_ON_THREAT: [],
  SYMMETRY_BREAK_SURPRISE: [],
  TRIANGLE_FORMATION: [],
  TURTLE_DEFENSE: [],
  WIN_RIGHT_AFTER_UNDO: [],

  // ── 2. TRẠNG THÁI CHỜ / AFK (Idle - 6 sự kiện) ──
  IDLE_AFTER_LOSS: [],
  IDLE_IN_GAME: [],
  IDLE_PRE_GAME: [],
  IDLE_THINKING: [],
  STARE_AT_WIN_LINE: [],
  SUPER_SLOW_MOVE: [],

  // ── 3. TƯƠNG TÁC NGƯỜI CHƠI (Interaction - 26 sự kiện) ──
  BREAK_LOSS_STREAK: [],
  CLICK_AFTER_GAME_OVER: [],
  CLICK_BEFORE_START: [],
  CLICK_OWN_STONE: [],
  DRAG_SELECT_PANIC: [],
  GAME_START: [],
  HESITATION_DANCE: [],
  HOVER_UNDO_HESITATION: [],
  IMMEDIATE_REVENGE_CLICK: [],
  KEYBOARD_SMASH_SPAM: [],
  LEVEL_UP_ALERT: [],
  LONG_HOVER_CELL: [],
  MARATHON_SERIES: [],
  MOUSE_LEAVE_VIEWPORT: [],
  MULTI_UNDO: [],
  PLAYER_GOOD_MOVE: [],
  POKE_BOT: [],
  RAGE_DOWNGRADE_AFTER_LOSS: [],
  RESIGN_WHILE_AI_THINKING: [],
  RIGHT_CLICK_INSPECT: [],
  SPAM_POKE_BOT: [],
  STREAK_LOSS: [],
  SWAP_SIDE_BOT_FIRST: [],
  SWAP_SIDE_PLAYER_FIRST: [],
  UNDO_BEFORE_AI_MOVES: [],
  WINDOW_RESIZE_PANIC: [],

  // ── 4. HỆ THỐNG & CÀI ĐẶT UI (System - 19 sự kiện) ──
  BOARD_STYLE_CHANGE: [],
  CHANGE_BOT_LEVEL_DOWN: [],
  CHANGE_BOT_LEVEL_UP: [],
  CLICK_OCCUPIED_CELL: [],
  DESPERATE_THEME_SWAP: [],
  LATE_NIGHT_PLAY: [],
  OPEN_BOT_MODAL: [],
  OPEN_RULES: [],
  OPEN_STATS: [],
  RAPID_THEME_CYCLING: [],
  RESET_STATS: [],
  SOUND_MUTE: [],
  SOUND_SPAM_TOGGLE: [],
  SOUND_UNMUTE: [],
  SWITCH_BOARD_STYLE_MID_GAME: [],
  TAB_BLUR: [],
  TAB_FOCUS: [],
  THEME_CHANGE: [],
  TOGGLE_STEP_NUMBERS: [],
};

const categoryMap: Record<string, string[]> = {
  gameplay: [
    'ACCIDENTAL_SELF_BLOCK',
    'BLOCK_AND_COUNTER_FOUR',
    'BLOCK_WRONG_END',
    'BLUNDER_MOVE',
    'BOT_BLOCK_THREAT',
    'BOT_TRAP',
    'BOT_WIN',
    'BOT_WIN_LEADING_SCORE',
    'CENTER_MOVE',
    'CLEAN_SWEEP_DOMINATION',
    'CLOSE_COMBAT_HUG',
    'CLUTCH_100_STONES',
    'COMEBACK_WIN',
    'CONSECUTIVE_SPEED_LOSSES',
    'COPYCAT_MOVE',
    'CORNER_MOVE',
    'DEAD_FOUR_BLOCKED',
    'DOUBLE_THREE_TRAP',
    'EDGE_WALK_MOVE',
    'FAST_MOVE_TAUNT',
    'FORK_ATTACK_DEFENSE_FAIL',
    'GAME_DRAW',
    'IRON_CURTAIN_WIN',
    'ISOLATED_FAR_MOVE',
    'LONG_GAME',
    'MISSED_WINNING_MOVE',
    'NO_UNDO_WIN',
    'PLAYER_RESIGN',
    'PLAYER_STREAK_WIN',
    'PLAYER_UNDO',
    'PLAYER_WIN',
    'PLAYER_WIN_WITH_UNDO',
    'REVENGE_WIN_AFTER_LOSS_STREAK',
    'RUSH_MOVE',
    'SPEED_WIN_QUICK',
    'SPLIT_BOARD_EXPEDITION',
    'SURRENDER_AFTER_LONG_THINKING',
    'SURRENDER_ON_THREAT',
    'SYMMETRY_BREAK_SURPRISE',
    'TRIANGLE_FORMATION',
    'TURTLE_DEFENSE',
    'WIN_RIGHT_AFTER_UNDO',
  ],
  idle: [
    'IDLE_AFTER_LOSS',
    'IDLE_IN_GAME',
    'IDLE_PRE_GAME',
    'IDLE_THINKING',
    'STARE_AT_WIN_LINE',
    'SUPER_SLOW_MOVE',
  ],
  interaction: [
    'BREAK_LOSS_STREAK',
    'CLICK_AFTER_GAME_OVER',
    'CLICK_BEFORE_START',
    'CLICK_OWN_STONE',
    'DRAG_SELECT_PANIC',
    'GAME_START',
    'HESITATION_DANCE',
    'HOVER_UNDO_HESITATION',
    'IMMEDIATE_REVENGE_CLICK',
    'KEYBOARD_SMASH_SPAM',
    'LEVEL_UP_ALERT',
    'LONG_HOVER_CELL',
    'MARATHON_SERIES',
    'MOUSE_LEAVE_VIEWPORT',
    'MULTI_UNDO',
    'PLAYER_GOOD_MOVE',
    'POKE_BOT',
    'RAGE_DOWNGRADE_AFTER_LOSS',
    'RESIGN_WHILE_AI_THINKING',
    'RIGHT_CLICK_INSPECT',
    'SPAM_POKE_BOT',
    'STREAK_LOSS',
    'SWAP_SIDE_BOT_FIRST',
    'SWAP_SIDE_PLAYER_FIRST',
    'UNDO_BEFORE_AI_MOVES',
    'WINDOW_RESIZE_PANIC',
  ],
  system: [
    'BOARD_STYLE_CHANGE',
    'CHANGE_BOT_LEVEL_DOWN',
    'CHANGE_BOT_LEVEL_UP',
    'CLICK_OCCUPIED_CELL',
    'DESPERATE_THEME_SWAP',
    'LATE_NIGHT_PLAY',
    'OPEN_BOT_MODAL',
    'OPEN_RULES',
    'OPEN_STATS',
    'RAPID_THEME_CYCLING',
    'RESET_STATS',
    'SOUND_MUTE',
    'SOUND_SPAM_TOGGLE',
    'SOUND_UNMUTE',
    'SWITCH_BOARD_STYLE_MID_GAME',
    'TAB_BLUR',
    'TAB_FOCUS',
    'THEME_CHANGE',
    'TOGGLE_STEP_NUMBERS',
  ],
};

function getCategoryForEvent(event: string): string | null {
  for (const [cat, events] of Object.entries(categoryMap)) {
    if (events.includes(event)) return cat;
  }
  return null;
}

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, g) => g.toUpperCase());
}

async function main() {
  console.log('🚀 Bắt đầu thêm câu thoại mới vào cơ sở dữ liệu Taunts...\n');

  let totalAppended = 0;
  let totalSkipped = 0;

  for (const [eventKey, newTexts] of Object.entries(NEW_TAUNTS_TO_APPEND)) {
    if (!newTexts || newTexts.length === 0) continue;

    const cat = getCategoryForEvent(eventKey);
    if (!cat) {
      console.warn(`⚠️ Không tìm thấy thư mục phân loại cho sự kiện: ${eventKey}`);
      continue;
    }

    const fileName = `${toCamelCase(eventKey)}.ts`;
    const filePath = path.join(tauntsDir, cat, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Không tìm thấy tệp mã nguồn: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse các câu hiện tại trong file
    const match = content.match(/texts:\s*\[([\s\S]*?)\]\s*,?\s*\}\s*;/);
    if (!match) {
      console.error(`❌ Không đọc được mảng texts trong tệp: ${filePath}`);
      continue;
    }

    const currentTextsBlock = match[1];
    const currentLines = currentTextsBlock
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('"') || l.startsWith("'"))
      .map(l => l.replace(/^["']|["'],?$/g, ''));

    const existingSet = new Set(currentLines.map(t => t.toLowerCase().trim()));

    // Lọc các câu mới không bị trùng
    const validNewTexts: string[] = [];
    for (const text of newTexts) {
      const trimmed = text.trim();
      if (!trimmed) continue;
      if (existingSet.has(trimmed.toLowerCase())) {
        totalSkipped++;
      } else {
        validNewTexts.push(trimmed);
        existingSet.add(trimmed.toLowerCase());
      }
    }

    if (validNewTexts.length === 0) {
      console.log(`ℹ️ [${eventKey}] Không có câu thoại mới hợp lệ (đã tồn tại hoặc rỗng).`);
      continue;
    }

    // Nối các câu mới vào mảng
    const allTexts = [...currentLines, ...validNewTexts];
    const newTextsCode = allTexts.map(t => `    ${JSON.stringify(t)},`).join('\n');

    const updatedContent = content.replace(
      /texts:\s*\[[\s\S]*?\]\s*,?\s*\}\s*;/,
      `texts: [\n${newTextsCode}\n  ],\n};`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    totalAppended += validNewTexts.length;

    console.log(`✅ [${eventKey}] Đã thêm thành công +${validNewTexts.length} câu mới (Tổng: ${allTexts.length} câu).`);
  }

  console.log('\n========================================================');
  console.log(`🎉 HOÀN TẤT! Đã bổ sung thành công +${totalAppended} câu thoại mới.`);
  if (totalSkipped > 0) {
    console.log(`⚠️ Bỏ qua ${totalSkipped} câu thoại do bị trùng lặp.`);
  }
  console.log('👉 Chạy "bun run taunts:verify" để kiểm tra tính toàn vẹn.');
  console.log('========================================================\n');
}

main().catch(console.error);
