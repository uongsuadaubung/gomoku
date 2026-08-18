import { UserStats, ThemeType, BoardStyle } from '../game/types';

const STORAGE_KEYS = {
  STATS: 'gomoku_user_stats_v1',
  THEME: 'gomoku_theme_v1',
  SHOW_STEP_NUMBERS: 'gomoku_show_step_numbers',
};

const DEFAULT_STATS: UserStats = {
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
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return { ...DEFAULT_STATS, ...JSON.parse(data) };
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

  public static recordGame(result: 'win' | 'loss' | 'draw'): UserStats {
    const stats = this.getStats();
    stats.totalGames++;

    if (result === 'win') {
      stats.wins++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else if (result === 'loss') {
      stats.losses++;
      stats.currentStreak = 0;
    } else {
      stats.draws++;
    }

    this.saveStats(stats);
    return stats;
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
    const style = localStorage.getItem('gomoku_board_style_v1') as BoardStyle;
    return style === 'intersections' ? 'intersections' : 'cells';
  }

  public static setBoardStyle(style: BoardStyle): void {
    localStorage.setItem('gomoku_board_style_v1', style);
  }

  public static getEnableTaunts(): boolean {
    const val = localStorage.getItem('gomoku_enable_taunts_v1');
    return val === null ? true : val === 'true'; // Mặc định bật
  }

  public static setEnableTaunts(enabled: boolean): void {
    localStorage.setItem('gomoku_enable_taunts_v1', String(enabled));
  }
}
