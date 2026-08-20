import { type Component, For, Show } from 'solid-js';
import { Swords, Award } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';
import { BotAvatar } from '../BotAvatar';
import { StatHeroCard } from './StatHeroCard';
import { WinLossStatGrid } from './WinLossStatGrid';

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
      <StatHeroCard
        title="Tỷ Lệ Thắng Đấu Tập"
        value={`${customWinRate()}%`}
        subtext={`(${customStats().wins} / ${customStats().totalGames} ván)`}
        theme="amber"
        icon={<Swords size={28} />}
      />

      {/* Metrics */}
      <WinLossStatGrid
        wins={customStats().wins}
        losses={customStats().losses}
        draws={customStats().draws}
      />

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
                    {unlocked() ? <BotAvatar name={lvl.avatar} /> : <span>🔒</span>}
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
