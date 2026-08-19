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
 * - Bắt buộc phải có đủ 100% tất cả sự kiện (71/71 sự kiện - Type-safe 100%).
 * - Tự động lọc trùng nếu câu thoại đã có sẵn trong file.
 *
 * 🚀 Cách chạy: bun run taunts:append
 */
export const NEW_TAUNTS_TO_APPEND: Record<TauntEvent, string[]> = {
  // ── 1. DIỄN BIẾN TRẬN ĐẤU (Gameplay - 30 sự kiện) ──
  ACCIDENTAL_SELF_BLOCK: [],
  BLOCK_WRONG_END: [],
  BLUNDER_MOVE: [],
  BOT_BLOCK_THREAT: [],
  BOT_TRAP: [],
  BOT_WIN: [],
  BOT_WIN_LEADING_SCORE: [],
  CENTER_MOVE: [],
  CLUTCH_100_STONES: [],
  COMEBACK_WIN: [],
  COPYCAT_MOVE: [],
  CORNER_MOVE: [],
  DEAD_FOUR_BLOCKED: [],
  DOUBLE_THREE_TRAP: [],
  EDGE_WALK_MOVE: [],
  FAST_MOVE_TAUNT: [],
  GAME_DRAW: [],
  ISOLATED_FAR_MOVE: [],
  LONG_GAME: [],
  MISSED_WINNING_MOVE: [],
  NO_UNDO_WIN: [],
  PLAYER_RESIGN: [],
  PLAYER_STREAK_WIN: [],
  PLAYER_UNDO: [],
  PLAYER_WIN: [],
  PLAYER_WIN_WITH_UNDO: [],
  RUSH_MOVE: [],
  SPEED_WIN_QUICK: [],
  SURRENDER_ON_THREAT: [],
  TURTLE_DEFENSE: [],

  // ── 2. TRẠNG THÁI CHỜ / AFK (Idle - 6 sự kiện) ──
  IDLE_AFTER_LOSS: [],
  IDLE_IN_GAME: [],
  IDLE_PRE_GAME: [],
  IDLE_THINKING: [],
  STARE_AT_WIN_LINE: [],
  SUPER_SLOW_MOVE: [],

  // ── 3. TƯƠNG TÁC NGƯỜI CHƠI (Interaction - 18 sự kiện) ──
  BREAK_LOSS_STREAK: [],
  CLICK_AFTER_GAME_OVER: [],
  CLICK_BEFORE_START: [],
  GAME_START: [],
  HESITATION_DANCE: [],
  IMMEDIATE_REVENGE_CLICK: [],
  LEVEL_UP_ALERT: [],
  LONG_HOVER_CELL: [],
  MARATHON_SERIES: [],
  MULTI_UNDO: [],
  PLAYER_GOOD_MOVE: [],
  POKE_BOT: [],
  RAGE_DOWNGRADE_AFTER_LOSS: [],
  SPAM_POKE_BOT: [],
  STREAK_LOSS: [],
  SWAP_SIDE_BOT_FIRST: [],
  SWAP_SIDE_PLAYER_FIRST: [],
  UNDO_BEFORE_AI_MOVES: [],

  // ── 4. HỆ THỐNG & CÀI ĐẶT UI (System - 17 sự kiện) ──
  BOARD_STYLE_CHANGE: [],
  CHANGE_BOT_LEVEL_DOWN: [],
  CHANGE_BOT_LEVEL_UP: [],
  CLICK_OCCUPIED_CELL: [],
  DESPERATE_THEME_SWAP: [],
  LATE_NIGHT_PLAY: [],
  OPEN_BOT_MODAL: [],
  OPEN_RULES: [],
  OPEN_STATS: [],
  RESET_STATS: [],
  SOUND_MUTE: [],
  SOUND_SPAM_TOGGLE: [],
  SOUND_UNMUTE: [],
  TAB_BLUR: [],
  TAB_FOCUS: [],
  THEME_CHANGE: [],
  TOGGLE_STEP_NUMBERS: [],
};

// =========================================================================
// ⚙️ LOGIC TỰ ĐỘNG QUÉT VÀ APPEND CÂU THOẠI
// =========================================================================
function findEventFiles(): Map<TauntEvent, { filePath: string; relPath: string }> {
  const map = new Map<TauntEvent, { filePath: string; relPath: string }>();
  const categories = ['gameplay', 'idle', 'interaction', 'system'];

  for (const cat of categories) {
    const catDir = path.join(tauntsDir, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
    for (const file of files) {
      const filePath = path.join(catDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(/event:\s*['"]([A-Z0-9_]+)['"]/);
      if (match) {
        const eventName = match[1] as TauntEvent;
        map.set(eventName, { filePath, relPath: `${cat}/${file}` });
      }
    }
  }

  return map;
}

function runAppend() {
  const fileMap = findEventFiles();
  let totalAppended = 0;
  let modifiedFilesCount = 0;

  console.log('====================================================');
  console.log('🚀 TIẾN TRÌNH APPEND CÂU THOẠI MỚI VÀO KHO THOẠI');
  console.log('====================================================\n');

  for (const [eventKey, lines] of Object.entries(NEW_TAUNTS_TO_APPEND) as [TauntEvent, string[]][]) {
    const validLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (validLines.length === 0) continue;

    const fileInfo = fileMap.get(eventKey);
    if (!fileInfo) {
      console.error(`❌ Không tìm thấy file định nghĩa cho sự kiện: ${eventKey}`);
      continue;
    }

    const { filePath, relPath } = fileInfo;
    let content = fs.readFileSync(filePath, 'utf-8');

    const toAdd: string[] = [];
    for (const line of validLines) {
      const formatted = JSON.stringify(line);
      if (content.includes(formatted)) {
        console.log(`  ⚠️ [Bỏ qua trùng lặp] [${eventKey}]: "${line}"`);
        continue;
      }
      toAdd.push(`  ${formatted},`);
    }

    if (toAdd.length === 0) {
      console.log(`  ℹ️ [${eventKey}]: Không có câu thoại mới nào cần thêm.`);
      continue;
    }

    const textsCloseRegex = /(\n\s*\],\s*\n\};)/;
    if (!textsCloseRegex.test(content)) {
      console.error(`❌ Không khớp được cấu trúc texts array trong file: ${relPath}`);
      continue;
    }

    content = content.replace(textsCloseRegex, `\n${toAdd.join('\n')}$1`);
    fs.writeFileSync(filePath, content, 'utf-8');

    totalAppended += toAdd.length;
    modifiedFilesCount++;
    console.log(`[+] [${eventKey}] -> Đã thêm ${toAdd.length} câu vào '${relPath}'`);
  }

  console.log('\n====================================================');
  if (totalAppended > 0) {
    console.log(`✅ HOÀN THÀNH: Đã append thành công ${totalAppended} câu thoại mới vào ${modifiedFilesCount} file sự kiện!`);
    console.log(`👉 Chạy 'bun run taunts:stats' để kiểm tra lại thống kê.`);
  } else {
    console.log('ℹ️ Không có câu thoại mới nào được điền vào NEW_TAUNTS_TO_APPEND.');
    console.log('👉 Hãy mở file này và điền câu thoại mới vào mảng của sự kiện bạn muốn thêm!');
  }
  console.log('====================================================\n');
}

runAppend();
