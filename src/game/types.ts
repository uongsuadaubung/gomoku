export const BOARD_SIZE = 15;

export const EMPTY = 0;
export const BLACK = 1; // Quân đen (đi trước)
export const WHITE = 2; // Quân trắng (đi sau)

export type Player = typeof EMPTY | typeof BLACK | typeof WHITE;
export type ActivePlayer = typeof BLACK | typeof WHITE;

export interface Move {
  row: number;
  col: number;
  player?: ActivePlayer;
  score?: number;
}

export type BoardMatrix = number[][];

export type GameStatus = 'idle' | 'playing' | 'black_win' | 'white_win' | 'draw';

export interface WinInfo {
  winner: ActivePlayer;
  line: [number, number][];
  direction: 'horizontal' | 'vertical' | 'main_diagonal' | 'anti_diagonal';
}

export type ThemeType = 'wood' | 'paper' | 'cyber' | 'slate' | 'jade';
export type BoardStyle = 'intersections' | 'cells'; // 'intersections': Trên giao điểm đường kẻ, 'cells': Giữa ô vuông

export interface AIStats {
  depth: number;
  nodesEvaluated: number;
  timeMs: number;
  winProbability: number;
  bestScore: number;
  vcfFound?: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  vietnameseName: string;
  tag: string;
  minWins: number;
  maxWins: number;
  depth: number;
  candidateCount: number;
  randomness: number; // Tỷ lệ chọn ngẫu nhiên có trọng số trong top nước đi (0 = tuyệt đối tối ưu)
  vcfEnabled: boolean;
  color: string;
  gradient: string;
  badgeBg: string;
  avatar: string;
  description: string;
  tactics: string;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  manualLevel: number | null; // null = Tự động theo số trận thắng
}

export interface MoveHistoryItem {
  row: number;
  col: number;
  player: ActivePlayer;
  stepNumber: number;
  timestamp: number;
}

export type WorkerMessageIn = 
  | { type: 'CALCULATE_MOVE'; board: BoardMatrix; aiPlayer: ActivePlayer; levelId: number; turnCount: number }
  | { type: 'CANCEL' };

export type WorkerMessageOut = 
  | { type: 'MOVE_RESULT'; move: Move; stats: AIStats }
  | { type: 'PROGRESS'; depth: number; nodes: number; currentBest?: Move; score?: number };
