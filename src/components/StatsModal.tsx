import { type Component, Show, createSignal } from 'solid-js';
import {
  X,
  ChartColumn,
  RotateCcw,
  Trophy,
  Puzzle,
  Swords,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { ModalBotTaunt } from './ModalBotTaunt';
import { CampaignStatsTab } from './stats/CampaignStatsTab';
import { PuzzleStatsTab } from './stats/PuzzleStatsTab';
import { CustomStatsTab } from './stats/CustomStatsTab';

export const StatsModal: Component = () => {
  const store = useGame();
  const [activeTab, setActiveTab] = createSignal<'campaign' | 'puzzle' | 'custom'>('campaign');
  const [confirmReset, setConfirmReset] = createSignal(false);

  return (
    <Show when={store.showStatsModal()}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ChartColumn size={20} />
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-extrabold text-white">Thống Kê Chi Tiết</h2>
                <p class="text-xs text-slate-400">Phân tách thành tích riêng cho từng chế độ</p>
              </div>
            </div>

            <button
              onClick={() => {
                store.setShowStatsModal(false);
                setConfirmReset(false);
              }}
              class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div class="grid grid-cols-3 gap-1 p-2 bg-slate-950 border-b border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('campaign')}
              class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab() === 'campaign'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy size={14} class="text-indigo-400" />
              <span class="truncate">Chiến Dịch</span>
            </button>

            <button
              onClick={() => setActiveTab('puzzle')}
              class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab() === 'puzzle'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Puzzle size={14} class="text-emerald-400" />
              <span class="truncate">Giải Đố</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab() === 'custom'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords size={14} class="text-amber-400" />
              <span class="truncate">Đấu Tùy Chọn</span>
            </button>
          </div>

          {/* Body */}
          <div class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Lời thoại của Bot */}
            <ModalBotTaunt />

            {/* TAB 1: THỐNG KÊ CHIẾN DỊCH (CAMPAIGN) */}
            <Show when={activeTab() === 'campaign'}>
              <CampaignStatsTab />
            </Show>

            {/* TAB 2: THỐNG KÊ GIẢI ĐỐ SÁT CỤC (PUZZLE) */}
            <Show when={activeTab() === 'puzzle'}>
              <PuzzleStatsTab />
            </Show>

            {/* TAB 3: THỐNG KÊ ĐẤU TÙY CHỌN (CUSTOM) */}
            <Show when={activeTab() === 'custom'}>
              <CustomStatsTab />
            </Show>

            {/* Danger Zone: Reset Stats */}
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Show
                when={confirmReset()}
                fallback={
                  <button
                    onClick={() => setConfirmReset(true)}
                    class="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Đặt lại dữ liệu thống kê</span>
                  </button>
                }
              >
                <div class="flex items-center space-x-2 w-full justify-between">
                  <span class="text-xs text-rose-400 font-bold">Xác nhận xóa hết dữ liệu?</span>
                  <div class="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        store.resetAllStats();
                        setConfirmReset(false);
                      }}
                      class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                    >
                      Xóa ngay
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      class="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
