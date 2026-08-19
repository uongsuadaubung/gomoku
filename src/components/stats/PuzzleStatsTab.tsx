import { type Component, For } from 'solid-js';
import { Puzzle, CircleCheck, Flame, Sparkles } from 'lucide-solid';
import { useGame } from '../../store/GameContext';

export const PuzzleStatsTab: Component = () => {
  const store = useGame();
  const stats = () => store.stats();

  const puzzleStats = () => stats().puzzle || {
    currentLevel: 1,
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

  return (
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

      {/* Solved vs Streaks */}
      <div class="grid grid-cols-2 gap-2">
        <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
          <span class="text-[11px] text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
            <CircleCheck size={12} /> Đã giải đúng
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

      {/* Thống kê chi tiết theo sao (1-7 ⭐) */}
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
  );
};
