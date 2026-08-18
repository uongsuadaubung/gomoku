import { Component, Show } from 'solid-js';
import { MessageSquareQuote } from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import type { BotMood } from '../services/tauntService';

interface BotCharacterProps {
  store: GameStore;
}

export const BotCharacter: Component<BotCharacterProps> = props => {
  const { store } = props;
  const config = () => store.currentLevelConfig();
  const taunt = () => store.tauntState();

  // Biểu cảm emoji sinh động theo tâm trạng cà khịa hiện tại (18 sắc thái cảm xúc)
  const moodEmoji = () => {
    if (!taunt().visible) return config().avatar;
    const m: BotMood = taunt().mood;
    switch (m) {
      case 'laugh':
        return '🤣';
      case 'smug':
        return '😏';
      case 'clown':
        return '🤡';
      case 'cool':
        return '😎';
      case 'evil':
        return '😈';
      case 'angry':
        return '😤';
      case 'rage':
        return '🤬';
      case 'bored':
        return '🥱';
      case 'sleepy':
        return '😴';
      case 'shocked':
        return '😳';
      case 'mindblown':
        return '🤯';
      case 'thinking':
        return '🤔';
      case 'disdain':
        return '😒';
      case 'salute':
        return '🫡';
      case 'relieved':
        return '😅';
      case 'detective':
        return '🧐';
      case 'party':
        return '🥳';
      case 'shush':
        return '🤫';
      default:
        return config().avatar;
    }
  };

  // Hiệu ứng chuyển động vi mô theo tâm trạng
  const moodAnimation = () => {
    if (!taunt().visible) return 'group-hover:scale-105';
    const m: BotMood = taunt().mood;
    switch (m) {
      case 'rage':
      case 'clown':
        return 'scale-110 animate-bounce';
      case 'party':
      case 'laugh':
        return 'scale-115 rotate-6 animate-pulse';
      case 'shocked':
      case 'mindblown':
        return 'scale-120 -rotate-3';
      case 'sleepy':
      case 'bored':
        return 'scale-95 opacity-90';
      case 'cool':
      case 'evil':
        return 'scale-110 rotate-2 shadow-amber-500/50';
      default:
        return 'scale-110 rotate-3';
    }
  };

  let pokeTimestamps: number[] = [];
  const handlePoke = () => {
    const now = Date.now();
    pokeTimestamps = pokeTimestamps.filter(t => now - t < 4000);
    pokeTimestamps.push(now);

    if (pokeTimestamps.length >= 4) {
      store.triggerTaunt('SPAM_POKE_BOT');
    } else {
      store.triggerTaunt('POKE_BOT');
    }
  };

  return (
    <div class="relative flex flex-col items-center">
      {/* 💬 BONG BÓNG LỜI THOẠI CÀ KHỊA (Nổi bật phía trên Icon Bot) */}
      <Show when={taunt().visible && !!taunt().text}>
        <div class="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-40 w-max max-w-[280px] sm:max-w-[340px] pointer-events-none animate-bounce-subtle">
          <div class="relative px-3.5 py-2.5 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black text-xs sm:text-[13px] leading-relaxed shadow-2xl border-2 border-amber-200">
            {/* Nội dung câu khịa */}
            <p class="drop-shadow-sm break-words select-none">{taunt().text}</p>
            {/* Mũi nhọn đuôi bong bóng thoại trỏ xuống chính giữa Icon Bot */}
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 border-r-2 border-b-2 border-amber-300 pointer-events-none" />
          </div>
        </div>
      </Show>

      {/* 🤖 ICON BOT TƯƠNG TÁC (Chỉ hiển thị Icon, bấm vào để bị cà khịa) */}
      <button
        onClick={handlePoke}
        class={`group relative p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur border border-slate-800 hover:border-amber-500/50 shadow-lg transition-all duration-300 active:scale-90 cursor-pointer select-none ${
          taunt().visible ? 'ring-2 ring-amber-400 shadow-amber-500/30' : ''
        }`}
        title="Chọc đối thủ để nghe cà khịa"
      >
        {/* Avatar Icon */}
        <div
          class={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner border transition-all duration-300 ${
            config().badgeBg
          } ${moodAnimation()}`}
        >
          <span>{moodEmoji()}</span>
        </div>

        {/* Chấm trạng thái nhỏ xinh */}
        <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:bg-amber-400 transition-colors" />
        </div>
      </button>
    </div>
  );
};
