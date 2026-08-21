import { BaseStrategy } from './BaseStrategy';
import {
  ModeInitContext,
  GameOverPresentationContext,
  GameOverWinContext,
  GameOverLossContext,
  GameOverDrawContext,
  PuzzleEnterParams,
  PuzzleNextParams,
} from './types';
import { GameMode, LevelConfig, UserStats, GameResult } from '../types';
import { AI_LEVELS } from '../constants';
import { cloneBoard } from '../board';
import { StorageService } from '../../services/storageService';
import { TauntEvaluator } from '../../services/tauntEvaluator';

export class PuzzleStrategy extends BaseStrategy<PuzzleEnterParams, void> {
  public readonly mode: GameMode = 'puzzle';

  public override enterMode(ctx: ModeInitContext, params?: PuzzleEnterParams): void {
    const scenario = ctx.puzzle.getOrGeneratePuzzle(params?.stars, params?.forceNew ?? false);

    ctx.setGameMode('puzzle');
    ctx.series.setIsSeriesActive(false);
    ctx.series.setSeriesGameNumber(0);
    ctx.series.setLastResigned(false);
    ctx.setPlayerColor(scenario.playerColor);
    ctx.setBoard(cloneBoard(scenario.initialBoard));
    ctx.setMoveHistory([...scenario.initialMoveHistory]);
    const lastHist = scenario.initialMoveHistory[scenario.initialMoveHistory.length - 1];
    ctx.setLastMove(lastHist ? { row: lastHist.row, col: lastHist.col } : null);
    ctx.setWinInfo(null);
    ctx.setAiStats(null);
    ctx.setIsAiThinking(false);
    ctx.setAiThinkingProgress({ depth: 0, nodes: 0 });
    ctx.setGameStatus('playing');
    ctx.setMatchStage('playing');
    ctx.setCurrentTurn(scenario.playerColor);

    ctx.soundService.playStoneSound();
    const startTaunt = TauntEvaluator.evaluateGameStart(ctx.lastGameResult());
    ctx.taunt.triggerTaunt(startTaunt, 200);
    ctx.taunt.resetIdleTimer();
  }

  public restartPuzzle(ctx: ModeInitContext): void {
    const scenario = ctx.puzzle.currentPuzzle() || StorageService.getActivePuzzle();
    if (!scenario) {
      this.enterMode(ctx, { forceNew: true });
      return;
    }
    StorageService.saveActivePuzzle(scenario);
    ctx.cancelAiWorker();
    ctx.setBoard(cloneBoard(scenario.initialBoard));
    ctx.setMoveHistory([...scenario.initialMoveHistory]);
    const lastHist = scenario.initialMoveHistory[scenario.initialMoveHistory.length - 1];
    ctx.setLastMove(lastHist ? { row: lastHist.row, col: lastHist.col } : null);
    ctx.setWinInfo(null);
    ctx.setAiStats(null);
    ctx.setIsAiThinking(false);
    ctx.setAiThinkingProgress({ depth: 0, nodes: 0 });
    ctx.setGameStatus('playing');
    ctx.setMatchStage('playing');
    ctx.setCurrentTurn(scenario.playerColor);
    ctx.soundService.playClickSound();
    ctx.taunt.resetIdleTimer();
  }

  public nextPuzzle(ctx: ModeInitContext, params?: PuzzleNextParams): void {
    if (ctx.gameStatus() === 'playing') {
      ctx.resignGame();
    }
    this.enterMode(ctx, { stars: params?.stars, forceNew: true });
  }

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
    result: GameResult,
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
