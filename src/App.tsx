import { Component, onMount } from 'solid-js';
import { createGameStore } from './store/gameStore';
import { Header } from './components/Header';
import { BotCharacter } from './components/BotCharacter';
import { GameBoard } from './components/GameBoard';
import { AIStatusPanel } from './components/AIStatusPanel';
import { GameControls } from './components/GameControls';
import { GameOverBanner } from './components/GameOverBanner';
import { StatsModal } from './components/StatsModal';
import { BotModal } from './components/BotModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { LevelUpModal } from './components/LevelUpModal';

export const App: Component = () => {
  const store = createGameStore();

  // Khởi động khi mở trang và bắt sự kiện chuyển tab
  onMount(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (store.gameStatus() === 'playing' && store.moveHistory().length > 0) {
          store.triggerTaunt('TAB_BLUR', 100);
        }
      } else {
        if (store.gameStatus() === 'playing' && store.moveHistory().length > 0) {
          store.triggerTaunt('TAB_FOCUS', 200);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header store={store} />

      {/* Main Content Area */}
      <main class="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-6 flex flex-col items-center justify-center">
        <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
          {/* Left Column: Board & Opponent Character & Game Over banner (7 cols on large screens) */}
          <div class="lg:col-span-7 flex flex-col items-center gap-2 sm:gap-3 w-full">
            {/* Nhân Vật Đối Thủ & Bong Bóng Cà Khịa */}
            <BotCharacter store={store} />

            {/* Game Over Banner (chỉ hiện khi kết thúc ván) */}
            <GameOverBanner store={store} />

            {/* 15x15 Interactive Game Board */}
            <div class="w-full flex justify-center py-0.5 sm:py-1">
              <GameBoard store={store} />
            </div>

            {/* Trên Mobile: Đặt GameControls ngay dưới bàn cờ để ngón tay thao tác thuận tiện */}
            <div class="w-full block lg:hidden">
              <GameControls store={store} />
            </div>
          </div>

          {/* Right Column: AI Live Radar & Game Controls (5 cols on large screens) */}
          <div class="lg:col-span-5 flex flex-col gap-3 sm:gap-4 w-full">
            {/* AI Status & Radar Panel */}
            <AIStatusPanel store={store} />

            {/* Trên Desktop: Hiển thị Game Controls ở cột bên phải */}
            <div class="w-full hidden lg:block">
              <GameControls store={store} />
            </div>

            {/* Quick Strategic Tips */}
            <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 text-xs text-slate-400">
              <span class="font-bold text-slate-300 block mb-1">Mẹo Chiến Thuật:</span>
              <p class="leading-relaxed">
                - Chiếm các điểm trung tâm sớm để kiểm soát nhiều đường chéo.<br />
                - Luôn cảnh giác với các nước tạo <strong class="text-sky-300">3 mở</strong> và <strong class="text-amber-300">bẫy 4-3</strong> của đối thủ khi cấp độ tăng cao.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <StatsModal store={store} />
      <BotModal store={store} />
      <SettingsModal store={store} />
      <RulesModal store={store} />
      <LevelUpModal store={store} />

      {/* Footer */}
      <footer class="w-full border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        <p>Gomoku Master • Game Cờ Carô 15x15</p>
      </footer>
    </div>
  );
};

export default App;
