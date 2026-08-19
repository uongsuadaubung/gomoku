import { Component, Show } from 'solid-js';
import {
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  BarChart3,
  Bot,
  Home,
  Trophy,
  Puzzle,
  Swords,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';

export const Header: Component = () => {
  const store = useGame();

  return (
    <header class="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-30 select-none">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div class="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Show when={store.gameMode() !== 'menu'}>
            <button
              onClick={() => store.goToMainMenu()}
              title="Quay về Trang Chủ / Menu"
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center gap-1 text-xs font-bold transition-all shadow-sm"
            >
              <Home size={16} />
              <span class="hidden sm:inline">Menu</span>
            </button>
          </Show>

          <button
            onClick={() => store.goToMainMenu()}
            class="flex items-center space-x-2 hover:opacity-90 transition-opacity text-left"
          >
            <div class="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 p-1">
              <svg viewBox="0 0 512 512" class="w-full h-full drop-shadow">
                <defs>
                  <radialGradient id="headerBlackStone" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#64748b"/>
                    <stop offset="30%" stop-color="#334155"/>
                    <stop offset="70%" stop-color="#0f172a"/>
                    <stop offset="100%" stop-color="#020617"/>
                  </radialGradient>
                  <radialGradient id="headerWhiteStone" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="50%" stop-color="#f8fafc"/>
                    <stop offset="80%" stop-color="#cbd5e1"/>
                    <stop offset="100%" stop-color="#94a3b8"/>
                  </radialGradient>
                </defs>
                <circle cx="190" cy="320" r="75" fill="url(#headerBlackStone)"/>
                <ellipse cx="170" cy="295" rx="28" ry="16" fill="#ffffff" opacity="0.3" transform="rotate(-30 170 295)"/>
                <circle cx="320" cy="190" r="75" fill="url(#headerWhiteStone)"/>
                <ellipse cx="300" cy="165" rx="30" ry="19" fill="#ffffff" opacity="0.8" transform="rotate(-30 300 165)"/>
                <path d="M256 210 Q260 245 295 256 Q260 267 256 302 Q252 267 217 256 Q252 245 256 210Z" fill="#fbbf24"/>
                <circle cx="256" cy="256" r="7" fill="#ffffff"/>
              </svg>
            </div>
            <h1 class="hidden sm:flex text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white items-center gap-0.5">
              <span class="tracking-tight">GoMock</span>
              <span class="text-amber-400 font-black">U</span>
            </h1>
          </button>
        </div>

        {/* Current Mode Badge (Khi đang trong ván chơi) */}
        <Show when={store.gameMode() !== 'menu'}>
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold shadow-inner">
            <Show when={store.gameMode() === 'campaign'}>
              <Trophy size={14} class="text-indigo-400" />
              <span class="text-indigo-300">Chiến Dịch • Bot {store.currentLevelConfig().vietnameseName}</span>
            </Show>
            <Show when={store.gameMode() === 'puzzle'}>
              <Puzzle size={14} class="text-emerald-400" />
              <span class="text-emerald-300">
                Sát Cục {(store.currentPuzzle()?.stars || 1) <= 5 ? '⭐'.repeat(store.currentPuzzle()?.stars || 1) : `⭐x${store.currentPuzzle()?.stars || 1}`}
              </span>
            </Show>
            <Show when={store.gameMode() === 'custom'}>
              <Swords size={14} class="text-amber-400" />
              <span class="text-amber-300">Đấu Tập • Bot {store.currentLevelConfig().vietnameseName}</span>
            </Show>
          </div>
        </Show>

        {/* Action Buttons */}
        <div class="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => store.toggleSound()}
            title={store.isMuted() ? 'Bật âm thanh' : 'Tắt âm thanh'}
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60"
          >
            <Show when={!store.isMuted()} fallback={<VolumeX size={16} class="text-rose-400 sm:w-[18px] sm:h-[18px]" />}>
              <Volume2 size={16} class="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
            </Show>
          </button>

          {/* Rules / Help */}
          <button
            onClick={() => {
              store.setShowRulesModal(true);
              if (store.gameMode() !== 'menu') {
                store.triggerTaunt('OPEN_RULES', 200);
              }
            }}
            title="Hướng dẫn luật chơi"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 text-xs font-medium"
          >
            <HelpCircle size={16} class="text-sky-400 sm:w-[18px] sm:h-[18px]" />
            <span class="hidden md:inline">Luật</span>
          </button>

          {/* Stats Modal */}
          <button
            onClick={() => {
              store.setShowStatsModal(true);
              if (store.gameMode() !== 'menu') {
                store.triggerTaunt('OPEN_STATS', 200);
              }
            }}
            title="Thống kê kết quả ván đấu"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 sm:gap-1.5 text-xs font-medium"
          >
            <BarChart3 size={16} class="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
            <span class="bg-emerald-500/20 text-emerald-300 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border border-emerald-500/30">
              {store.stats().wins}W
            </span>
          </button>

          {/* Bot Level Modal */}
          <button
            onClick={() => {
              store.setShowBotModal(true);
              if (store.gameMode() !== 'menu') {
                store.triggerTaunt('OPEN_BOT_MODAL', 200);
              }
            }}
            title="Danh sách đối thủ Bot"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 sm:gap-1.5 text-xs font-medium"
          >
            <Bot size={16} class="text-amber-400 sm:w-[18px] sm:h-[18px]" />
            <span class="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border border-amber-500/30 truncate max-w-[80px] sm:max-w-none">
              Bot {store.currentLevelConfig().vietnameseName}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => store.setShowSettingsModal(true)}
            title="Cài đặt trò chơi"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60"
          >
            <Settings size={16} class="text-slate-300 sm:w-[18px] sm:h-[18px] hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
