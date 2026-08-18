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
          <div class="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20">
            <span class="text-base sm:text-lg font-black text-slate-950">G</span>
          </div>
          <h1 class="hidden sm:flex text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white items-center gap-1">
            <span>Gomoku</span>
            <span class="text-amber-400">Master</span>
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
            onClick={() => store.setShowBotModal(true)}
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
