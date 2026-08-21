import { Component, Show, createSignal, onMount, onCleanup } from 'solid-js';
import {
  Volume2,
  VolumeX,
  Settings,
  ChartColumn,
  Bot,
  House,
  Trophy,
  Puzzle,
  Swords,
  Zap,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { GameLogo } from './GameLogo';
import { HeaderIconButton } from './HeaderIconButton';

const MODE_BADGES: Record<string, { Icon: typeof Trophy; label: (limit: number) => string; iconColor: string; textColor: string }> = {
  campaign: { Icon: Trophy, label: () => 'Chiến Dịch', iconColor: 'text-indigo-400', textColor: 'text-indigo-300' },
  blitz: { Icon: Zap, label: (l) => `Cờ Chớp (${l}s)`, iconColor: 'text-rose-400', textColor: 'text-rose-300' },
  puzzle: { Icon: Puzzle, label: () => 'Thế Cờ', iconColor: 'text-emerald-400', textColor: 'text-emerald-300' },
  custom: { Icon: Swords, label: () => 'Đấu Tập', iconColor: 'text-amber-400', textColor: 'text-amber-300' },
};

export const Header: Component = () => {
  const store = useGame();
  const [isVisible, setIsVisible] = createSignal(true);

  onMount(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Luôn hiện khi đang ở gần đỉnh trang
          if (currentScrollY <= 15) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 40) {
            // Cuộn xuống -> Header tự động tụt ẩn lên trên để nhường không gian cho bàn cờ
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Cuộn lên -> Hiện lại Header ngay
            setIsVisible(true);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    onCleanup(() => window.removeEventListener('scroll', handleScroll));
  });

  return (
    <header
      class={`w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-30 select-none transition-transform duration-300 ease-out will-change-transform ${
        isVisible() ? 'translate-y-0' : '-translate-y-full shadow-lg pointer-events-none'
      }`}
    >
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div class="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Show when={store.gameMode() !== 'menu'}>
            <button
              type="button"
              onClick={() => store.goToMainMenu()}
              title="Quay về Trang Chủ / Menu"
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 hover:text-amber-300 border border-slate-700/80 flex items-center gap-1 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <House size={16} />
              <span class="hidden sm:inline">Menu</span>
            </button>
          </Show>

          <GameLogo onClick={() => store.goToMainMenu()} />
        </div>

        {/* Current Mode Badge (Khi đang trong ván chơi) */}
        <Show when={MODE_BADGES[store.gameMode()]}>
          {badge => {
            const Icon = badge().Icon;
            return (
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold shadow-inner">
                <Icon size={14} class={badge().iconColor} />
                <span class={badge().textColor}>{badge().label(store.blitzTimeLimit())}</span>
              </div>
            );
          }}
        </Show>

        {/* Action Buttons */}
        <div class="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Sound Toggle */}
          <HeaderIconButton
            title={store.isMuted() ? 'Bật âm thanh' : 'Tắt âm thanh'}
            onClick={() => store.toggleSound()}
            icon={
              <Show when={!store.isMuted()} fallback={<VolumeX size={16} class="text-rose-400 sm:w-[18px] sm:h-[18px]" />}>
                <Volume2 size={16} class="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
              </Show>
            }
          />

          {/* Stats Modal */}
          <HeaderIconButton
            title="Thống kê kết quả ván đấu"
            label="Thống Kê"
            onClick={() => {
              store.setShowStatsModal(true);
              if (store.gameMode() !== 'menu') {
                store.triggerTaunt('OPEN_STATS', 200);
              }
            }}
            icon={<ChartColumn size={16} class="text-emerald-400 sm:w-[18px] sm:h-[18px]" />}
          />

          {/* Bot Level Modal */}
          <HeaderIconButton
            title="Danh sách đối thủ Bot"
            label="Đối Thủ"
            onClick={() => {
              store.setShowBotModal(true);
              if (store.gameMode() !== 'menu') {
                store.triggerTaunt('OPEN_BOT_MODAL', 200);
              }
            }}
            icon={<Bot size={16} class="text-amber-400 sm:w-[18px] sm:h-[18px]" />}
          />

          {/* Settings */}
          <HeaderIconButton
            title="Cài đặt trò chơi"
            onClick={() => store.setShowSettingsModal(true)}
            icon={<Settings size={16} class="text-slate-300 sm:w-[18px] sm:h-[18px] hover:rotate-45 transition-transform" />}
          />
        </div>
      </div>
    </header>
  );
};
