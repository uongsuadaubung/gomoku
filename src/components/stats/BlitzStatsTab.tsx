import { type Component } from 'solid-js';
import { Zap, Clock } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { AI_LEVELS } from '../../game/constants';
import { BotAvatar } from '../BotAvatar';
import { StatHeroCard } from './StatHeroCard';
import { WinLossStatGrid } from './WinLossStatGrid';
import { StreakStatsGrid } from './StreakStatsGrid';

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
      <StatHeroCard
        title="Kỷ Lục Cấp Cao Nhất Chinh Phục"
        theme="rose"
        icon={<Zap size={28} />}
        customValueElement={
          <div>
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
        }
      />

      {/* Wins, Losses, Timeout Losses */}
      <WinLossStatGrid
        wins={blitzStats().totalWins}
        losses={Math.max(0, blitzStats().totalLosses - (blitzStats().timeoutLosses || 0))}
        lossLabel="Thua Cờ"
        thirdColLabel="Cháy Giờ"
        thirdColValue={blitzStats().timeoutLosses || 0}
        thirdColColor="amber"
        thirdColIcon={<Clock size={11} />}
      />

      {/* Streaks */}
      <StreakStatsGrid
        currentStreak={blitzStats().currentStreak}
        bestStreak={blitzStats().bestStreak}
        variant="cards"
      />
    </div>
  );
};
