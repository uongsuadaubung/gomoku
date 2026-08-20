import { BaseStrategy } from './BaseStrategy';
import {
  BotLevelContext,
  GameOverPresentationContext,
  GameStartContext,
  PlayerTurnStartContext,
  PlayerMoveContext,
  UndoContext,
  ResignContext,
  GameOverWinContext,
  GameOverLossContext,
  GameOverDrawContext,
} from './types';
import { GameMode, LevelConfig, UserStats } from '../types';
import { AI_LEVELS } from '../constants';

export class TutorStrategy extends BaseStrategy {
  public readonly mode: GameMode = 'tutor';

  public getBotLevel(ctx: BotLevelContext | UserStats, customConfig?: { botLevel?: number }): LevelConfig {
    const stats = 'stats' in ctx ? ctx.stats : ctx;
    const tutorLvl = 'tutorLevel' in ctx ? ctx.tutorLevel : customConfig?.botLevel;
    const currentLvlId = tutorLvl || stats.tutor?.currentLevel || 1;
    const bot = AI_LEVELS.find(l => l.id === currentLvlId);
    return bot || AI_LEVELS[0];
  }

  public override getCurrentStreak(stats: UserStats): number {
    return stats.tutor?.currentStreak ?? 0;
  }

  public override getGameOverTitle(ctx: GameOverPresentationContext): { text: string; color: string } {
    if (ctx.won) return { text: 'Thắng Trận Học Viện Gomo! 🎓🎉', color: 'text-amber-400' };
    if (ctx.draw) return { text: 'Trận Đấu Hòa Cờ! 🤝', color: 'text-slate-200' };
    if (ctx.lastResigned) return { text: 'Bạn Đã Nhận Thua 🏳️', color: 'text-rose-400' };
    return { text: 'Đối Thủ Chiến Thắng! 💥', color: 'text-rose-400' };
  }

  public override getGameOverDescription(ctx: GameOverPresentationContext): string {
    if (ctx.won) {
      return `Gia Sư Gomo chúc mừng bạn đã vượt qua Bot ${ctx.botConfig.vietnameseName}! Hãy sẵn sàng tiến lên Cấp ${Math.min(12, ctx.botConfig.id + 1)}!`;
    }
    if (ctx.lastResigned) {
      return 'Bạn đã nhận thua ván này. Hãy lắng nghe lời khuyên của Gia sư Gomo để phục thù ván sau nhé!';
    }
    return `Bot ${ctx.botConfig.vietnameseName} đã thắng ván này. Hãy phân tích lại thế trận cùng Gia sư Gomo và thử lại!`;
  }

  public override getModeSummary(ctx: GameOverPresentationContext): string {
    return `Học Viện Gomo (Đối thủ: Cấp ${ctx.botConfig.id} - ${ctx.botConfig.vietnameseName})`;
  }

  public canUndo(): boolean {
    return true; // Cho phép đi lại để học hỏi và sửa sai cùng Gia sư
  }

  public override shouldShowBotCharacter(): boolean {
    return false; // Trong chế độ Gia Sư, ẩn BotCharacter (đối thủ cà khịa) để nhường toàn bộ không gian cho Gia Sư Gomo đồng hành
  }

  public override onGameStart(ctx: GameStartContext): void {
    ctx.services.resetTutorMatchSession?.();
    ctx.services.triggerTutorSpeech?.('TUTOR_START_GAME', {
      botName: ctx.botConfig.vietnameseName,
      level: ctx.botConfig.id,
    });
    ctx.services.analyzePreMove?.(ctx.board, ctx.playerColor);
  }

  public override onPlayerTurnStart(ctx: PlayerTurnStartContext): void {
    ctx.services.analyzePreMove?.(ctx.board, ctx.playerColor);
  }

  public override onPlayerMove(ctx: PlayerMoveContext): void {
    ctx.services.evaluatePostMove?.(ctx.previousBoard, ctx.move, ctx.playerColor);
  }

  public override onUndo(ctx: UndoContext): void {
    ctx.services.popLastEvaluation?.();
    ctx.services.triggerTutorSpeech?.('TUTOR_UNDO_FEEDBACK');
    ctx.services.analyzePreMove?.(ctx.board, ctx.playerColor);
  }

  public override onResign(ctx: ResignContext): void {
    ctx.services.finalizeMatchReview?.('resign', ctx.botConfig.vietnameseName, ctx.botConfig.id);
    ctx.services.triggerTutorSpeech?.('GAME_OVER_PLAYER_RESIGN', {
      botName: ctx.botConfig.vietnameseName,
      level: ctx.botConfig.id,
    });
  }

  public override onPlayerWin(ctx: GameOverWinContext): void {
    ctx.services.finalizeMatchReview?.('win', ctx.botConfig.vietnameseName, ctx.botConfig.id);
    const nextLvl = Math.min(12, ctx.botConfig.id + 1);
    ctx.services.triggerTutorSpeech?.('GAME_OVER_PLAYER_WIN', {
      botName: ctx.botConfig.vietnameseName,
      level: ctx.botConfig.id,
      nextLevel: nextLvl,
    });
  }

  public override onBotWin(ctx: GameOverLossContext): void {
    ctx.services.finalizeMatchReview?.('loss', ctx.botConfig.vietnameseName, ctx.botConfig.id);
    ctx.services.triggerTutorSpeech?.('GAME_OVER_PLAYER_LOSS', {
      botName: ctx.botConfig.vietnameseName,
      level: ctx.botConfig.id,
    });
  }

  public override onDraw(ctx: GameOverDrawContext): void {
    ctx.services.finalizeMatchReview?.('draw', ctx.botConfig.vietnameseName, ctx.botConfig.id);
    ctx.services.triggerTutorSpeech?.('GAME_OVER_DRAW', {
      botName: ctx.botConfig.vietnameseName,
      level: ctx.botConfig.id,
    });
  }

  public recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw',
    extra?: { botLevel?: number }
  ): UserStats {
    if (!stats.tutor) {
      stats.tutor = {
        currentLevel: 1,
        highestLevel: 1,
        totalWins: 0,
        totalLosses: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalGames: 0,
        byBotLevel: {},
      };
    }

    const currentLvl = extra?.botLevel || stats.tutor.currentLevel || 1;
    stats.tutor.totalGames++;

    if (!stats.tutor.byBotLevel[currentLvl]) {
      stats.tutor.byBotLevel[currentLvl] = { wins: 0, losses: 0, draws: 0 };
    }

    if (result === 'win') {
      stats.tutor.totalWins++;
      stats.tutor.currentStreak++;
      if (stats.tutor.currentStreak > stats.tutor.bestStreak) {
        stats.tutor.bestStreak = stats.tutor.currentStreak;
      }
      stats.tutor.byBotLevel[currentLvl].wins++;

      // Cập nhật kỷ lục cấp cao nhất đã mở khóa
      stats.tutor.highestLevel = Math.max(
        stats.tutor.highestLevel || 1,
        currentLvl
      );

      // Thăng cấp đối thủ tiếp theo (tối đa Cấp 12)
      if (currentLvl >= (stats.tutor.currentLevel || 1)) {
        stats.tutor.currentLevel = Math.min(12, currentLvl + 1);
        stats.tutor.highestLevel = Math.max(stats.tutor.highestLevel, stats.tutor.currentLevel);
      }
    } else if (result === 'loss') {
      stats.tutor.totalLosses++;
      stats.tutor.currentStreak = 0;
      stats.tutor.byBotLevel[currentLvl].losses++;
    } else {
      stats.tutor.byBotLevel[currentLvl].draws++;
    }

    return stats;
  }
}
