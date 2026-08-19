import { GameMode, LevelConfig, UserStats, CustomGameConfig } from '../types';

export interface GameModeStrategy {
  readonly mode: GameMode;

  /**
   * Xác định cấu hình AI tương ứng với chế độ chơi này
   */
  getBotLevel(stats: UserStats, customConfig?: CustomGameConfig): LevelConfig;

  /**
   * Cho phép hoặc cấm tính năng Đi Lại (Undo)
   */
  canUndo(): boolean;

  /**
   * Xử lý và ghi nhận kết quả ván cờ vào đúng vùng nhớ của chế độ
   */
  recordGame(
    stats: UserStats,
    result: 'win' | 'loss' | 'draw',
    extra?: { stars?: number; botLevel?: number }
  ): UserStats;
}
