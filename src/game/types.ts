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

export type BoardMatrix = Player[][];

export type MatchStage = 'ready' | 'playing' | 'game_over';

export type GameStatus = 'idle' | 'playing' | 'black_win' | 'white_win' | 'draw';

export type GameMode = 'menu' | 'campaign' | 'puzzle' | 'custom' | 'blitz' | 'tutor' | 'guide';

export type GameResult = 'win' | 'loss' | 'draw';
export type MatchEndingResult = GameResult | 'resign';

export type ThreatLevel = 'winning' | 'danger' | 'warning' | 'neutral';
export type MoveQuality = 'brilliant' | 'good' | 'missed_win' | 'missed_fork' | 'blunder' | 'passive';
export type TutorMood = 'calm' | 'excited' | 'danger' | 'proud' | 'thinking';
export type MatchReviewGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface WinInfo {
  winner: ActivePlayer;
  line: [number, number][];
  direction: 'horizontal' | 'vertical' | 'main_diagonal' | 'anti_diagonal';
}

export interface CustomGameConfig {
  botLevel: number;
  playerColor: ActivePlayer;
}

import type { TutorPreMoveEvent, TutorPostMoveEvent } from '../data/tutor/types';
import type { GuideStats } from '../data/guide/types';

export interface TutorPreMoveAnalysis {
  suggestedMove: Move;
  coordLabel: string;
  event: TutorPreMoveEvent;
  speech: string;
  isDirectCoord: boolean;
  threatLevel: ThreatLevel;
}

export interface TutorPostMoveFeedback {
  playerMove: Move;
  playerCoordLabel: string;
  bestMove: Move;
  bestCoordLabel: string;
  event: TutorPostMoveEvent;
  speech: string;
  quality: MoveQuality;
  tacticName?: string;
}

export interface TutorBotEvaluation {
  botMove: Move;
  botCoordLabel: string;
  speech: string;
  tacticName?: string;
}

export interface TutorMatchReview {
  totalPlayerMoves: number;
  brilliantMoves: number;
  goodMoves: number;
  blunders: number;
  missedWins: number;
  passiveMoves: number;
  accuracy: number; // 0 - 100%
  grade: MatchReviewGrade;
  gradeTitle: string;
  gradeBadgeClass: string;
  summaryAdvice: string;
}

export type ThemeType = 'wood' | 'paper' | 'cyber' | 'slate' | 'jade';
export type BoardStyle = 'intersections' | 'cells'; // 'intersections': Trên giao điểm đường kẻ, 'cells': Giữa ô vuông

export type TacticalWinType = 'none' | 'vcf' | 'vct';

export interface AIStats {
  depth: number;
  nodesEvaluated: number;
  timeMs: number;
  winProbability: number;
  bestScore: number;
  tacticalType: TacticalWinType;
}

export interface LevelConfig {
  id: number;
  name: string;
  vietnameseName: string;
  tag: string;
  minWins: number;
  maxWins: number;
  depth: number;               // Độ sâu tìm kiếm Minimax (1 -> 6)
  candidateCount: number;      // Số nhánh ứng viên tối đa tại mỗi tầng
  threatVision: number;        // Tầm nhìn đe dọa khẩn cấp [0.0 - 1.0] (xác suất nhận biết nước 4/5)
  attackWeight: number;        // Trọng số tấn công [0.5 - 1.5]
  defenseWeight: number;       // Trọng số phòng thủ [0.3 - 1.5]
  temperature: number;         // Nhiệt độ Softmax chọn nước đi [0.0 - 1.0] (0 = tuyệt đối tối ưu)
  vcfDepth: number;            // Độ sâu tìm kiếm chuỗi VCF (0 = tắt)
  vctDepth: number;            // Độ sâu tìm kiếm chuỗi VCT (0 = tắt)
  color: string;
  gradient: string;
  badgeBg: string;
  avatar: string;
  description: string;
  tactics: string;
}

export interface ModeStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
}

export interface PuzzleStats {
  currentLevel: number; // Cấp độ thế cờ hiện tại (1 sao trở lên)
  totalSolved: number;
  totalFailed: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  solvedByStars: Record<number, number>;
}

export interface CustomStats extends ModeStats {
  byBotLevel: Record<number, { wins: number; losses: number; draws: number }>;
}

export interface BlitzStats {
  currentLevel: number;        // Cấp Bot hiện tại trong chuỗi đang chạy (1 - 12)
  highestLevel: number;        // Kỷ lục cấp cao nhất từng vượt qua (1 - 12)
  totalWins: number;
  totalLosses: number;
  timeoutLosses: number;       // Số lần thua do cháy giờ
  bestStreak: number;
  currentStreak: number;
  totalGames: number;
  selectedTimeSeconds: 5 | 10 | 15;
}

export interface TutorStats {
  currentLevel: number;        // Cấp Bot đối thủ hiện tại (1 - 12)
  highestLevel: number;        // Kỷ lục cấp cao nhất từng vượt qua (1 - 12)
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  byBotLevel: Record<number, { wins: number; losses: number; draws: number }>;
}

export interface UserStats {
  // 🏆 1. Chiến dịch (Campaign)
  campaign: ModeStats;
  // 🧩 2. Thế cờ giữa trận (Puzzle)
  puzzle: PuzzleStats;
  // ⚔️ 3. Đấu tùy chọn (Custom)
  custom: CustomStats;
  // ⚡ 4. Cờ chớp sinh tử (Blitz)
  blitz: BlitzStats;
  // 🎓 5. Học viện Gia Sư (Tutor)
  tutor: TutorStats;
  // 📖 6. Kỳ Viện Bách Khoa (Guide)
  guide: GuideStats;

  // Dữ liệu tương thích cấp cao
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
