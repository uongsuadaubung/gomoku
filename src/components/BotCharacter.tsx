import { Component, Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { useGame } from '../store/GameContext';
import { getMoodEmoji, type BotMood } from '../services/tauntService';
import { soundService } from '../services/soundService';
import { interactionTracker } from '../services/interactionTracker';

const MOOD_ANIMATIONS: Record<string, string> = {
  rage: 'scale-110 animate-bounce',
  clown: 'scale-110 animate-bounce',
  panic: 'scale-110 animate-bounce',
  party: 'scale-115 rotate-6 animate-pulse',
  laugh: 'scale-115 rotate-6 animate-pulse',
  sleepy: 'scale-95 opacity-90',
  bored: 'scale-95 opacity-90',
  lightning: 'scale-115 rotate-3 animate-bounce',
  chill: 'scale-105 rotate-1',
  cool: 'scale-110 rotate-2 shadow-amber-500/50',
  evil: 'scale-110 rotate-2 shadow-amber-500/50',
  smug: 'scale-110 rotate-2 shadow-amber-500/50',
  disdain: 'scale-110 rotate-2 shadow-amber-500/50',
};

const BUBBLE_THEMES: Record<string, { box: string; arrow: string }> = {
  rage: {
    box: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white border-2 border-rose-300 shadow-rose-500/40 animate-bubble-shake',
    arrow: 'bg-rose-600 border-l-2 border-b-2 border-rose-400',
  },
  angry: {
    box: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white border-2 border-rose-300 shadow-rose-500/40 animate-bubble-shake',
    arrow: 'bg-rose-600 border-l-2 border-b-2 border-rose-400',
  },
  panic: {
    box: 'bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white border-2 border-amber-300 shadow-orange-500/50 animate-bubble-shake',
    arrow: 'bg-amber-600 border-l-2 border-b-2 border-amber-300',
  },
  lightning: {
    box: 'bg-gradient-to-r from-cyan-500 via-amber-400 to-yellow-300 text-slate-950 border-2 border-cyan-200 shadow-cyan-500/40 animate-bubble-bouncy',
    arrow: 'bg-cyan-500 border-l-2 border-b-2 border-cyan-300',
  },
  chill: {
    box: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white border-2 border-emerald-300 shadow-emerald-500/30',
    arrow: 'bg-emerald-600 border-l-2 border-b-2 border-emerald-300',
  },
  laugh: {
    box: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30 animate-bubble-bouncy',
    arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
  },
  clown: {
    box: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30 animate-bubble-bouncy',
    arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
  },
  party: {
    box: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30 animate-bubble-bouncy',
    arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
  },
  sleepy: {
    box: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-slate-100 border-2 border-slate-600 shadow-slate-900/50',
    arrow: 'bg-slate-800 border-l-2 border-b-2 border-slate-600',
  },
  bored: {
    box: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-slate-100 border-2 border-slate-600 shadow-slate-900/50',
    arrow: 'bg-slate-800 border-l-2 border-b-2 border-slate-600',
  },
};

const DEFAULT_BUBBLE_THEME = {
  box: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 border-2 border-amber-200 shadow-amber-500/30',
  arrow: 'bg-amber-400 border-l-2 border-b-2 border-amber-300',
};

export const BotCharacter: Component = () => {
  const store = useGame();
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

  const streak = () => {
    const s = store.stats();
    switch (store.gameMode()) {
      case 'campaign':
        return s.campaign?.currentStreak ?? s.currentStreak;
      case 'blitz':
        return s.blitz?.currentStreak ?? 0;
      case 'puzzle':
        return s.puzzle?.currentStreak ?? 0;
      case 'custom':
        return s.custom?.currentStreak ?? 0;
      default:
        return 0;
    }
  };

  // Biểu cảm emoji sinh động theo tâm trạng cà khịa hiện tại
  const moodEmoji = () => {
    if (!store.enableTaunts()) return '🤐';
    if (!taunt().visible) {
      const s = streak();
      const lastRes = store.lastGameResult();
      if (s >= 5) return '😱';
      if (s >= 3) return '😤';
      if (s >= 2) return '😒';
      if (lastRes === 'loss') return '😏';
      return config().avatar;
    }
    return getMoodEmoji(taunt().mood, config().avatar);
  };

  // Hiệu ứng chuyển động Avatar theo tâm trạng
  const moodAnimation = () => {
    if (!store.enableTaunts()) {
      return taunt().visible ? 'scale-105 animate-bubble-shake' : 'group-hover:scale-105 opacity-80';
    }
    if (!taunt().visible) {
      const s = streak();
      if (s >= 3) return 'scale-105 animate-pulse';
      return 'group-hover:scale-105';
    }
    return MOOD_ANIMATIONS[taunt().mood] || 'scale-110 rotate-3';
  };

  // Phong cách & Màu sắc Bong bóng thoại thích ứng theo Mood
  const bubbleTheme = () => {
    if (!store.enableTaunts()) {
      return {
        box: 'bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 text-rose-400 border-2 border-rose-500/70 shadow-rose-950/60 font-mono tracking-wider',
        arrow: 'bg-slate-950 border-l-2 border-b-2 border-rose-500/70',
      };
    }
    return BUBBLE_THEMES[taunt().mood] || DEFAULT_BUBBLE_THEME;
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
    <div class="w-full max-w-[min(96vw,560px)] md:max-w-[600px] flex items-center justify-start relative select-none h-[54px] sm:h-[60px] z-40">
      {/* 🤖 ICON BOT TƯƠNG TÁC (Lệch trái, hỗ trợ chế độ Bịt miệng 🤐, nổi đè lên Header) */}
      <button
        onClick={handlePoke}
        class={`group relative p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all duration-300 active:scale-90 cursor-pointer select-none shrink-0 z-40 ${
          taunt().visible ? 'ring-2 ring-amber-400 shadow-amber-500/30' : ''
        }`}
        title={store.enableTaunts() ? 'Chọc đối thủ để nghe cà khịa' : 'Bot đang bị bịt miệng (Cà khịa đang TẮT)'}
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

      {/* 💬 BONG BÓNG LỜI THOẠI CÀ KHỊA NỔI (Floating Absolute Overlay - z-40 nổi đè lên trên Header) */}
      <Show when={taunt().visible && (displayedText() || taunt().text)}>
        <div class="absolute left-[62px] sm:left-[72px] top-1/2 -translate-y-1/2 max-w-[calc(100%-66px)] sm:max-w-[480px] z-40 pointer-events-auto animate-bubble-pop">
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
