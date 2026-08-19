import { Component, Show, createSignal, createEffect, onCleanup } from 'solid-js';
import type { GameStore } from '../store/gameStore';
import type { BotMood } from '../services/tauntService';
import { soundService } from '../services/soundService';
import { interactionTracker } from '../services/interactionTracker';

interface BotCharacterProps {
  store: GameStore;
}

export const BotCharacter: Component<BotCharacterProps> = props => {
  const { store } = props;
  const config = () => store.currentLevelConfig();
  const taunt = () => store.tauntState();

  // Trạng thái hiệu ứng gõ chữ (Typewriter effect)
  const [displayedText, setDisplayedText] = createSignal('');
  const [isTyping, setIsTyping] = createSignal(false);
  let typingTimer: number | null = null;

  // Lắng nghe thay đổi câu thoại để chạy hiệu ứng gõ chữ và âm thanh chíp chíp
  createEffect(() => {
    const currentTaunt = taunt();

    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }

    if (!currentTaunt.visible || !currentTaunt.text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    const fullText = currentTaunt.text;
    const mood = currentTaunt.mood;
    let charIdx = 0;

    setDisplayedText('');
    setIsTyping(true);

    // Tốc độ gõ chữ mượt mà ~20ms / ký tự
    typingTimer = window.setInterval(() => {
      charIdx++;
      const currentSub = fullText.slice(0, charIdx);
      setDisplayedText(currentSub);

      // Phát âm thanh thoại 8-bit gibberish chíp chíp vui nhộn cách quãng
      if (charIdx % 2 === 0 && fullText[charIdx - 1]?.trim()) {
        soundService.playVoiceBlip(mood);
      }

      if (charIdx >= fullText.length) {
        if (typingTimer) {
          clearInterval(typingTimer);
          typingTimer = null;
        }
        setIsTyping(false);
      }
    }, 20);
  });

  onCleanup(() => {
    if (typingTimer) clearInterval(typingTimer);
  });

  // Biểu cảm emoji sinh động theo tâm trạng cà khịa hiện tại (17 sắc thái cà khịa & gáy bẩn)
  const moodEmoji = () => {
    if (!taunt().visible) return config().avatar;
    const m: BotMood = taunt().mood;
    switch (m) {
      case 'disdain':
        return '😒';
      case 'smug':
        return '😏';
      case 'laugh':
        return '🤣';
      case 'clown':
        return '🤡';
      case 'detective':
        return '🧐';
      case 'bored':
        return '🥱';
      case 'sleepy':
        return '😴';
      case 'thinking':
        return '🤔';
      case 'evil':
        return '😈';
      case 'lightning':
        return '⚡';
      case 'cool':
        return '😎';
      case 'panic':
        return '😱';
      case 'chill':
        return '☕';
      case 'rage':
        return '🤬';
      case 'party':
        return '🥳';
      case 'angry':
        return '😤';
      case 'shush':
        return '🤫';
      default:
        return config().avatar;
    }
  };

  // Hiệu ứng chuyển động Avatar theo tâm trạng
  const moodAnimation = () => {
    if (!taunt().visible) return 'group-hover:scale-105';
    const m: BotMood = taunt().mood;
    switch (m) {
      case 'rage':
      case 'clown':
      case 'panic':
        return 'scale-110 animate-bounce';
      case 'party':
      case 'laugh':
        return 'scale-115 rotate-6 animate-pulse';
      case 'sleepy':
      case 'bored':
        return 'scale-95 opacity-90';
      case 'lightning':
        return 'scale-115 rotate-3 animate-bounce';
      case 'chill':
        return 'scale-105 rotate-1';
      case 'cool':
      case 'evil':
      case 'smug':
      case 'disdain':
        return 'scale-110 rotate-2 shadow-amber-500/50';
      default:
        return 'scale-110 rotate-3';
    }
  };

  // Phong cách & Màu sắc Bong bóng thoại thích ứng theo Mood
  const bubbleTheme = () => {
    const m: BotMood = taunt().mood;
    switch (m) {
      case 'rage':
      case 'angry':
        return {
          box: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white border-2 border-rose-300 shadow-rose-500/40 animate-bubble-shake',
          arrow: 'bg-rose-600 border-l-2 border-b-2 border-rose-400',
        };
      case 'panic':
        return {
          box: 'bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white border-2 border-amber-300 shadow-orange-500/50 animate-bubble-shake',
          arrow: 'bg-amber-600 border-l-2 border-b-2 border-amber-300',
        };
      case 'lightning':
        return {
          box: 'bg-gradient-to-r from-cyan-500 via-amber-400 to-yellow-300 text-slate-950 border-2 border-cyan-200 shadow-cyan-500/40 animate-bubble-bouncy',
          arrow: 'bg-cyan-500 border-l-2 border-b-2 border-cyan-300',
        };
      case 'chill':
        return {
          box: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white border-2 border-emerald-300 shadow-emerald-500/30',
          arrow: 'bg-emerald-600 border-l-2 border-b-2 border-emerald-300',
        };
      case 'laugh':
      case 'clown':
      case 'party':
        return {
          box: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30 animate-bubble-bouncy',
          arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
        };
      case 'sleepy':
      case 'bored':
        return {
          box: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-slate-100 border-2 border-slate-600 shadow-slate-900/50',
          arrow: 'bg-slate-800 border-l-2 border-b-2 border-slate-600',
        };
      default:
        return {
          box: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30',
          arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
        };
    }
  };

  const handlePoke = () => {
    const isSpam = interactionTracker.record('POKE_BOT', 4000) >= 4;
    if (isSpam) {
      store.triggerTaunt('SPAM_POKE_BOT');
    } else {
      store.triggerTaunt('POKE_BOT');
    }
  };

  return (
    <div class="w-full max-w-[min(96vw,560px)] md:max-w-[600px] flex items-center justify-start gap-2.5 sm:gap-3.5 relative select-none min-h-[52px]">
      {/* 🤖 ICON BOT TƯƠNG TÁC (Lệch trái, giữ trọn 18 biểu cảm) */}
      <button
        onClick={handlePoke}
        class={`group relative p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur border border-slate-800 hover:border-amber-500/50 shadow-lg transition-all duration-300 active:scale-90 cursor-pointer select-none shrink-0 ${
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
          <div
            class={`w-2.5 h-2.5 rounded-full transition-colors ${
              store.isAiThinking()
                ? 'bg-rose-500 animate-ping'
                : 'bg-emerald-500 group-hover:bg-amber-400'
            }`}
          />
        </div>
      </button>

      {/* 💬 BONG BÓNG LỜI THOẠI CÀ KHỊA (Typewriter + Mood-Adaptive Themes) */}
      <Show when={taunt().visible && (displayedText() || taunt().text)}>
        <div class="flex-1 min-w-0 max-w-[480px] pointer-events-auto animate-bubble-pop">
          <div
            onCopy={() => store.triggerTaunt('COPY_TAUNT_TEXT', 100)}
            class={`relative px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs sm:text-[13px] leading-relaxed shadow-2xl transition-all duration-200 cursor-text select-text ${
              bubbleTheme().box
            }`}
          >
            {/* Nội dung câu khịa có Typewriter Effect */}
            <p class="drop-shadow-sm break-words select-text inline">
              {displayedText() || taunt().text}
              <Show when={isTyping()}>
                <span class="inline-block w-1.5 h-3.5 ml-1 bg-current rounded-sm animate-cursor-blink align-middle" />
              </Show>
            </p>

            {/* Mũi nhọn đuôi bong bóng thoại trỏ sang trái về phía Bot */}
            <div
              class={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 pointer-events-none ${
                bubbleTheme().arrow
              }`}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
