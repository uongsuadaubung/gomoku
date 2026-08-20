import { type Component } from 'solid-js';
import { Zap, Flame, Clock, Trophy } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';
import { BotAvatar } from '../BotAvatar';

export const BlitzStatsTab: Component = () => {
  const store = useGame();
  const blitzStats = () => store.stats().blitz || {
    currentLevel: 1,
    highestLevel: 1,
    totalWins: 0,
    totalLosses: 0,
    timeoutLosses: 0,
    bestStreak: 0,
    currentStreak: 0,
    totalGames: 0,
    selectedTimeSeconds: 10,
  };

  const highestLevelId = () => blitzStats().highestLevel || 1;
  const highestBot = () => AI_LEVELS.find(l => l.id === highestLevelId()) || AI_LEVELS[0];

  const blitzWinRate = () => {
    const b = blitzStats();
    if (b.totalGames === 0) return 0;
    return Math.round((b.totalWins / b.totalGames) * 100);
  };

  return (
    <div class="space-y-4 animate-fade-in">
      {/* Hero Card */}
      <div class="p-4 rounded-2xl bg-gradient-to-br from-rose-950/60 to-slate-900 border border-rose-500/30 flex items-center justify-between">
        <div>
          <span class="text-xs text-rose-300 font-semibold block mb-1">
            Kỷ Lục Cấp Cao Nhất Chinh Phục
          </span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              Cấp {highestLevelId()}
            </span>
            <span class="text-xs text-slate-300 font-bold flex items-center gap-1">
              <span>({highestBot().vietnameseName}</span>
              <BotAvatar name={highestBot().avatar} />
              <span>)</span>
            </span>
          </div>
          <div class="text-[11px] text-slate-400 mt-1">
            Tỷ lệ thắng: <strong class="text-rose-300">{blitzWinRate()}%</strong> ({blitzStats().totalWins}/{blitzStats().totalGames} ván)
          </div>
        </div>
        <div class="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <Zap size={28} />
        </div>
      </div>

      {/* Wins, Losses, Timeout Losses */}
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span class="text-[11px] text-emerald-400 font-semibold block mb-0.5">Thắng</span>
          <span class="text-base font-black text-emerald-400 font-mono">{blitzStats().totalWins}</span>
        </div>
        <div class="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <span class="text-[11px] text-rose-400 font-semibold block mb-0.5">Thua Cờ</span>
          <span class="text-base font-black text-rose-400 font-mono">
            {Math.max(0, blitzStats().totalLosses - (blitzStats().timeoutLosses || 0))}
          </span>
        </div>
        <div class="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span class="text-[11px] text-amber-400 font-semibold block mb-0.5 flex items-center justify-center gap-1">
            <Clock size={11} /> Cháy Giờ
          </span>
          <span class="text-base font-black text-amber-400 font-mono">
            {blitzStats().timeoutLosses || 0}
          </span>
        </div>
      </div>

      {/* Streaks */}
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
          <div class="p-2 rounded-xl bg-orange-500/15 text-orange-400">
            <Flame size={18} />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 block font-medium">Chuỗi thắng hiện tại</span>
            <span class="text-base font-black text-orange-400 font-mono">
              {blitzStats().currentStreak} ván
            </span>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
          <div class="p-2 rounded-xl bg-amber-500/15 text-amber-400">
            <Trophy size={18} />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 block font-medium">Chuỗi thắng dài nhất</span>
            <span class="text-base font-black text-amber-400 font-mono">
              {blitzStats().bestStreak} ván
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
