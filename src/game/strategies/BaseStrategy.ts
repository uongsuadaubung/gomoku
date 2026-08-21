import {
  GameModeStrategy,
  ModeInitContext,
  BotLevelContext,
  SeriesPlayerSideContext,
  GameOverPresentationContext,
  GameStartContext,
  PlayerTurnStartContext,
  PlayerMoveContext,
  UndoContext,
  ResignContext,
  GameOverWinContext,
  GameOverLossContext,
  GameOverDrawContext,
  CanPlayerMoveContext,
  CustomMoveContext,
  CellHoverContext,
} from './types';
import { GameMode, LevelConfig, UserStats, BLACK, GameResult } from '../types';
import { createEmptyBoard } from '../board';
import { TauntEvent } from '../../data/taunts/types';
import { TauntEvaluator } from '../../services/tauntEvaluator';
import { TauntService } from '../../services/tauntService';

export abstract class BaseStrategy<
  TEnterParams = void,
  TStartParams extends { playAsBlack?: boolean } | void = { playAsBlack?: boolean }
> implements GameModeStrategy<TEnterParams, TStartParams> {
  abstract readonly mode: GameMode;
  abstract getBotLevel(ctx: BotLevelContext): LevelConfig;
  abstract canUndo(): boolean;
  abstract recordGame(
    stats: UserStats,
    result: GameResult,
    extra?: { stars?: number; botLevel?: number; isTimeout?: boolean; timeSeconds?: 5 | 10 | 15 }
  ): UserStats;

  public enterMode(ctx: ModeInitContext, _params?: TEnterParams): void {
    ctx.setGameMode(this.mode);
    ctx.series.setIsSeriesActive(false);
    ctx.series.setSeriesGameNumber(0);
    ctx.series.setLastResigned(false);
    ctx.setBoard(createEmptyBoard());
    ctx.setMoveHistory([]);
    ctx.setLastMove(null);
    ctx.setWinInfo(null);
    ctx.setAiStats(null);
    ctx.setIsAiThinking(false);
    ctx.setAiThinkingProgress({ depth: 0, nodes: 0 });
    ctx.setGameStatus('idle');
    ctx.setMatchStage('ready');
    ctx.taunt.clearTauntQueue();
    ctx.taunt.resetIdleTimer();
    ctx.soundService.playClickSound();
  }

  public startMatch(ctx: ModeInitContext, params?: TStartParams): void {
    this.enterMode(ctx);
    ctx.startNewGame(params ? params.playAsBlack ?? true : true);
  }

  public getNextSeriesPlayerSide(ctx: SeriesPlayerSideContext): boolean {
    // Mặc định: Luân phiên đổi phe đen/trắng sau mỗi ván
    return ctx.currentPlayerColor !== BLACK;
  }

  public getCurrentStreak(stats: UserStats): number {
    return stats.campaign?.currentStreak ?? stats.currentStreak ?? 0;
  }

  public getGameOverTitle(ctx: GameOverPresentationContext): { text: string; color: string } {
    if (ctx.won) return { text: 'Xuất Sắc! Bạn Đã Thắng! 🎉', color: 'text-emerald-400' };
    if (ctx.draw) return { text: 'Trận Đấu Hòa Cờ! 🤝', color: 'text-slate-200' };
    if (ctx.lastResigned) return { text: 'Bạn Đã Nhận Thua 🏳️', color: 'text-rose-400' };
    return { text: 'Bot Đã Giành Chiến Thắng! 💥', color: 'text-rose-400' };
  }

  public getGameOverDescription(ctx: GameOverPresentationContext): string {
    if (ctx.won) return 'Bạn đã hoàn thành chuỗi 5 quân cờ liên tiếp thành công!';
    if (ctx.lastResigned) return 'Bạn đã đầu hàng ván đấu này. Hãy phục thù ở ván tiếp theo!';
    return 'Bot đã hoàn thành chuỗi 5 quân cờ liên tiếp!';
  }

  public getModeSummary(ctx: GameOverPresentationContext): string {
    return `Chiến Dịch (Bot ${ctx.botConfig.vietnameseName})`;
  }

  public getMoveCountDisplay(historyLength: number, _puzzleInitialLength?: number): string {
    return `${historyLength} nước`;
  }

  public shouldShowBotCharacter(): boolean {
    return true; // Mặc định hiển thị BotCharacter cho các chế độ chơi
  }

  public canPlayerMove(ctx: CanPlayerMoveContext): boolean {
    return (
      ctx.matchStage === 'playing' &&
      !ctx.isAiThinking &&
      ctx.currentTurn === ctx.playerColor
    );
  }

  public handleCustomMove?(_ctx: CustomMoveContext): boolean {
    return false;
  }

  public onCellHover?(_ctx: CellHoverContext): boolean {
    return false;
  }

  public shouldShowGuideOverlay(): boolean {
    return false;
  }

  public shouldShowGuideMasterView(): boolean {
    return false;
  }

  public onGameStart(ctx: GameStartContext): void {
    const startTaunt = TauntEvaluator.evaluateGameStart(ctx.lastGameResult);
    ctx.services.triggerTaunt?.(startTaunt, 200);
  }

  public onPlayerTurnStart(_ctx: PlayerTurnStartContext): void {
    // Mặc định không có hành vi đặc thù
  }

  public onPlayerMove(_ctx: PlayerMoveContext): void {
    // Mặc định không có hành vi đặc thù
  }

  public onUndo(ctx: UndoContext): void {
    const undoTaunt = TauntEvaluator.evaluateUndo({
      isInstantUndo: ctx.isInstantUndo,
      recentUndoCount: ctx.recentUndoCount,
    });
    ctx.services.triggerTaunt?.(undoTaunt, 300);
  }

  public onResign(ctx: ResignContext): void {
    const hasThreat = TauntService.hasBotActiveThreat(ctx.board, ctx.aiColor);
    let resignTaunt: TauntEvent = 'PLAYER_RESIGN';
    if (ctx.isAiThinking) {
      resignTaunt = 'RESIGN_WHILE_AI_THINKING';
    } else if (ctx.isLongThinking) {
      resignTaunt = 'SURRENDER_AFTER_LONG_THINKING';
    } else if (hasThreat) {
      resignTaunt = 'SURRENDER_ON_THREAT';
    }

    ctx.services.triggerTaunt?.(resignTaunt, 200);
  }

  public onPlayerWin(ctx: GameOverWinContext): void {
    const winTaunt = TauntEvaluator.evaluatePlayerWin({
      moveCount: ctx.moveCount,
      hadComeback: ctx.hadComeback,
      undoCount: ctx.undoCount,
      wasUndoJustUsed: ctx.wasUndoJustUsed,
      botEverHadOpenThreat: ctx.botEverHadOpenThreat,
      prevStats: ctx.prevStats,
      currentLevelId: ctx.oldLevel,
    });
    ctx.services.triggerTaunt?.(winTaunt, 500);
  }

  public onBotWin(ctx: GameOverLossContext): void {
    const botWinTaunt = TauntEvaluator.evaluateBotWin({
      moveCount: ctx.moveCount,
      wasLastGameSpeedLoss: ctx.wasLastGameSpeedLoss,
      isHeavyLossStreak: ctx.isHeavyLossStreak,
      isImmediateRevenge: ctx.isImmediateRevenge,
      durationMs: ctx.durationMs,
      winningMoveRow: ctx.winningMove?.row,
      winningMoveCol: ctx.winningMove?.col,
    });
    ctx.services.triggerTaunt?.(botWinTaunt, 400);
  }

  public onDraw(ctx: GameOverDrawContext): void {
    const drawTaunt = TauntEvaluator.evaluateDraw(ctx.consecutiveDrawsCount);
    ctx.services.triggerTaunt?.(drawTaunt, 400);
  }
}
