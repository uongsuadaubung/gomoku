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

  return (
    <div class="relative flex items-center justify-center my-1 sm:my-2 w-full">
      {/* 🗨️ BONG BÓNG THOẠI CÀ KHỊA (Comic Speech Bubble) - Định vị Absolute để triệt tiêu hoàn toàn xê dịch layout */}
      <Show when={taunt().visible}>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 animate-scale-in w-max max-w-[min(90vw,360px)] sm:max-w-md pointer-events-none">
          <div class="relative bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl shadow-amber-950/60 border-2 border-amber-300 flex items-center gap-2 text-center pointer-events-auto">
            <MessageSquareQuote size={16} class="shrink-0 text-slate-900 sm:w-[18px] sm:h-[18px]" />
            <span class="leading-snug text-left sm:text-center">{taunt().text}</span>

            {/* Mũi nhọn đuôi bong bóng thoại trỏ xuống chính giữa Icon Bot */}
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 border-r-2 border-b-2 border-amber-300 pointer-events-none" />
          </div>
        </div>
      </Show>

      {/* 🤖 ICON BOT TƯƠNG TÁC (Chỉ hiển thị Icon, bấm vào để bị cà khịa) */}
      <button
        onClick={() => store.triggerTaunt('POKE_BOT')}
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
