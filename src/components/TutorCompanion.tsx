import { Component, createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { Award, User, Bot } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { BotAvatar } from './BotAvatar';
import { soundService } from '../services/soundService';

export const TutorCompanion: Component = () => {
  const store = useGame();
  const botEval = () => store.tutorBotEvaluation();
  const feedback = () => store.tutorFeedback();

  // Biểu cảm khuôn mặt sống động của Gia Sư Gomo theo trạng thái ván đấu
  const tutorAvatarMood = () => {
    const mood = store.tutorMood();
    switch (mood) {
      case 'thinking':
        return 'thinking'; // 🤔 Đang tính toán phân tích
      case 'danger':
        return 'panic'; // 😱 Phát hiện đối thủ có đòn nguy hiểm
      case 'excited':
        return 'party'; // 🥳 Phấn khích khi có cơ hội kết liễu
      case 'proud':
        return 'cool'; // 😎 Tự hào khi bạn đi nước cờ xuất sắc
      case 'calm':
      default:
        return 'eye_roll'; // 🙄 Bình thản quan sát ván cờ
    }
  };

  // Hiệu ứng Typewriter mượt mà cho Cột Trái (Đánh Giá Nước Đi Của Bot)
  const [displayedBotText, setDisplayedBotText] = createSignal('');
  let botTypingTimer: number | null = null;

  createEffect(() => {
    const be = botEval();
    const fullText = be?.speech || 'Đang chờ nước đi mở màn của đối thủ...';
    
    if (botTypingTimer) {
      clearInterval(botTypingTimer);
      botTypingTimer = null;
    }

    let charIdx = 0;
    setDisplayedBotText('');

    botTypingTimer = window.setInterval(() => {
      charIdx++;
      const sub = fullText.slice(0, charIdx);
      setDisplayedBotText(sub);

      if (charIdx % 4 === 0 && fullText[charIdx - 1]?.trim()) {
        soundService.playVoiceBlip(tutorAvatarMood());
      }

      if (charIdx >= fullText.length) {
        if (botTypingTimer) {
          clearInterval(botTypingTimer);
          botTypingTimer = null;
        }
      }
    }, 15);
  });

  // Hiệu ứng Typewriter mượt mà cho Cột Phải (Đánh Giá Nước Cờ Của Bạn)
  const [displayedPlayerText, setDisplayedPlayerText] = createSignal('');
  let playerTypingTimer: number | null = null;

  createEffect(() => {
    const fb = feedback();
    const fullText = fb?.speech || 'Đang chờ nước cờ đầu tiên của bạn...';
    
    if (playerTypingTimer) {
      clearInterval(playerTypingTimer);
      playerTypingTimer = null;
    }

    let charIdx = 0;
    setDisplayedPlayerText('');

    playerTypingTimer = window.setInterval(() => {
      charIdx++;
      const sub = fullText.slice(0, charIdx);
      setDisplayedPlayerText(sub);

      if (charIdx % 4 === 0 && fullText[charIdx - 1]?.trim()) {
        soundService.playVoiceBlip('smug');
      }

      if (charIdx >= fullText.length) {
        if (playerTypingTimer) {
          clearInterval(playerTypingTimer);
          playerTypingTimer = null;
        }
      }
    }, 15);
  });

  onCleanup(() => {
    if (botTypingTimer) clearInterval(botTypingTimer);
    if (playerTypingTimer) clearInterval(playerTypingTimer);
  });

  return (
    <div class="w-full relative rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950/90 border border-amber-500/30 p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 select-none">
      {/* Header Bar: Avatar Gia Sư Thần Cờ & Cấp Độ */}
      <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
        <div class="flex items-center gap-2.5">
          {/* Avatar Icon Gia Sư Gomo (Biểu cảm động 3D sống động) */}
          <div class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-3xl shrink-0">
            <BotAvatar name={tutorAvatarMood()} />
          </div>
          <div>
            <span class="text-xs font-black text-amber-300 tracking-wide flex items-center gap-1">
              <Award size={13} class="text-amber-400" /> Gia Sư Gomo
            </span>
            <p class="text-[10px] text-slate-400 font-medium">Học Viện Gomo</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
          <span>Đối thủ:</span>
          <span class="text-amber-300 font-bold">Cấp {store.currentLevelConfig().id} ({store.currentLevelConfig().vietnameseName})</span>
        </div>
      </div>

      {/* 2-Column Split Dialogue Grid: Bên Trái (Đánh Giá Bạn) & Bên Phải (Đánh Giá Đối Thủ) */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* 1. CỘT TRÁI: Đánh Giá Nước Cờ Của Bạn */}
        <div class="relative rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-amber-950/30 border border-amber-500/30 p-2.5 sm:p-3 flex flex-col justify-between min-h-[95px] shadow-inner">
          <div class="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <User size={13} class="text-amber-400" /> Đánh Giá Nước Cờ Của Bạn
            </span>
            <Show when={store.tutorFeedback()?.tacticName}>
              {name => (
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-fade-in">
                  🎯 {name()}
                </span>
              )}
            </Show>
          </div>

          <div class="flex-1 flex items-center">
            <p class="text-xs font-medium text-amber-100/95 leading-relaxed">
              {displayedPlayerText()}
              <span class="inline-block w-1.5 h-3 ml-0.5 bg-amber-400 animate-pulse align-middle" />
            </p>
          </div>
        </div>

        {/* 2. CỘT PHẢI: Đánh Giá Nước Đi Của Bot / Đối Thủ */}
        <div class="relative rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-sky-950/30 border border-sky-500/30 p-2.5 sm:p-3 flex flex-col justify-between min-h-[95px] shadow-inner">
          <div class="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            <span class="text-[11px] font-bold text-sky-300 flex items-center gap-1">
              <Bot size={13} class="text-sky-400" /> Nước Đi Của Đối Thủ
            </span>
            <Show when={store.tutorBotEvaluation()?.tacticName}>
              {name => (
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm animate-fade-in">
                  ⚡ {name()}
                </span>
              )}
            </Show>
          </div>

          <div class="flex-1 flex items-center">
            <p class="text-xs font-medium text-sky-100/95 leading-relaxed">
              {displayedBotText()}
              <span class="inline-block w-1.5 h-3 ml-0.5 bg-sky-400 animate-pulse align-middle" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
