import { type Component, For } from 'solid-js';
import { Award, GraduationCap } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';
import { StatHeroCard } from './StatHeroCard';
import { StreakStatsGrid } from './StreakStatsGrid';

export const TutorStatsTab: Component = () => {
  const store = useGame();
  const stats = () => store.stats();

  const tutorStats = () => stats().tutor || {
    currentLevel: 1,
    highestLevel: 1,
    totalWins: 0,
    totalLosses: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    byBotLevel: {},
  };

  const tutorWinRate = () => {
    const t = tutorStats();
    if (t.totalGames === 0) return 0;
    return Math.round((t.totalWins / t.totalGames) * 100);
  };

  const highestBot = () => {
    const lvl = tutorStats().highestLevel || 1;
    return AI_LEVELS.find(l => l.id === lvl) || AI_LEVELS[0];
  };

  return (
    <div class="space-y-4 animate-fade-in">
      {/* Hero Card */}
      <StatHeroCard
        title="Học Viện Gomo (Gomo Academy)"
        theme="amber"
        icon={<GraduationCap size={28} />}
        customValueElement={
          <div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl font-black text-amber-400 font-mono">
                {tutorWinRate()}%
              </span>
              <span class="text-xs text-slate-400 font-medium">
                (Thắng {tutorStats().totalWins} / {tutorStats().totalGames} trận)
              </span>
            </div>
            <div class="mt-2 text-xs font-bold text-amber-200/90 flex items-center gap-1.5">
              <Award size={14} class="text-amber-400" />
              <span>Kỷ lục cao nhất: Cấp {tutorStats().highestLevel} - {highestBot().vietnameseName}</span>
            </div>
          </div>
        }
      />

      {/* Wins, Losses */}
      <div class="grid grid-cols-2 gap-2 text-center">
        <div class="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span class="text-[11px] text-emerald-400 font-semibold block mb-0.5">Tổng Thắng</span>
          <span class="text-base font-black text-emerald-400 font-mono">{tutorStats().totalWins}</span>
        </div>
        <div class="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <span class="text-[11px] text-rose-400 font-semibold block mb-0.5">Tổng Thua</span>
          <span class="text-base font-black text-rose-400 font-mono">{tutorStats().totalLosses}</span>
        </div>
      </div>

      {/* Streaks */}
      <StreakStatsGrid
        currentStreak={tutorStats().currentStreak}
        bestStreak={tutorStats().bestStreak}
      />

      {/* Breakdown per Bot Level */}
      <div class="space-y-1.5">
        <span class="text-xs font-bold text-slate-400 block mb-1">
          Chi tiết thành tích theo cấp đối thủ:
        </span>
        <div class="max-h-44 overflow-y-auto space-y-1.5 pr-1">
          <For each={AI_LEVELS}>
            {bot => {
              const record = tutorStats().byBotLevel?.[bot.id] || { wins: 0, losses: 0, draws: 0 };
              const total = record.wins + record.losses + record.draws;
              const winRate = total > 0 ? Math.round((record.wins / total) * 100) : 0;
              const isUnlocked = bot.id <= (tutorStats().highestLevel || 1);

              return (
                <div class={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isUnlocked ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}>
                  <div class="flex items-center gap-2">
                    <span class={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${bot.badgeBg}`}>
                      {bot.id}
                    </span>
                    <span class="font-bold text-slate-200">{bot.vietnameseName}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-slate-400 font-mono text-[11px]">
                      {record.wins}T - {record.losses}B
                    </span>
                    <span class={`font-mono font-bold text-[11px] ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {total > 0 ? `${winRate}%` : '--'}
                    </span>
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
