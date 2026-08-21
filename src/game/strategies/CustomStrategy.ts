import { BaseStrategy } from './BaseStrategy';
import {
  ModeInitContext,
  BotLevelContext,
  SeriesPlayerSideContext,
  GameOverPresentationContext,
  CustomEnterParams,
  CustomStartMatchParams,
} from './types';
import { GameMode, LevelConfig, UserStats, BLACK, WHITE, GameResult } from '../types';
import { AI_LEVELS } from '../constants';

export class CustomStrategy extends BaseStrategy<CustomEnterParams, CustomStartMatchParams> {
  public readonly mode: GameMode = 'custom';

  public override enterMode(ctx: ModeInitContext, params?: CustomEnterParams): void {
    const highestUnlocked = Math.max(1, ctx.campaignLevelConfig().id);
    const selectedLevel = params?.botLevel || ctx.series.customConfig()?.botLevel || Math.min(3, highestUnlocked);

    ctx.series.setCustomConfig({
      botLevel: selectedLevel,
      playerColor: BLACK,
    });
    super.enterMode(ctx);
    ctx.setCurrentTurn(BLACK);
    ctx.setPlayerColor(BLACK);
  }

  public override startMatch(
    ctx: ModeInitContext,
    params?: CustomStartMatchParams
  ): void {
    const lvl = params?.botLevel || ctx.series.customConfig()?.botLevel || 1;
    const playAsBlack = params?.playAsBlack ?? true;
    ctx.setGameMode('custom');
    ctx.series.setCustomConfig({
      botLevel: lvl,
      playerColor: playAsBlack ? BLACK : WHITE,
    });
    ctx.series.setIsSeriesActive(false);
    ctx.series.setSeriesGameNumber(0);
    ctx.series.setLastResigned(false);
    ctx.startNewGame(playAsBlack);
  }

  public getBotLevel(ctx: BotLevelContext): LevelConfig {
    const lvl = ctx.customConfig?.botLevel || 3;
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
    result: GameResult,
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
