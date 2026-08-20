import { UserStats, ThemeType, BoardStyle, GameMode } from '../game/types';
import { PuzzleScenario } from '../game/puzzles/types';
import { getGameStrategy } from '../game/strategies';

const STORAGE_KEYS = {
  STATS: 'gomoku_user_stats_v2',
  STATS_LEGACY: 'gomoku_user_stats_v1',
  THEME: 'gomoku_theme_v1',
  SHOW_STEP_NUMBERS: 'gomoku_show_step_numbers',
  BOARD_STYLE: 'gomoku_board_style_v1',
  ENABLE_TAUNTS: 'gomoku_enable_taunts_v1',
  MUTED: 'gomoku_muted',
  ACTIVE_PUZZLE: 'gomoku_active_puzzle_v1',
};

const DEFAULT_STATS: UserStats = {
  campaign: {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
  },
  puzzle: {
    currentLevel: 1,
    totalSolved: 0,
    totalFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    solvedByStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
  custom: {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    byBotLevel: {},
  },
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  manualLevel: null, // Mặc định chế độ tự động thăng cấp theo số trận thắng
};

export class StorageService {
  public static getStats(): UserStats {
    try {
      const dataV2 = localStorage.getItem(STORAGE_KEYS.STATS);
      if (dataV2) {
        const parsed = JSON.parse(dataV2);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          campaign: { ...DEFAULT_STATS.campaign, ...(parsed.campaign || {}) },
          puzzle: {
            ...DEFAULT_STATS.puzzle,
            ...(parsed.puzzle || {}),
            solvedByStars: {
              ...DEFAULT_STATS.puzzle.solvedByStars,
              ...(parsed.puzzle?.solvedByStars || {}),
            },
          },
          custom: {
            ...DEFAULT_STATS.custom,
            ...(parsed.custom || {}),
            byBotLevel: { ...(parsed.custom?.byBotLevel || {}) },
          },
        };
      }

      // Di chuyển dữ liệu cũ từ V1 sang Campaign V2 nếu có
      const legacyData = localStorage.getItem(STORAGE_KEYS.STATS_LEGACY);
      if (legacyData) {
        const parsedLegacy = JSON.parse(legacyData);
        const migrated: UserStats = {
          ...DEFAULT_STATS,
          campaign: {
            wins: parsedLegacy.wins || 0,
            losses: parsedLegacy.losses || 0,
            draws: parsedLegacy.draws || 0,
            currentStreak: parsedLegacy.currentStreak || 0,
            bestStreak: parsedLegacy.bestStreak || 0,
            totalGames: parsedLegacy.totalGames || 0,
          },
          wins: parsedLegacy.wins || 0,
          losses: parsedLegacy.losses || 0,
          draws: parsedLegacy.draws || 0,
          currentStreak: parsedLegacy.currentStreak || 0,
          bestStreak: parsedLegacy.bestStreak || 0,
          totalGames: parsedLegacy.totalGames || 0,
          manualLevel: parsedLegacy.manualLevel ?? null,
        };
        this.saveStats(migrated);
        return migrated;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATS;
  }

  public static saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  public static recordGame(
    mode: GameMode = 'campaign',
    result: 'win' | 'loss' | 'draw',
    extra?: { stars?: number; botLevel?: number }
  ): UserStats {
    const stats = this.getStats();
    const strategy = getGameStrategy(mode);
    const updatedStats = strategy.recordGame(stats, result, extra);
    this.saveStats(updatedStats);
    return updatedStats;
  }

  public static setManualLevel(level: number | null): UserStats {
    const stats = this.getStats();
    stats.manualLevel = level;
    this.saveStats(stats);
    return stats;
  }

  public static resetStats(): UserStats {
    this.saveStats(DEFAULT_STATS);
    return DEFAULT_STATS;
  }

  public static getTheme(): ThemeType {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeType;
    const validThemes: ThemeType[] = ['wood', 'paper', 'jade', 'slate', 'cyber'];
    return validThemes.includes(theme) ? theme : 'paper';
  }

  public static setTheme(theme: ThemeType): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  public static getShowStepNumbers(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SHOW_STEP_NUMBERS) === 'true';
  }

  public static setShowStepNumbers(show: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SHOW_STEP_NUMBERS, String(show));
  }

  public static getBoardStyle(): BoardStyle {
    const style = localStorage.getItem(STORAGE_KEYS.BOARD_STYLE) as BoardStyle;
    return style === 'intersections' ? 'intersections' : 'cells';
  }

  public static setBoardStyle(style: BoardStyle): void {
    localStorage.setItem(STORAGE_KEYS.BOARD_STYLE, style);
  }

  public static getEnableTaunts(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.ENABLE_TAUNTS);
    return val === null ? true : val === 'true'; // Mặc định bật
  }

  public static setEnableTaunts(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ENABLE_TAUNTS, String(enabled));
  }

  public static getMuted(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.MUTED);
    return saved === 'true';
  }

  public static setMuted(muted: boolean): void {
    localStorage.setItem(STORAGE_KEYS.MUTED, String(muted));
  }

  public static getActivePuzzle(): PuzzleScenario | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PUZZLE);
      return data ? (JSON.parse(data) as PuzzleScenario) : null;
    } catch {
      return null;
    }
  }

  public static saveActivePuzzle(puzzle: PuzzleScenario | null): void {
    try {
      if (puzzle) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PUZZLE, JSON.stringify(puzzle));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PUZZLE);
      }
    } catch {
      // ignore
    }
  }
}
