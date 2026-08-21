import { BaseStrategy } from './BaseStrategy';
import { GameMode, LevelConfig, UserStats, EMPTY, GameResult } from '../types';
import { AI_LEVELS } from '../constants';
import {
  ModeInitContext,
  BotLevelContext,
  CanPlayerMoveContext,
  CustomMoveContext,
  CellHoverContext,
  GameStartContext,
  GuideEnterParams,
} from './types';

export class GuideStrategy extends BaseStrategy<GuideEnterParams, void> {
  readonly mode: GameMode = 'guide';

  public override enterMode(ctx: ModeInitContext, params?: GuideEnterParams): void {
    const tab = params?.tab || 'lessons';
    ctx.blitz.stopBlitzTimer();
    ctx.setGameMode('guide');
    ctx.series.setIsSeriesActive(false);
    ctx.series.setSeriesGameNumber(0);
    ctx.series.setLastResigned(false);
    ctx.setAiStats(null);
    ctx.setIsAiThinking(false);
    ctx.setGameStatus('playing');
    ctx.setMatchStage('playing');
    ctx.guide.setGuideTab(tab);
    if (tab === 'lessons') {
      ctx.guide.resumeLatestLesson();
    } else {
      ctx.guide.startSandboxMode();
    }
    ctx.soundService.playClickSound();
  }

  public getBotLevel(_ctx: BotLevelContext): LevelConfig {
    return AI_LEVELS[11] || AI_LEVELS[0]; // Thần Cờ Trí Tuệ Tối Thượng
  }

  public canUndo(): boolean {
    return true;
  }

  public shouldShowBotCharacter(): boolean {
    return false; // Trong chế độ Guide, sử dụng GuideMasterView & Master Layout riêng
  }

  public override canPlayerMove(ctx: CanPlayerMoveContext): boolean {
    return ctx.matchStage === 'playing';
  }

  public override handleCustomMove(ctx: CustomMoveContext): boolean {
    if (!ctx.services.guide) return false;
    if (ctx.services.guide.guideTab() === 'lessons') {
      ctx.services.guide.handleLessonMove(ctx.row, ctx.col);
    } else {
      ctx.services.guide.handleSandboxCellClick(ctx.row, ctx.col);
    }
    return true;
  }

  public override onCellHover(ctx: CellHoverContext): boolean {
    if (!ctx.services.guide) return false;
    if (ctx.services.guide.guideTab() === 'sandbox' && ctx.cell === EMPTY) {
      ctx.services.guide.setSelectedSandboxCell({ row: ctx.row, col: ctx.col });
      return true;
    }
    return false;
  }

  public override shouldShowGuideOverlay(): boolean {
    return true;
  }

  public override shouldShowGuideMasterView(): boolean {
    return true;
  }

  public recordGame(
    stats: UserStats,
    _result: GameResult,
    _extra?: { stars?: number; botLevel?: number; isTimeout?: boolean; timeSeconds?: 5 | 10 | 15 }
  ): UserStats {
    return stats;
  }

  public onGameStart(_ctx: GameStartContext): void {
    // Không cần taunt tự động trong chế độ Guide
  }
}
