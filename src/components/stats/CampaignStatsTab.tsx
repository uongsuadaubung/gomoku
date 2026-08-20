import { type Component } from 'solid-js';
import { Trophy } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { StatHeroCard } from './StatHeroCard';
import { WinLossStatGrid } from './WinLossStatGrid';
import { StreakStatsGrid } from './StreakStatsGrid';

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
      <StatHeroCard
        title="Tỷ Lệ Thắng Chiến Dịch"
        value={`${campaignWinRate()}%`}
        subtext={`(Thắng ${campaignStats().wins} / ${campaignStats().totalGames} trận)`}
        theme="indigo"
        icon={<Trophy size={28} />}
      />

      {/* Wins, Losses, Draws */}
      <WinLossStatGrid
        wins={campaignStats().wins}
        losses={campaignStats().losses}
        draws={campaignStats().draws}
      />

      {/* Streaks */}
      <StreakStatsGrid
        currentStreak={campaignStats().currentStreak}
        bestStreak={campaignStats().bestStreak}
      />
    </div>
  );
};
