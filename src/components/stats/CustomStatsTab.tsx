import { type Component, For, Show } from 'solid-js';
import { Swords, CircleCheck, CircleX, Equal, Award } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';

export const CustomStatsTab: Component = () => {
  const store = useGame();
  const stats = () => store.stats();

  const customStats = () => stats().custom || {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    byBotLevel: {},
  };

  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;
  const isBotUnlocked = (lvlId: number) => {
    const lvl = AI_LEVELS.find(l => l.id === lvlId);
    return lvl ? campaignWins() >= lvl.minWins : false;
  };

  const customWinRate = () => {
    const cu = customStats();
    if (cu.totalGames === 0) return 0;
    return Math.round((cu.wins / cu.totalGames) * 100);
  };

  return (
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
            <CircleCheck size={12} /> Thắng
          </span>
          <span class="text-lg font-black text-emerald-400 font-mono">
            {customStats().wins}
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center">
          <span class="text-[11px] text-rose-400 font-semibold mb-0.5 flex items-center gap-1">
            <CircleX size={12} /> Thua
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
  );
};
