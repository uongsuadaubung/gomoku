import { BaseStrategy } from './BaseStrategy';
import {
  BotLevelContext,
  GameOverPresentationContext,
  GameStartContext,
  PlayerTurnStartContext,
  PlayerMoveContext,
} from './types';
import { GameMode, LevelConfig, UserStats, BLACK } from '../types';
import { AI_LEVELS } from '../constants';

export class BlitzStrategy extends BaseStrategy {
  public readonly mode: GameMode = 'blitz';

  public getBotLevel(ctx: BotLevelContext | UserStats): LevelConfig {
    const stats = 'stats' in ctx ? ctx.stats : ctx;
    const currentLvlId = stats.blitz?.currentLevel || 1;
    const bot = AI_LEVELS.find(l => l.id === currentLvlId);
    return bot || AI_LEVELS[0];
  }

  public override getCurrentStreak(stats: UserStats): number {
    return stats.blitz?.currentStreak ?? 0;
  }

  public override getGameOverTitle(ctx: GameOverPresentationContext): { text: string; color: string } {
    if (ctx.won) return { text: 'Vượt Cấp Cờ Chớp! ⚡🎉', color: 'text-rose-400' };
    if (ctx.isBlitzTimeout) return { text: 'Cháy Giờ (Timeout)! ⏱️💥', color: 'text-rose-400' };
    return { text: 'Thất Bại Cờ Chớp! 💥', color: 'text-rose-400' };
  }

  public override getGameOverDescription(ctx: GameOverPresentationContext): string {
    if (ctx.won) return `Chúc mừng bạn đã đánh bại Bot ${ctx.botConfig.vietnameseName}! Tiến lên cấp tiếp theo!`;
    if (ctx.isBlitzTimeout) return `Bạn đã hết ${ctx.blitzTimeLimit || 10}s suy nghĩ! Chuỗi cờ chớp đã dừng lại.`;
    return `Bot ${ctx.botConfig.vietnameseName} đã chiến thắng! Chuỗi sinh tử kết thúc.`;
  }

  public override getModeSummary(ctx: GameOverPresentationContext): string {
    return `Cờ Chớp (${ctx.blitzTimeLimit || 10}s - Cấp ${ctx.botConfig.id})`;
  }

  public canUndo(): boolean {
    // Chế độ Cờ Chớp cấm tuyệt đối đi lại (Undo) để thử thách phản xạ
    return false;
  }

  public override onGameStart(ctx: GameStartContext): void {
    super.onGameStart(ctx);
    if (ctx.playerColor === BLACK) {
      ctx.services.startBlitzTimer?.();
    }
  }

  public override onPlayerTurnStart(ctx: PlayerTurnStartContext): void {
    ctx.services.startBlitzTimer?.();
  }

  public override onPlayerMove(ctx: PlayerMoveContext): void {
    ctx.services.stopBlitzTimer?.();
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
