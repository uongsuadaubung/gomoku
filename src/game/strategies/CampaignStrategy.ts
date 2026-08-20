import { BaseStrategy } from './BaseStrategy';
import { BotLevelContext, GameOverWinContext } from './types';
import { GameMode, LevelConfig, UserStats } from '../types';
import { getLevelConfigByWins } from '../constants';

export class CampaignStrategy extends BaseStrategy {
  public readonly mode: GameMode = 'campaign';

  public getBotLevel(ctx: BotLevelContext | UserStats): LevelConfig {
    const stats = 'stats' in ctx ? ctx.stats : ctx;
    const campaignWins = stats.campaign?.wins ?? stats.wins;
    return getLevelConfigByWins(campaignWins, stats.manualLevel);
  }

  public canUndo(): boolean {
    return true; // Cho phép đi lại trong chiến dịch
  }

  public override onPlayerWin(ctx: GameOverWinContext): void {
    super.onPlayerWin(ctx);

    const newLevel = getLevelConfigByWins(ctx.newStats.wins, ctx.newStats.manualLevel);
    if (newLevel.id > ctx.oldLevel && ctx.newStats.manualLevel === null) {
      ctx.services.setSafeTimeout?.(() => {
        ctx.services.playLevelUpSound?.();
        ctx.services.setShowLevelUpAlert?.(newLevel);
        ctx.services.triggerTaunt?.('LEVEL_UP_ALERT', 400);
      }, 800);
    }
  }

  public recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw'
  ): UserStats {
    if (!stats.campaign) {
      stats.campaign = {
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        draws: stats.draws || 0,
        currentStreak: stats.currentStreak || 0,
        bestStreak: stats.bestStreak || 0,
        totalGames: stats.totalGames || 0,
      };
    }

    stats.campaign.totalGames++;

    if (result === 'win') {
      stats.campaign.wins++;
      stats.campaign.currentStreak++;
      if (stats.campaign.currentStreak > stats.campaign.bestStreak) {
        stats.campaign.bestStreak = stats.campaign.currentStreak;
      }
    } else if (result === 'loss') {
      stats.campaign.losses++;
      stats.campaign.currentStreak = 0;
    } else {
      stats.campaign.draws++;
    }

    // Đồng bộ thuộc tính cấp cao cho bảng xếp hạng Chiến Dịch
    stats.wins = stats.campaign.wins;
    stats.losses = stats.campaign.losses;
    stats.draws = stats.campaign.draws;
    stats.currentStreak = stats.campaign.currentStreak;
    stats.bestStreak = stats.campaign.bestStreak;
    stats.totalGames = stats.campaign.totalGames;

    return stats;
  }
}
