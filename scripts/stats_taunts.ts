import { TAUNT_REGISTRY } from '../src/data/taunts';
import { GAMEPLAY_TAUNTS } from '../src/data/taunts/gameplay';
import { IDLE_TAUNTS } from '../src/data/taunts/idle';
import { INTERACTION_TAUNTS } from '../src/data/taunts/interaction';
import { SYSTEM_TAUNTS } from '../src/data/taunts/system';
import type { TauntEvent, BotMood } from '../src/data/taunts/types';

// Bảng biểu tượng cảm xúc cho từng BotMood
const MOOD_EMOJIS: Record<BotMood, string> = {
  smug: '😏 Cười khẩy',
  laugh: '🤣 Cười ngả nghiêng',
  clown: '🤡 Mặt hề',
  cool: '😎 Ngầu đét',
  evil: '😈 Ác quỷ',
  angry: '😤 Bực mình',
  rage: '🤬 Nổi giận',
  bored: '🥱 Ngáp ngủ',
  sleepy: '😴 Buồn ngủ',
  shocked: '😳 Bất ngờ',
  mindblown: '🤯 Nổ đầu',
  thinking: '🤔 Đăm chiêu',
  disdain: '😒 Khinh bỉ',
  salute: '🫡 Chào tiễn biệt',
  relieved: '😅 Toát mồ hôi',
  detective: '🧐 Soi xét',
  party: '🥳 Ăn mừng',
  shush: '🤫 Im lặng',
};

// Phân nhóm 64 sự kiện theo 4 chuyên mục tự động
const CATEGORIES: Record<string, { title: string; icon: string; events: TauntEvent[] }> = {
  gameplay: {
    title: 'DIỄN BIẾN TRẬN ĐẤU (Gameplay)',
    icon: '⚔️',
    events: Object.keys(GAMEPLAY_TAUNTS) as TauntEvent[],
  },
  idle: {
    title: 'TRẠNG THÁI CHỜ / AFK (Idle)',
    icon: '⏳',
    events: Object.keys(IDLE_TAUNTS) as TauntEvent[],
  },
  interaction: {
    title: 'TƯƠNG TÁC NGƯỜI CHƠI (Interaction)',
    icon: '💬',
    events: Object.keys(INTERACTION_TAUNTS) as TauntEvent[],
  },
  system: {
    title: 'HỆ THỐNG & CÀI ĐẶT UI (System)',
    icon: '⚙️',
    events: Object.keys(SYSTEM_TAUNTS) as TauntEvent[],
  },
};

function runStats() {
  console.log('\n========================================================================================');
  console.log('📊 BÁO CÁO THỐNG KÊ CHI TIẾT KHO THOẠI CÀ KHỊA (GOMOKU TAUNTS)');
  console.log('========================================================================================\n');

  let grandTotalSentences = 0;
  let minCount = Infinity;
  let maxCount = -Infinity;
  let minEvent = '';
  let maxEvent = '';

  const moodStats: Record<string, { count: number; events: number }> = {};

  // 1. Thống kê theo 4 nhóm chuyên mục
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    let catTotal = 0;
    console.log(`${cat.icon} 【 ${cat.title} 】 (Tổng ${cat.events.length} sự kiện)`);
    console.log('----------------------------------------------------------------------------------------');

    cat.events.forEach((evt, idx) => {
      const def = TAUNT_REGISTRY[evt];
      const count = def ? def.texts.length : 0;
      const mood = def ? def.mood : 'smug';
      const moodText = MOOD_EMOJIS[mood] || mood;

      catTotal += count;
      grandTotalSentences += count;

      if (count < minCount) {
        minCount = count;
        minEvent = evt;
      }
      if (count > maxCount) {
        maxCount = count;
        maxEvent = evt;
      }

      if (!moodStats[mood]) {
        moodStats[mood] = { count: 0, events: 0 };
      }
      moodStats[mood].count += count;
      moodStats[mood].events += 1;

      console.log(
        `  ${String(idx + 1).padStart(2, ' ')}. [${evt.padEnd(26)}] : ` +
        `${String(count).padStart(4, ' ')} câu  |  Cảm xúc: ${moodText}`
      );
    });

    console.log('----------------------------------------------------------------------------------------');
    console.log(`👉 Tiểu kết ${cat.title}: ${catTotal} câu thoại\n`);
  }

  // 2. Thống kê theo 18 Biểu cảm (BotMood)
  console.log('========================================================================================');
  console.log('🎭 THỐNG KÊ THEO 18 CẢM XÚC CỦA BOT (BOT MOODS)');
  console.log('========================================================================================');
  
  const sortedMoods = Object.entries(moodStats).sort((a, b) => b[1].count - a[1].count);
  for (const [moodKey, data] of sortedMoods) {
    const moodEmoji = MOOD_EMOJIS[moodKey as BotMood] || moodKey;
    const percentage = ((data.count / grandTotalSentences) * 100).toFixed(1);
    console.log(
      `  • ${moodEmoji.padEnd(24)} : ${String(data.count).padStart(4, ' ')} câu (${String(percentage).padStart(4, ' ')}%)  |  ${data.events} sự kiện`
    );
  }

  // 3. Tổng kết chung toàn dự án
  const totalEvents = Object.keys(TAUNT_REGISTRY).length;
  const avgPerEvent = (grandTotalSentences / totalEvents).toFixed(1);

  console.log('\n========================================================================================');
  console.log('🏆 TỔNG KẾT TOÀN BỘ KHO THOẠI DỰ ÁN:');
  console.log('========================================================================================');
  console.log(`  🌟 Tổng số sự kiện đang hoạt động: ${totalEvents} sự kiện`);
  console.log(`  🔥 Tổng số câu thoại độc nhất    : ${grandTotalSentences.toLocaleString()} câu thoại`);
  console.log(`  📈 Số câu thoại trung bình/sự kiện: ${avgPerEvent} câu`);
  console.log(`  🥇 Sự kiện phong phú nhất        : [${maxEvent}] (${maxCount} câu)`);
  console.log(`  🎯 Sự kiện gọn nhẹ nhất          : [${minEvent}] (${minCount} câu)`);
  console.log('========================================================================================\n');
}

runStats();
