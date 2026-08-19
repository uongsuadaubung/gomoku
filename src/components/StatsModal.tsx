import { type Component, Show, createSignal, For } from 'solid-js';
import {
  X,
  BarChart3,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Equal,
  Trophy,
  Puzzle,
  Swords,
  Sparkles,
  Award,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { ModalBotTaunt } from './ModalBotTaunt';

export const StatsModal: Component = () => {
  const store = useGame();
  const [activeTab, setActiveTab] = createSignal<'campaign' | 'puzzle' | 'custom'>('campaign');
  const [confirmReset, setConfirmReset] = createSignal(false);

  const stats = () => store.stats();

  // 1. Thống kê Chiến Dịch
  const campaignStats = () => stats().campaign || {
    wins: stats().wins,
    losses: stats().losses,
    draws: stats().draws,
    currentStreak: stats().currentStreak,
    bestStreak: stats().bestStreak,
    totalGames: stats().totalGames,
  };
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;
  const isBotUnlocked = (lvlId: number) => {
    const lvl = AI_LEVELS.find(l => l.id === lvlId);
    return lvl ? campaignWins() >= lvl.minWins : false;
  };

  const campaignWinRate = () => {
    const c = campaignStats();
    if (c.totalGames === 0) return 0;
    return Math.round((c.wins / c.totalGames) * 100);
  };

  // 2. Thống kê Thế Cờ
  const puzzleStats = () => stats().puzzle || {
    totalSolved: 0,
    totalFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    solvedByStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
  const puzzleSolveRate = () => {
    const p = puzzleStats();
    if (p.totalGames === 0) return 0;
    return Math.round((p.totalSolved / p.totalGames) * 100);
  };

  // 3. Thống kê Đấu Tùy Chọn
  const customStats = () => stats().custom || {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    byBotLevel: {},
  };
  const customWinRate = () => {
    const cu = customStats();
    if (cu.totalGames === 0) return 0;
    return Math.round((cu.wins / cu.totalGames) * 100);
  };

  return (
    <Show when={store.showStatsModal()}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BarChart3 size={20} />
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
              <div class="space-y-4 animate-fade-in">
                {/* Hero Card */}
                <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span class="text-xs text-indigo-300 font-semibold block mb-1">
                      Tỷ Lệ Thắng Chiến Dịch
                    </span>
                    <div class="flex items-baseline space-x-2">
                      <span class="text-3xl font-black text-indigo-400 font-mono">
                        {campaignWinRate()}%
                      </span>
                      <span class="text-xs text-slate-400 font-medium">
                        (Thắng {campaignStats().wins} / {campaignStats().totalGames} trận)
                      </span>
                    </div>
                  </div>
                  <div class="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <Trophy size={28} />
                  </div>
                </div>

                {/* Wins, Losses, Draws, Streaks */}
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span class="text-[11px] text-emerald-400 font-semibold block mb-0.5">Thắng</span>
                    <span class="text-base font-black text-emerald-400 font-mono">{campaignStats().wins}</span>
                  </div>
                  <div class="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <span class="text-[11px] text-rose-400 font-semibold block mb-0.5">Thua</span>
                    <span class="text-base font-black text-rose-400 font-mono">{campaignStats().losses}</span>
                  </div>
                  <div class="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                    <span class="text-[11px] text-slate-400 font-semibold block mb-0.5">Hòa</span>
                    <span class="text-base font-black text-slate-300 font-mono">{campaignStats().draws}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Flame size={14} class="text-amber-400" /> Chuỗi thắng hiện tại
                    </span>
                    <span class="font-black text-amber-400 font-mono text-sm">
                      {campaignStats().currentStreak}
                    </span>
                  </div>
                  <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Flame size={14} class="text-amber-500" /> Chuỗi thắng dài nhất
                    </span>
                    <span class="font-black text-amber-500 font-mono text-sm">
                      {campaignStats().bestStreak}
                    </span>
                  </div>
                </div>
              </div>
            </Show>

            {/* TAB 2: THỐNG KÊ GIẢI ĐỐ SÁT CỤC (PUZZLE) */}
            <Show when={activeTab() === 'puzzle'}>
              <div class="space-y-4 animate-fade-in">
                {/* Hero Card */}
                <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span class="text-xs text-emerald-300 font-semibold block mb-1">
                      Cấp Độ Sát Cục: Mức {puzzleStats().currentLevel || 1}⭐
                    </span>
                    <div class="flex items-baseline space-x-2">
                      <span class="text-3xl font-black text-emerald-400 font-mono">
                        {puzzleSolveRate()}%
                      </span>
                      <span class="text-xs text-slate-400 font-medium">
                        (Đã giải {puzzleStats().totalSolved} / {puzzleStats().totalGames} câu)
                      </span>
                    </div>
                  </div>
                  <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Puzzle size={28} />
                  </div>
                </div>

                {/* Solved vs Failed vs Streaks */}
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                    <span class="text-[11px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Đã giải đúng
                    </span>
                    <span class="text-lg font-black text-emerald-400 font-mono">
                      {puzzleStats().totalSolved} câu
                    </span>
                  </div>

                  <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center">
                    <span class="text-[11px] text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                      <Flame size={12} class="text-emerald-400" /> Kỷ lục chuỗi đúng
                    </span>
                    <span class="text-lg font-black text-white font-mono">
                      {puzzleStats().bestStreak} câu
                    </span>
                  </div>
                </div>

                {/* Thống kê chi tiết theo sao (1-5 ⭐) */}
                <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span class="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} class="text-emerald-400" />
                    <span>Số câu đã giải theo độ khó:</span>
                  </span>

                  <div class="space-y-1.5 text-xs">
                    <For each={[1, 2, 3, 4, 5, 6, 7]}>
                      {star => {
                        const count = () => puzzleStats().solvedByStars[star] || 0;
                        return (
                          <div class="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <span class="text-amber-400 font-medium">
                              {star <= 5 ? '⭐'.repeat(star) : `⭐x${star}`} (Mức {star}⭐)
                            </span>
                            <span class="font-extrabold text-white font-mono">{count()} câu</span>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
            </Show>

            {/* TAB 3: THỐNG KÊ ĐẤU TÙY CHỌN (CUSTOM) */}
            <Show when={activeTab() === 'custom'}>
              <div class="space-y-4 animate-fade-in">
                {/* Hero Card */}
                <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span class="text-xs text-amber-300 font-semibold block mb-1">
                      Tỷ Lệ Thắng Đấu Tập
                    </span>
                    <div class="flex items-baseline space-x-2">
                      <span class="text-3xl font-black text-amber-400 font-mono">
                        {customWinRate()}%
                      </span>
                      <span class="text-xs text-slate-400 font-medium">
                        ({customStats().wins} / {customStats().totalGames} ván)
                      </span>
                    </div>
                  </div>
                  <div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Swords size={28} />
                  </div>
                </div>

                {/* Metrics */}
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                    <span class="text-[11px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Thắng
                    </span>
                    <span class="text-lg font-black text-emerald-400 font-mono">
                      {customStats().wins}
                    </span>
                  </div>

                  <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center">
                    <span class="text-[11px] text-rose-400 font-semibold mb-0.5 flex items-center gap-1">
                      <XCircle size={12} /> Thua
                    </span>
                    <span class="text-lg font-black text-rose-400 font-mono">
                      {customStats().losses}
                    </span>
                  </div>

                  <div class="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex flex-col items-center justify-center">
                    <span class="text-[11px] text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                      <Equal size={12} /> Hòa
                    </span>
                    <span class="text-lg font-black text-slate-300 font-mono">
                      {customStats().draws}
                    </span>
                  </div>
                </div>

                {/* Đối Đầu Theo Từng Level Bot */}
                <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span class="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Award size={13} class="text-amber-400" />
                    <span>Lịch sử đấu với từng cấp độ Bot:</span>
                  </span>

                  <div class="space-y-1 text-xs">
                    <For each={AI_LEVELS}>
                      {lvl => {
                        const unlocked = () => isBotUnlocked(lvl.id);
                        const rec = () => customStats().byBotLevel[lvl.id] || { wins: 0, losses: 0, draws: 0 };
                        const total = () => rec().wins + rec().losses + rec().draws;
                        return (
                          <div class={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-all ${
                            unlocked()
                              ? 'bg-slate-900/60 border-slate-800/60'
                              : 'bg-slate-950/40 border-slate-900/50 opacity-60'
                          }`}>
                            <div class="flex items-center gap-1.5">
                              <span>{unlocked() ? lvl.avatar : '🔒'}</span>
                              <span class={`font-bold ${unlocked() ? 'text-slate-200' : 'text-slate-500'}`}>
                                {unlocked() ? `Bot ${lvl.vietnameseName}` : 'Đối Thủ Bí Ẩn'}
                              </span>
                            </div>
                            <div class="flex items-center gap-2 font-mono font-bold text-[11px]">
                              <Show
                                when={unlocked()}
                                fallback={<span class="text-slate-600 font-medium italic text-[10px]">Chưa mở khóa</span>}
                              >
                                <span class="text-emerald-400">{rec().wins}W</span>
                                <span class="text-rose-400">{rec().losses}L</span>
                                <span class="text-slate-400">({total()} ván)</span>
                              </Show>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>
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
