import { BaseStrategy } from './BaseStrategy';
import { BotLevelContext, SeriesPlayerSideContext, GameOverPresentationContext } from './types';
import { GameMode, LevelConfig, UserStats, BLACK } from '../types';
import { AI_LEVELS } from '../constants';

export class CustomStrategy extends BaseStrategy {
  public readonly mode: GameMode = 'custom';

  public getBotLevel(ctx: BotLevelContext | UserStats, customConfig?: { botLevel?: number }): LevelConfig {
    const config = 'customConfig' in ctx ? ctx.customConfig : customConfig;
    const lvl = config?.botLevel || 3;
    const clampedIndex = Math.max(0, Math.min(AI_LEVELS.length - 1, lvl - 1));
    return AI_LEVELS[clampedIndex];
  }

  public override getNextSeriesPlayerSide(ctx: SeriesPlayerSideContext): boolean {
    // Trong Đấu Tập tùy chỉnh: Giữ nguyên màu quân đã cấu hình
    return ctx.customConfig?.playerColor === BLACK;
  }

  public override getCurrentStreak(stats: UserStats): number {
    return stats.custom?.currentStreak ?? 0;
  }

  public override getModeSummary(ctx: GameOverPresentationContext): string {
    return `Đấu Tập (Bot ${ctx.botConfig.vietnameseName})`;
  }

  public canUndo(): boolean {
    return true; // Cho phép đi lại khi đấu tập
  }

  public recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw',
    extra?: { botLevel?: number }
  ): UserStats {
    if (!stats.custom) {
      stats.custom = {
        wins: 0,
        losses: 0,
        draws: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalGames: 0,
        byBotLevel: {},
      };
    }

    stats.custom.totalGames++;

    if (result === 'win') {
      stats.custom.wins++;
      stats.custom.currentStreak++;
      if (stats.custom.currentStreak > stats.custom.bestStreak) {
        stats.custom.bestStreak = stats.custom.currentStreak;
      }
    } else if (result === 'loss') {
      stats.custom.losses++;
      stats.custom.currentStreak = 0;
    } else {
      stats.custom.draws++;
    }

    if (extra?.botLevel) {
      const lvl = extra.botLevel;
      if (!stats.custom.byBotLevel[lvl]) {
        stats.custom.byBotLevel[lvl] = { wins: 0, losses: 0, draws: 0 };
      }
      if (result === 'win') stats.custom.byBotLevel[lvl].wins++;
      else if (result === 'loss') stats.custom.byBotLevel[lvl].losses++;
      else stats.custom.byBotLevel[lvl].draws++;
    }

    return stats;
  }
}
