import { TAUNT_REGISTRY } from '../src/data/taunts';
import type { TauntEvent, BotMood } from '../src/data/taunts/types';

// Bảng biểu tượng cảm xúc cho từng BotMood
const MOOD_EMOJIS: Record<BotMood, string> = {
  smug: '😏 (Cười khẩy)',
  laugh: '🤣 (Cười ngả nghiêng)',
  clown: '🤡 (Mặt hề)',
  cool: '😎 (Ngầu đét)',
  evil: '😈 (Ác quỷ)',
  angry: '😤 (Bực mình)',
  rage: '🤬 (Nổi giận)',
  bored: '🥱 (Ngáp ngủ)',
  sleepy: '😴 (Buồn ngủ)',
  shocked: '😳 (Bất ngờ)',
  mindblown: '🤯 (Nổ đầu)',
  thinking: '🤔 (Suy nghĩ)',
  disdain: '😒 (Khinh bỉ)',
  salute: '🫡 (Chào tiễn biệt)',
  relieved: '😅 (Toát mồ hôi)',
  detective: '🧐 (Soi xét)',
  party: '🥳 (Ăn mừng)',
  shush: '🤫 (Im lặng)',
};

const allEvents = Object.keys(TAUNT_REGISTRY) as TauntEvent[];

function printUsage() {
  console.log('================================================================');
  console.log('📖 HƯỚNG DẪN SỬ DỤNG SCRIPT ĐỌC KHO THOẠI TAUNTS');
  console.log('================================================================');
  console.log('👉 Cách 1: Đọc thoại của một sự kiện cụ thể:');
  console.log('   bun run scripts/read_taunts.ts <EVENT_NAME>');
  console.log('   Ví dụ: bun run scripts/read_taunts.ts BOT_WIN');
  console.log('          bun run scripts/read_taunts.ts theme_change\n');
  console.log('👉 Cách 2: Liệt kê danh sách tất cả sự kiện và số lượng câu thoại:');
  console.log('   bun run scripts/read_taunts.ts --list\n');
  console.log(`📋 TỔNG HỢP ${allEvents.length} SỰ KIỆN CÓ SẴN TRONG HỆ THỐNG:`);
  for (let i = 0; i < allEvents.length; i += 3) {
    const chunk = allEvents.slice(i, i + 3).map(e => e.padEnd(24)).join(' ');
    console.log(`  • ${chunk}`);
  }
  console.log('================================================================\n');
}

function printList() {
  console.log('================================================================');
  console.log(`📊 THỐNG KÊ SỐ LƯỢNG CÂU THOẠI THEO TỪNG SỰ KIỆN (${allEvents.length} SỰ KIỆN)`);
  console.log('================================================================');
  let totalAll = 0;

  allEvents.forEach((evt, idx) => {
    const def = TAUNT_REGISTRY[evt];
    const count = def.texts.length;
    totalAll += count;
    const moodStr = MOOD_EMOJIS[def.mood] || def.mood;
    console.log(
      `${String(idx + 1).padStart(2, ' ')}. [${evt.padEnd(22)}] : ${String(count).padStart(3, ' ')} câu | Mood: ${moodStr}`
    );
  });

  console.log('----------------------------------------------------------------');
  console.log(`🔥 TỔNG CỘNG TOÀN BỘ KHO THOẠI: ${totalAll} câu thoại.`);
  console.log('================================================================\n');
}

function readEvent(inputEvent: string) {
  // Chuẩn hóa tên event (hỗ trợ cả chữ thường, chữ hoa)
  const normalized = inputEvent.toUpperCase().trim() as TauntEvent;

  const def = TAUNT_REGISTRY[normalized];
  if (!def) {
    console.error(`\n❌ LỖI: Không tìm thấy sự kiện nào có tên là "${inputEvent}".\n`);
    printUsage();
    process.exit(1);
  }

  const moodStr = MOOD_EMOJIS[def.mood] || def.mood;

  console.log('================================================================');
  console.log(`📢 SỰ KIỆN: ${def.event}`);
  console.log(`🎭 Cảm xúc bot (Mood): ${moodStr}`);
  console.log(`📊 Tổng số câu thoại: ${def.texts.length} câu`);
  console.log('================================================================\n');

  def.texts.forEach((text, index) => {
    console.log(`${String(index + 1).padStart(3, ' ')}. "${text}"`);
  });

  console.log('\n================================================================');
  console.log(`✅ Đã hiển thị trọn vẹn ${def.texts.length} câu thoại của sự kiện [${def.event}].`);
  console.log('================================================================\n');
}

// Xử lý tham số dòng lệnh
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
} else if (args[0] === '--list' || args[0] === '-l') {
  printList();
} else {
  readEvent(args[0]);
}
