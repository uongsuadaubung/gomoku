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
    <header class="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div class="flex items-center space-x-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20">
            <span class="text-xl font-black text-slate-950">G</span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Gomoku <span class="text-amber-400">Master</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => store.toggleSound()}
            title={store.isMuted() ? 'Bật âm thanh' : 'Tắt âm thanh'}
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <Show when={!store.isMuted()} fallback={<VolumeX size={18} class="text-rose-400" />}>
              <Volume2 size={18} class="text-emerald-400" />
            </Show>
          </button>

          {/* Rules / Help */}
          <button
            onClick={() => {
              store.setShowRulesModal(true);
              store.triggerTaunt('OPEN_RULES', 200);
            }}
            title="Hướng dẫn luật chơi"
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center gap-1 text-xs font-medium"
          >
            <HelpCircle size={18} class="text-sky-400" />
            <span class="hidden md:inline">Luật chơi</span>
          </button>

          {/* Stats Modal */}
          <button
            onClick={() => {
              store.setShowStatsModal(true);
              store.triggerTaunt('OPEN_STATS', 200);
            }}
            title="Thống kê kết quả ván đấu"
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium"
          >
            <BarChart3 size={18} class="text-emerald-400" />
            <span class="hidden md:inline">Thống kê</span>
            <span class="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-bold border border-emerald-500/30">
              {store.stats().wins}W - {store.stats().losses}L
            </span>
          </button>

          {/* Bot Level Modal */}
          <button
            onClick={() => store.setShowBotModal(true)}
            title="Cấp độ và thông tin Bot"
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium"
          >
            <Bot size={18} class="text-amber-400" />
            <span class="hidden md:inline">Cấp độ Bot</span>
            <span class="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold border border-amber-500/30">
              Lv.{store.currentLevelConfig().id}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => store.setShowSettingsModal(true)}
            title="Cài đặt trò chơi"
            class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <Settings size={18} class="text-slate-300 hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
