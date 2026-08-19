import { Component, createSignal, For } from 'solid-js';
import {
  Trophy,
  Swords,
  Puzzle,
  Play,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { BotPreviewCard } from './BotPreviewCard';

export const MainMenu: Component = () => {
  const store = useGame();

  const campaignLevel = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;
  const puzzleLevel = () => store.stats().puzzle?.currentLevel || 1;

  // Cấu hình cục bộ cho chế độ Đấu Tùy Chọn (Mặc định chọn cấp độ cao nhất đã mở khóa hoặc Lv 1)
  const isBotUnlocked = (lvlId: number) => {
    const lvl = AI_LEVELS.find(l => l.id === lvlId);
    return lvl ? campaignWins() >= lvl.minWins : false;
  };

  const initialBotLevel = () => {
    const current = campaignLevel().id;
    return Math.min(current, 3); // Mặc định Lv 3 nếu đã mở, hoặc cấp hiện tại
  };

  const [customBotLevel, setCustomBotLevel] = createSignal<number>(initialBotLevel());

  // Đảm bảo customBotLevel luôn nằm trong phạm vi đã mở khóa
  const effectiveCustomBotLevel = () => {
    const selected = customBotLevel();
    if (isBotUnlocked(selected)) return selected;
    return campaignLevel().id; // Fallback về cấp cao nhất đã mở
  };

  return (
    <div class="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center gap-4 sm:gap-6 animate-fade-in select-none">
      {/* 3 Game Mode Cards */}
      <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        
        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 1: CHIẾN DỊCH LEO CẤP (CAMPAIGN MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/70 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
          <div class="space-y-4">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
                <Trophy size={26} />
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Chiến Dịch
              </span>
            </div>

            <div>
              <h2 class="text-lg sm:text-xl font-black text-white group-hover:text-indigo-200 transition-colors">
                Chiến Dịch Leo Cấp
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                Hành trình chinh phục đỉnh cao kỳ nghệ. Tích lũy chiến thắng để từng bước diện kiến và giải mã những đối thủ ẩn danh!
              </p>
            </div>

            {/* Current Level Badge Preview */}
            <BotPreviewCard bot={campaignLevel()} theme="indigo" />
          </div>

          <button
            onClick={() => store.startCampaignMode()}
            class="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Play size={16} class="fill-white" />
            <span>Tiếp Tục Chiến Dịch</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 2: THẾ CỜ GIỮA TRẬN (TACTICAL PUZZLE MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/70 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
          <div class="space-y-4">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                <Puzzle size={26} />
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles size={11} /> 100% Map Ngẫu Nhiên
              </span>
            </div>

            <div>
              <h2 class="text-lg sm:text-xl font-black text-white group-hover:text-emerald-200 transition-colors">
                Giải Đố Sát Cục
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                Đấu trí tìm đòn kết liễu trong những thế cờ hiểm hóc. Giải đúng để thăng hạng vô hạn, sai lầm sẽ bị tụt hạng!
              </p>
            </div>

            {/* Current Puzzle Level Status */}
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center">
              <div class="flex items-center gap-2.5">
                <span class="text-lg tracking-tighter">
                  {puzzleLevel() <= 5 ? '⭐'.repeat(puzzleLevel()) : `⭐x${puzzleLevel()}`}
                </span>
                <div>
                  <div class="text-xs font-black text-white">
                    {puzzleLevel() <= 5 ? `Thế Cờ Mức ${puzzleLevel()}⭐` : `Thế Cờ Đỉnh Cao (${puzzleLevel()}⭐)`}
                  </div>
                  <div class="text-[10px] text-emerald-400 font-medium">
                    Thử thách nhãn quan chiến thuật
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startPuzzleMode()}
            class="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Vào Giải Đố</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 3: ĐẤU TÙY CHỌN VỚI BOT (CUSTOM MATCH) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
          <div class="space-y-4">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                <Swords size={26} />
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Đấu Tập Tự Do
              </span>
            </div>

            <div>
              <h2 class="text-lg sm:text-xl font-black text-white group-hover:text-amber-200 transition-colors">
                Đấu Tùy Chọn Với Bot
              </h2>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                Đấu tập tự do với các đối thủ bạn đã mở khóa từ Chiến Dịch Leo Cấp.
              </p>
            </div>

            {/* Select Bot Level & Side */}
            <div class="space-y-3">
              {/* Bot Level Selector via Dropdown */}
              <div>
                <label class="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Chọn đối thủ đã mở:
                </label>
                <div class="relative">
                  <select
                    value={effectiveCustomBotLevel()}
                    onChange={e => setCustomBotLevel(Number(e.currentTarget.value))}
                    class="w-full py-2.5 px-3.5 pr-9 rounded-2xl bg-slate-950/90 hover:bg-slate-950 text-slate-100 font-bold text-xs border border-slate-800 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <For each={AI_LEVELS.filter(lvl => isBotUnlocked(lvl.id))}>
                      {lvl => (
                        <option value={lvl.id} class="bg-slate-900 text-slate-200 py-1">
                          {lvl.avatar} Bot {lvl.vietnameseName}
                        </option>
                      )}
                    </For>
                  </select>
                  <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={15} />
                  </div>
                </div>

                {/* Selected Bot Details & Description */}
                <div class="mt-2.5">
                  <BotPreviewCard bot={AI_LEVELS[effectiveCustomBotLevel() - 1]} theme="amber" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startCustomMatch(effectiveCustomBotLevel())}
            class="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Swords size={16} />
            <span>Bắt Đầu Đấu Tập</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
