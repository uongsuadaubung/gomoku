import { BaseStrategy } from './BaseStrategy';
import { GameMode, LevelConfig, UserStats, EMPTY } from '../types';
import { AI_LEVELS } from '../constants';
import { BotLevelContext, CanPlayerMoveContext, CustomMoveContext, CellHoverContext } from './types';

export class GuideStrategy extends BaseStrategy {
  readonly mode: GameMode = 'guide';

  public getBotLevel(_ctx: BotLevelContext | UserStats, _customConfig?: { botLevel?: number }): LevelConfig {
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
    _result: 'win' | 'loss' | 'draw',
    _extra?: { stars?: number; botLevel?: number; isTimeout?: boolean; timeSeconds?: 5 | 10 | 15 }
  ): UserStats {
    return stats;
  }

  public onGameStart(_ctx: any): void {
    // Không cần taunt tự động trong chế độ Guide
  }
}
