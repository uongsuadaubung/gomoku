import { GameModeStrategy } from './types';
import { GameMode, LevelConfig, UserStats } from '../types';
import { AI_LEVELS } from '../constants';

export class BlitzStrategy implements GameModeStrategy {
  public readonly mode: GameMode = 'blitz';

  public getBotLevel(stats: UserStats): LevelConfig {
    const currentLvlId = stats.blitz?.currentLevel || 1;
    const bot = AI_LEVELS.find(l => l.id === currentLvlId);
    return bot || AI_LEVELS[0];
  }

  public canUndo(): boolean {
    // Chế độ Cờ Chớp cấm tuyệt đối đi lại (Undo) để thử thách phản xạ
    return false;
  }

  public recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw',
    extra?: { isTimeout?: boolean; timeSeconds?: 5 | 10 | 15 }
  ): UserStats {
    if (!stats.blitz) {
      stats.blitz = {
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
    }

    if (extra?.timeSeconds) {
      stats.blitz.selectedTimeSeconds = extra.timeSeconds;
    }

    stats.blitz.totalGames++;

    if (result === 'win') {
      stats.blitz.totalWins++;
      stats.blitz.currentStreak++;
      if (stats.blitz.currentStreak > stats.blitz.bestStreak) {
        stats.blitz.bestStreak = stats.blitz.currentStreak;
      }
      // Ghi nhận kỷ lục cấp cao nhất đã chinh phục
      stats.blitz.highestLevel = Math.max(
        stats.blitz.highestLevel || 1,
        stats.blitz.currentLevel || 1
      );
      // Thăng cấp Bot tiếp theo (tối đa Level 12)
      stats.blitz.currentLevel = Math.min(12, (stats.blitz.currentLevel || 1) + 1);
    } else if (result === 'loss') {
      stats.blitz.totalLosses++;
      if (extra?.isTimeout) {
        stats.blitz.timeoutLosses = (stats.blitz.timeoutLosses || 0) + 1;
      }
      stats.blitz.currentStreak = 0;
      // Chuỗi sinh tử kết thúc: Reset về Level 1
      stats.blitz.currentLevel = 1;
    }

    return stats;
  }
}
