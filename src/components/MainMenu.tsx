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
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { BotPreviewCard } from './BotPreviewCard';

export const MainMenu: Component = () => {
  const store = useGame();

  const campaignLevel = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;
  const puzzleLevel = () => store.stats().puzzle?.currentLevel || 1;

  // Cấu hình cục bộ cho chế độ Cờ Chớp (5s / 10s / 15s - Mặc định 10s)
  const [selectedBlitzTime, setSelectedBlitzTime] = createSignal<5 | 10 | 15>(
    store.blitzTimeLimit() || 10
  );

  const highestBlitzLevelId = () => store.stats().blitz?.highestLevel || 1;
  const highestBlitzBot = () => AI_LEVELS.find(l => l.id === highestBlitzLevelId()) || AI_LEVELS[0];

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
    <div class="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center gap-4 sm:gap-6 animate-fade-in select-none">
      {/* 4 Game Mode Cards Grid */}
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 1: CHIẾN DỊCH LEO CẤP (CAMPAIGN MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/70 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
                <Trophy size={24} />
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Chiến Dịch
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition-colors">
                Chiến Dịch Leo Cấp
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
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
        {/* CHẾ ĐỘ 2: CỜ CHỚP SINH TỬ (BLITZ CHALLENGE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400/70 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner">
                <Zap size={24} />
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <Zap size={10} /> Sinh Tử
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-rose-200 transition-colors">
                Cờ Chớp Thử Thách
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Áp lực thời gian mỗi nước. Thắng leo cấp từ Lv 1, thua hoặc hết giờ về Menu!
              </p>
            </div>

            {/* Time Selection Buttons: 5s / 10s / 15s */}
            <div>
              <div class="text-[11px] font-bold text-slate-400 mb-1.5 flex justify-between items-center">
                <span>Thời gian / nước:</span>
                <span class="text-rose-400 font-mono text-[10px]">Mặc định 10s</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                <For each={[5, 10, 15] as const}>
                  {sec => (
                    <button
                      onClick={() => {
                        setSelectedBlitzTime(sec);
                        store.setBlitzTimeLimit(sec);
                      }}
                      class={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
                        selectedBlitzTime() === sec
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {sec}s
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Highest Blitz Level Achieved */}
            <div class="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="text-lg">{highestBlitzBot().avatar}</div>
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">Kỷ lục cao nhất:</div>
                  <div class="text-xs font-bold text-rose-300">
                    Cấp {highestBlitzLevelId()} - {highestBlitzBot().vietnameseName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startBlitzMode(selectedBlitzTime(), 1)}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
          >
            <Zap size={14} class="fill-white" />
            <span>Thách Đấu Cờ Chớp</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 3: THẾ CỜ GIỮA TRẬN (TACTICAL PUZZLE MODE) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/70 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                <Puzzle size={24} />
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles size={10} /> 100% Map Ngẫu Nhiên
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-emerald-200 transition-colors">
                Giải Đố Sát Cục
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                Đấu trí tìm đòn kết liễu trong những thế cờ hiểm hóc chống lại Thần Cờ!
              </p>
            </div>

            {/* Current Puzzle Status */}
            <div class="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Puzzle size={16} />
                </div>
                <div>
                  <div class="text-xs font-black text-white">
                    Giải Đố Sát Cục
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
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Vào Giải Đố</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHẾ ĐỘ 4: ĐẤU TÙY CHỌN VỚI BOT (CUSTOM MATCH) */}
        {/* ========================================================================= */}
        <div class="group relative rounded-3xl bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
          <div class="space-y-3.5">
            {/* Mode Header */}
            <div class="flex items-start justify-between">
              <div class="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                <Swords size={24} />
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Đấu Tập Tự Do
              </span>
            </div>

            <div>
              <h2 class="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                Đấu Tùy Chọn Với Bot
              </h2>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Đấu tập tự do với các đối thủ bạn đã mở khóa từ Chiến Dịch.
              </p>
            </div>

            {/* Select Bot Level & Side */}
            <div class="space-y-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 block mb-1">
                  Chọn đối thủ đã mở:
                </label>
                <div class="relative">
                  <select
                    value={effectiveCustomBotLevel()}
                    onChange={e => setCustomBotLevel(Number(e.currentTarget.value))}
                    class="w-full py-2 px-3 pr-8 rounded-xl bg-slate-950/90 hover:bg-slate-950 text-slate-100 font-bold text-xs border border-slate-800 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <For each={AI_LEVELS.filter(lvl => isBotUnlocked(lvl.id))}>
                      {lvl => (
                        <option value={lvl.id} class="bg-slate-900 text-slate-200 py-1">
                          {lvl.avatar} Bot {lvl.vietnameseName}
                        </option>
                      )}
                    </For>
                  </select>
                  <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>

                {/* Selected Bot Details & Description */}
                <div class="mt-2">
                  <BotPreviewCard bot={AI_LEVELS[effectiveCustomBotLevel() - 1]} theme="amber" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => store.startCustomMatch(effectiveCustomBotLevel())}
            class="w-full mt-4 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Swords size={14} />
            <span>Bắt Đầu Đấu Tập</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
