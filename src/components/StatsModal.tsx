import { type Component, Show, createSignal } from 'solid-js';
import {
  ChartColumn,
  RotateCcw,
  Trophy,
  Puzzle,
  Swords,
  Zap,
  GraduationCap,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { CampaignStatsTab } from './stats/CampaignStatsTab';
import { BlitzStatsTab } from './stats/BlitzStatsTab';
import { PuzzleStatsTab } from './stats/PuzzleStatsTab';
import { CustomStatsTab } from './stats/CustomStatsTab';
import { TutorStatsTab } from './stats/TutorStatsTab';
import { BaseModal } from './BaseModal';

export const StatsModal: Component = () => {
  const store = useGame();
  const [activeTab, setActiveTab] = createSignal<'campaign' | 'blitz' | 'puzzle' | 'custom' | 'tutor'>('campaign');
  const [confirmReset, setConfirmReset] = createSignal(false);

  const handleClose = () => {
    store.setShowStatsModal(false);
    setConfirmReset(false);
  };

  return (
    <BaseModal
      isOpen={store.showStatsModal()}
      onClose={handleClose}
      title="Thống Kê Chi Tiết"
      subtitle="Phân tách thành tích riêng cho từng chế độ"
      icon={<ChartColumn size={20} />}
      iconColorClass="bg-amber-500/20 text-amber-400 border-amber-500/30"
      maxWidth="max-w-lg"
    >
      {/* Mode Tabs */}
      <div class="grid grid-cols-5 gap-1 p-2 bg-slate-950 border border-slate-800/80 rounded-2xl text-[11px] -mt-1">
        <button
          type="button"
          onClick={() => setActiveTab('campaign')}
          class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab() === 'campaign'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy size={12} class="text-indigo-400 shrink-0" />
          <span class="truncate">Chiến Dịch</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tutor')}
          class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab() === 'tutor'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap size={12} class="text-amber-400 shrink-0" />
          <span class="truncate">Gia Sư</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blitz')}
          class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab() === 'blitz'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={12} class="text-rose-400 shrink-0" />
          <span class="truncate">Cờ Chớp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('puzzle')}
          class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab() === 'puzzle'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Puzzle size={12} class="text-emerald-400 shrink-0" />
          <span class="truncate">Giải Đố</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          class={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab() === 'custom'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords size={12} class="text-amber-400 shrink-0" />
          <span class="truncate">Đấu Tập</span>
        </button>
      </div>

      {/* TAB 1: THỐNG KÊ CHIẾN DỊCH (CAMPAIGN) */}
      <Show when={activeTab() === 'campaign'}>
        <CampaignStatsTab />
      </Show>

      {/* TAB 2: THỐNG KÊ HỌC VIỆN GIA SƯ (TUTOR) */}
      <Show when={activeTab() === 'tutor'}>
        <TutorStatsTab />
      </Show>

      {/* TAB 3: THỐNG KÊ CỜ CHỚP SINH TỬ (BLITZ) */}
      <Show when={activeTab() === 'blitz'}>
        <BlitzStatsTab />
      </Show>

      {/* TAB 4: THỐNG KÊ GIẢI ĐỐ SÁT CỤC (PUZZLE) */}
      <Show when={activeTab() === 'puzzle'}>
        <PuzzleStatsTab />
      </Show>

      {/* TAB 5: THỐNG KÊ ĐẤU TÙY CHỌN (CUSTOM) */}
      <Show when={activeTab() === 'custom'}>
        <CustomStatsTab />
      </Show>

      {/* Danger Zone: Reset Stats */}
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
        <Show
          when={confirmReset()}
          fallback={
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              class="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
                type="button"
                onClick={() => {
                  store.resetAllStats();
                  setConfirmReset(false);
                }}
                class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Xóa ngay
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                class="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </Show>
      </div>
    </BaseModal>
  );
};
