import { Component, onMount, Show } from 'solid-js';
import { GameProvider, useGame } from './store/GameContext';
import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { BotCharacter } from './components/BotCharacter';
import { GameBoard } from './components/GameBoard';
import { AIStatusPanel } from './components/AIStatusPanel';
import { GameControls } from './components/GameControls';
import { MoveHistory } from './components/MoveHistory';
import { StatsModal } from './components/StatsModal';
import { BotModal } from './components/BotModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { LevelUpModal } from './components/LevelUpModal';
import { TutorCompanion } from './components/TutorCompanion';
import { GameOverBanner } from './components/GameOverBanner';

const AppContent: Component = () => {
  const store = useGame();

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
      <Header />

      {/* Main Content Area */}
      <main class="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-6 flex flex-col items-center justify-center">
        <Show
          when={store.gameMode() !== 'menu'}
          fallback={<MainMenu />}
        >
          <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
            {/* Left Column: Board & Opponent Character (7 cols on large screens) */}
            <div class="lg:col-span-7 flex flex-col items-center gap-2 sm:gap-3 w-full">
              {/* Nhân Vật Đối Thủ & Bong Bóng Cà Khịa (Tự động ẩn trong chế độ Gia Sư, hiển thị trong các chế độ khác) */}
              <Show when={store.currentStrategy().shouldShowBotCharacter()}>
                <BotCharacter />
              </Show>

              {/* Trên Mobile: Hiển thị Gia Sư Thần Cờ đồng hành ngay trên bàn cờ */}
              <Show when={store.gameMode() === 'tutor'}>
                <div class="w-full block lg:hidden">
                  <TutorCompanion />
                </div>
              </Show>

              {/* 15x15 Interactive Game Board */}
              <div class="w-full flex justify-center py-0.5 sm:py-1">
                <GameBoard />
              </div>

              {/* Trên Mobile: Đặt GameControls ngay dưới bàn cờ để ngón tay thao tác thuận tiện */}
              <div class="w-full block lg:hidden">
                <GameControls />
              </div>
            </div>

            {/* Right Column: Game Controls, AI Live Radar & Move History (5 cols on large screens) */}
            <div class="lg:col-span-5 flex flex-col gap-3 sm:gap-4 w-full">
              {/* Chế độ Gia Sư trên Desktop: Hiển thị bảng Gia Sư Thần Cờ ở đầu cột Status */}
              <Show when={store.gameMode() === 'tutor'}>
                <div class="w-full hidden lg:block">
                  <TutorCompanion />
                </div>
              </Show>

              {/* 1. Trên Desktop: Game Controls (Chọn lượt đi / Nhận thua / Ván mới) */}
              <div class="w-full hidden lg:block">
                <GameControls />
              </div>

              {/* 2. AI Status & Radar Panel */}
              <AIStatusPanel />

              {/* 3. Danh Sách Nước Đi Nằm Ở Dưới Cuối Cùng */}
              <div class="w-full">
                <MoveHistory />
              </div>
            </div>

          </div>
        </Show>
      </main>

      {/* Modals & Overlays */}
      <StatsModal />
      <BotModal />
      <SettingsModal />
      <RulesModal />
      <LevelUpModal />
      <GameOverBanner />
    </div>
  );
};

export const App: Component = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
