import { Component, Show } from 'solid-js';
import {
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  BarChart3,
  Bot,
} from 'lucide-solid';
import { GameStore } from '../store/gameStore';

interface HeaderProps {
  store: GameStore;
}

export const Header: Component<HeaderProps> = props => {
  const { store } = props;

  return (
    <header class="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-30 select-none">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div class="flex items-center space-x-2 sm:space-x-3 shrink-0">
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
              {/* Mini Grid */}
              <g stroke="#451a03" stroke-width="12" opacity="0.6">
                <line x1="120" y1="170" x2="392" y2="170"/>
                <line x1="120" y1="256" x2="392" y2="256"/>
                <line x1="120" y1="342" x2="392" y2="342"/>
                <line x1="170" y1="120" x2="170" y2="392"/>
                <line x1="256" y1="120" x2="256" y2="392"/>
                <line x1="342" y1="120" x2="342" y2="392"/>
              </g>
              {/* Black Stone */}
              <circle cx="190" cy="320" r="75" fill="url(#headerBlackStone)"/>
              <ellipse cx="170" cy="295" rx="28" ry="16" fill="#ffffff" opacity="0.3" transform="rotate(-30 170 295)"/>
              {/* White Stone */}
              <circle cx="320" cy="190" r="75" fill="url(#headerWhiteStone)"/>
              <ellipse cx="300" cy="165" rx="30" ry="19" fill="#ffffff" opacity="0.8" transform="rotate(-30 300 165)"/>
              {/* Star Sparkle */}
              <path d="M256 210 Q260 245 295 256 Q260 267 256 302 Q252 267 217 256 Q252 245 256 210Z" fill="#fbbf24"/>
              <circle cx="256" cy="256" r="7" fill="#ffffff"/>
            </svg>
          </div>
          <h1 class="hidden sm:flex text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white items-center gap-0.5">
            <span class="tracking-tight">GoMock</span>
            <span class="text-amber-400 font-black">U</span>
          </h1>
        </div>

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
              store.triggerTaunt('OPEN_RULES', 200);
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
              store.triggerTaunt('OPEN_STATS', 200);
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
              store.triggerTaunt('OPEN_BOT_MODAL', 200);
            }}
            title="Cấp độ đối thủ"
            class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 sm:gap-1.5 text-xs font-medium"
          >
            <Bot size={16} class="text-amber-400 sm:w-[18px] sm:h-[18px]" />
            <span class="bg-amber-500/20 text-amber-300 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border border-amber-500/30">
              Lv.{store.currentLevelConfig().id}
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
