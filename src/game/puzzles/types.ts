import { ActivePlayer, BoardMatrix, MoveHistoryItem } from '../types';

export type PuzzleDifficulty = number;

export type PuzzleType = 'VCF' | 'VCT' | 'DEFENSE';
export type PuzzleDensity = 'sparse' | 'normal' | 'dense';

export interface PuzzleGeneratorOptions {
  stars?: number;
  type?: PuzzleType;
  density?: PuzzleDensity;
}

export interface PuzzleScenario {
  id: string;
  stars: number;
  name: string;
  description: string;
  optimalMoves: number;
  initialBoard: BoardMatrix;
  initialMoveHistory: MoveHistoryItem[];
  playerColor: ActivePlayer;
  puzzleType?: PuzzleType;
  solutionMoves?: Array<{ row: number; col: number; player: ActivePlayer }>;
  hints?: {
    zone?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
    firstMove?: { row: number; col: number };
  };
}

export interface SolutionTraceResult {
  success: boolean;
  moves: number;
  attackMoves: Array<{ r: number; c: number }>;
}

export interface SkeletonStone {
  r: number;
  c: number;
  player: ActivePlayer;
}

export type PuzzleStarLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SkeletonPattern = SkeletonStone[];
export type SkeletonPoolByStars = {
  [stars in number]?: SkeletonPattern[];
};

