import { GameModeStrategy } from './types';
import { GameMode, LevelConfig, UserStats, CustomGameConfig } from '../types';
import { AI_LEVELS } from '../constants';

export class CustomStrategy implements GameModeStrategy {
  public readonly mode: GameMode = 'custom';

  public getBotLevel(_stats: UserStats, customConfig?: CustomGameConfig): LevelConfig {
    const lvl = customConfig?.botLevel || 3;
    const clampedIndex = Math.max(0, Math.min(AI_LEVELS.length - 1, lvl - 1));
    return AI_LEVELS[clampedIndex];
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
