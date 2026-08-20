import { type Component, For } from 'solid-js';
import { Award, Flame, GraduationCap, Trophy } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';

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
      <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 flex items-center justify-between">
        <div>
          <span class="text-xs text-amber-300 font-semibold block mb-1">
            Học Viện Gomo (Gomo Academy)
          </span>
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
        <div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <GraduationCap size={28} />
        </div>
      </div>

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
      <div class="grid grid-cols-2 gap-2">
        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Flame size={14} class="text-amber-400" /> Chuỗi thắng hiện tại
          </span>
          <span class="font-black text-amber-400 font-mono text-sm">
            {tutorStats().currentStreak}
          </span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Flame size={14} class="text-amber-500" /> Chuỗi thắng dài nhất
          </span>
          <span class="font-black text-amber-500 font-mono text-sm">
            {tutorStats().bestStreak}
          </span>
        </div>
      </div>

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
