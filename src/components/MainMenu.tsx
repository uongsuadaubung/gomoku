import { Component, createSignal, For } from 'solid-js';
import {
  Trophy,
  Swords,
  Puzzle,
  Play,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Award,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { BotPreviewCard } from './BotPreviewCard';
import { BotAvatar } from './BotAvatar';

export const MainMenu: Component = () => {
  const store = useGame();

  const campaignLevel = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;

  const highestBlitzLevelId = () => store.stats().blitz?.highestLevel || 1;
  const highestBlitzBot = () => AI_LEVELS.find(l => l.id === highestBlitzLevelId()) || AI_LEVELS[0];

  // Cấu hình cục bộ cho chế độ Gia Sư
  const tutorOpponentLevelId = () => store.stats().tutor?.currentLevel || 1;
  const tutorOpponentBot = () => AI_LEVELS.find(l => l.id === tutorOpponentLevelId()) || AI_LEVELS[0];



  return (
    <div class="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center gap-4 sm:gap-6 animate-fade-in select-none">
      {/* 5 Game Mode Cards Grid - 3 items per row on large screens */}
      <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        
        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 1: CHIẾN DỊCH (CAMPAIGN MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/70 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
                <Trophy size={24} />
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Chiến Dịch
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition-colors">
                Chiến Dịch Leo Cấp
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Tích lũy chiến thắng để từng bước diện kiến và giải mã 12 cao thủ kỳ nghệ!
              </p>
            </div>

            {/* Current Level Badge Preview */}
            <BotPreviewCard bot={campaignLevel()} theme="indigo" />
          </div>

          <button
            onClick={() => store.startCampaignMode()}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Play size={14} class="fill-white" />
            <span>Tiếp Tục Chiến Dịch</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 2: THẾ CỜ / PUZZLE (TACTICAL PUZZLE MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/70 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                <Puzzle size={24} />
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles size={11} /> 100% Map Ngẫu Nhiên
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-emerald-200 transition-colors">
                Giải Đố Thế Cờ
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Đấu trí tìm đòn kết liễu trong những thế cờ hiểm hóc chống lại Thần Cờ!
              </p>
            </div>

            {/* Current Puzzle Status */}
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Puzzle size={18} />
                </div>
                <div>
                  <div class="text-xs font-black text-white">
                    Giải Đố Sát Cục
                  </div>
                  <div class="text-[11px] text-emerald-400 font-medium">
                    Thử thách nhãn quan chiến thuật
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startPuzzleMode()}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Vào Giải Đố</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 3: HỌC VIỆN GOMO (TUTOR COACHING MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/80 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:shadow-amber-500/15 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                <GraduationCap size={24} />
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Award size={11} /> Gia Sư 1-1
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                Học Viện Gomo
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Được Gia sư Gomo kèm cặp trực tiếp, phân tích thế cờ khi leo tháp Cấp 1 - Cấp 12!
              </p>
            </div>

            {/* Mentor & Opponent Preview */}
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles size={12} /> Gia Sư:
                </span>
                <span class="text-amber-200 font-extrabold">Gia sư Gomo</span>
              </div>
              <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                <span class="text-slate-400 font-medium">Đối thủ tiếp theo:</span>
                <span class="text-slate-200 font-bold">
                  Cấp {tutorOpponentLevelId()} - {tutorOpponentBot().vietnameseName}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startTutorMode()}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <GraduationCap size={14} />
            <span>Vào Học Viện Gomo</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 4: CỜ CHỚP (FLASH / BLITZ CHALLENGE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400/70 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner">
                <Zap size={24} />
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <Zap size={11} /> Sinh Tử
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-rose-200 transition-colors">
                Cờ Chớp Thử Thách
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Áp lực thời gian mỗi nước. Thắng leo cấp từ Lv 1, thua hoặc hết giờ về Menu!
              </p>
            </div>

            {/* Info Preview */}
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span class="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                <Zap size={13} /> Kỷ lục cao nhất:
              </span>
              <span class="text-rose-200 font-extrabold text-xs">
                Cấp {highestBlitzLevelId()} - {highestBlitzBot().vietnameseName}
              </span>
            </div>
          </div>

          <button
            onClick={() => store.enterBlitzMode()}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
          >
            <Zap size={14} class="fill-white" />
            <span>Vào Thách Đấu Cờ Chớp</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 5: ĐẤU TÙY CHỌN VỚI BOT / CUSTOM (CUSTOM MATCH) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400/70 transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-inner">
                <Swords size={24} />
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Đấu Tập Tự Do
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-purple-200 transition-colors">
                Đấu Tùy Chọn Với Bot
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Đấu tập tự do với các đối thủ bạn đã mở khóa từ Chiến Dịch.
              </p>
            </div>

            {/* Info Preview */}
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <span class="text-purple-400 font-bold flex items-center gap-1.5 text-xs">
                <Swords size={13} /> Số đối thủ đã mở:
              </span>
              <span class="text-purple-200 font-extrabold text-xs">
                {campaignLevel().id} / {AI_LEVELS.length} Bot
              </span>
            </div>
          </div>

          <button
            onClick={() => store.enterCustomMode()}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Swords size={14} />
            <span>Vào Đấu Tùy Chọn</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
