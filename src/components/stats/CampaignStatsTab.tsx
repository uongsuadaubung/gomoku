import { type Component } from 'solid-js';
import { Trophy, Flame } from 'lucide-solid';
import { useGame } from '../../store/GameContext';

export const CampaignStatsTab: Component = () => {
  const store = useGame();
  const stats = () => store.stats();

  const campaignStats = () => stats().campaign || {
    wins: stats().wins,
    losses: stats().losses,
    draws: stats().draws,
    currentStreak: stats().currentStreak,
    bestStreak: stats().bestStreak,
    totalGames: stats().totalGames,
  };

  const campaignWinRate = () => {
    const c = campaignStats();
    if (c.totalGames === 0) return 0;
    return Math.round((c.wins / c.totalGames) * 100);
  };

  return (
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

      {/* Wins, Losses, Draws */}
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

      {/* Streaks */}
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
  );
};
