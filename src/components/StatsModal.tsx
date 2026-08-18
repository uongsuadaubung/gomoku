import { type Component, Show, createSignal } from 'solid-js';
import {
  X,
  BarChart3,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Equal,
} from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import { ModalBotTaunt } from './ModalBotTaunt';

interface StatsModalProps {
  store: GameStore;
}

export const StatsModal: Component<StatsModalProps> = props => {
  const { store } = props;
  const [confirmReset, setConfirmReset] = createSignal(false);

  const stats = () => store.stats();
  const winRate = () => {
    if (stats().totalGames === 0) return 0;
    return Math.round((stats().wins / stats().totalGames) * 100);
  };

  return (
    <Show when={store.showStatsModal()}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BarChart3 size={22} />
              </div>
              <div>
                <h2 class="text-lg font-extrabold text-white">Thống Kê Ván Đấu</h2>
                <p class="text-xs text-slate-400">Lịch sử và thành tích thi đấu của bạn</p>
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

          {/* Body */}
          <div class="p-5 space-y-5">
            {/* Lời thoại của Bot */}
            <ModalBotTaunt store={store} />
            {/* Primary Win Rate Hero Card */}
            <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-400 font-semibold block mb-1">Tỷ Lệ Chiến Thắng</span>
                <div class="flex items-baseline space-x-2">
                  <span class="text-3xl font-black text-amber-400 font-mono">{winRate()}%</span>
                  <span class="text-xs text-slate-400 font-medium">({stats().wins} / {stats().totalGames} ván)</span>
                </div>
              </div>
              <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <BarChart3 size={32} class="text-amber-400" />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div class="grid grid-cols-3 gap-2.5">
              {/* Thắng */}
              <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                <span class="text-[11px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Thắng
                </span>
                <span class="text-xl font-black text-emerald-400 font-mono">{stats().wins}</span>
              </div>

              {/* Thua */}
              <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center">
                <span class="text-[11px] text-rose-400 font-semibold mb-1 flex items-center gap-1">
                  <XCircle size={12} /> Thua
                </span>
                <span class="text-xl font-black text-rose-400 font-mono">{stats().losses}</span>
              </div>

              {/* Hòa */}
              <div class="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex flex-col items-center justify-center">
                <span class="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Equal size={12} /> Hòa
                </span>
                <span class="text-xl font-black text-slate-300 font-mono">{stats().draws}</span>
              </div>
            </div>

            {/* Streak Metrics */}
            <div class="grid grid-cols-2 gap-2.5">
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center">
                <span class="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Flame size={12} class="text-amber-400" /> Chuỗi thắng hiện tại
                </span>
                <span class="text-lg font-black text-white font-mono">{stats().currentStreak} ván</span>
              </div>

              <div class="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center">
                <span class="text-[11px] text-orange-400 font-semibold mb-1 flex items-center gap-1">
                  <Flame size={12} class="text-orange-400" /> Chuỗi thắng kỷ lục
                </span>
                <span class="text-lg font-black text-orange-400 font-mono">{stats().bestStreak} ván</span>
              </div>
            </div>

            {/* Danger Zone: Reset Stats */}
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
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
