import { BaseStrategy } from './BaseStrategy';
import {
  GameOverPresentationContext,
  GameOverWinContext,
  GameOverLossContext,
  GameOverDrawContext,
} from './types';
import { GameMode, LevelConfig, UserStats } from '../types';
import { AI_LEVELS } from '../constants';

export class PuzzleStrategy extends BaseStrategy {
  public readonly mode: GameMode = 'puzzle';

  public getBotLevel(): LevelConfig {
    // Chế độ thế cờ luôn đấu với Bot Level 8 (Thần Cờ Bất Khả Chiến Bại)
    return AI_LEVELS[AI_LEVELS.length - 1];
  }

  public override getCurrentStreak(stats: UserStats): number {
    return stats.puzzle?.currentStreak ?? 0;
  }

  public override getGameOverTitle(ctx: GameOverPresentationContext): { text: string; color: string } {
    if (ctx.won) return { text: 'Giải Thế Cờ Thành Công! 🎉', color: 'text-emerald-400' };
    return { text: 'Chưa Giải Được Thế Cờ! 💥', color: 'text-rose-400' };
  }

  public override getGameOverDescription(ctx: GameOverPresentationContext): string {
    if (ctx.won) return 'Xuất sắc! Bạn đã giải mã thành công thế cờ hóc búa này.';
    return 'Chưa giải được thế cờ! Hãy thử lại hoặc chuyển sang thế cờ mới.';
  }

  public override getModeSummary(ctx: GameOverPresentationContext): string {
    return ctx.currentPuzzleName || 'Thế Cờ Giữa Trận';
  }

  public override getMoveCountDisplay(historyLength: number, puzzleInitialLength?: number): string {
    const extraMoves = historyLength - (puzzleInitialLength || 0);
    return `${extraMoves} nước thêm`;
  }

  public canUndo(): boolean {
    // Chế độ thế cờ cấm tuyệt đối Undo để rèn luyện tư duy tính toán chính xác
    return false;
  }

  public override onPlayerWin(ctx: GameOverWinContext): void {
    super.onPlayerWin(ctx);
    ctx.services.clearActivePuzzle?.();
  }

  public override onBotWin(ctx: GameOverLossContext): void {
    super.onBotWin(ctx);
    ctx.services.clearActivePuzzle?.();
  }

  public override onDraw(ctx: GameOverDrawContext): void {
    super.onDraw(ctx);
    ctx.services.clearActivePuzzle?.();
  }

  public recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw',
    extra?: { stars?: number }
  ): UserStats {
    if (!stats.puzzle) {
      stats.puzzle = {
        currentLevel: 1,
        totalSolved: 0,
        totalFailed: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalGames: 0,
        solvedByStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    if (!stats.puzzle.currentLevel) {
      stats.puzzle.currentLevel = 1;
    }

    const currentMax = stats.puzzle.currentLevel || 1;
    const playedStars = extra?.stars || 1;

    stats.puzzle.totalGames++;

    if (result === 'win') {
      stats.puzzle.totalSolved++;
      stats.puzzle.currentStreak++;
      if (stats.puzzle.currentStreak > stats.puzzle.bestStreak) {
        stats.puzzle.bestStreak = stats.puzzle.currentStreak;
      }
      if (extra?.stars && extra.stars >= 1) {
        stats.puzzle.solvedByStars[extra.stars] = (stats.puzzle.solvedByStars[extra.stars] || 0) + 1;
      }

      // CHỈ TĂNG CẤP KHI ĐÃ VƯỢT QUA CẤP ĐÓ (playedStars >= currentMax)
      // Nếu random ra cấp thấp hơn (playedStars < currentMax) -> Giữ nguyên không tăng
      if (playedStars >= currentMax) {
        stats.puzzle.currentLevel = Math.min(7, currentMax + 1);
      } else {
        stats.puzzle.currentLevel = currentMax;
      }
    } else {
      stats.puzzle.totalFailed++;
      stats.puzzle.currentStreak = 0;
      // Không giải được thì giữ nguyên mốc cao nhất đã mở khóa (không bị tụt cấp)
      stats.puzzle.currentLevel = currentMax;
    }

    return stats;
  }
}
