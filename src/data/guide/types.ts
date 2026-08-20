import type { ActivePlayer, BoardMatrix, Move } from '../../game/types';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type MoveQuality = 'best' | 'good' | 'acceptable' | 'blunder' | 'passive';

export interface GuideMoveFeedback {
  row: number;
  col: number;
  quality: MoveQuality;
  explanation: string;
  opponentResponse?: Move; // Nước phản công mô phỏng của đối thủ nếu người chơi đi nước này
  opponentExplanation?: string;
  nextStepPrompt?: string;
}

export interface LessonStep {
  stepIndex: number;
  instruction: string;
  initialBoard: BoardMatrix;
  playerColor: ActivePlayer;
  targetMove: Move;
  alternativeGoodMoves?: Move[];
  feedbacks: GuideMoveFeedback[];
  hint: string;
  keyConcepts?: string[];
}

export interface GuideLesson {
  id: string;
  chapterId: number;
  order: number;
  title: string;
  subtitle: string;
  difficulty: LessonDifficulty;
  durationMinutes: number;
  description: string;
  coreConcepts: string[];
  initialBoard: BoardMatrix;
  playerColor: ActivePlayer;
  turnPlayer: ActivePlayer;
  steps: LessonStep[];
  detailedArticle: string;
  summaryTakeaway: string;
}

export interface GuideChapter {
  id: number;
  title: string;
  vietnameseTitle: string;
  badge: string;
  iconName: string;
  description: string;
  lessons: GuideLesson[];
}

export interface HeatmapCell {
  row: number;
  col: number;
  score: number;
  quality: 'vcf' | 'vct' | 'win' | 'best' | 'good' | 'passive' | 'blunder';
  tacticName?: string;
  threatDescription?: string;
}

export interface WhatIfStep {
  stepNumber: number;
  move: Move;
  player: ActivePlayer;
  annotation: string;
  tacticName?: string;
}

export interface PresetBoard {
  id: string;
  category: 'opening_direct' | 'opening_indirect' | 'tactical_fork' | 'vcf_chain' | 'defense_master';
  categoryName: string;
  name: string;
  vietnameseName: string;
  description: string;
  board: BoardMatrix;
  turnPlayer: ActivePlayer;
  recommendedMove?: Move;
  tacticalNote: string;
}

export interface GuideStats {
  completedLessons: string[]; // List of lesson IDs completed
  unlockedChapters: number[]; // Chapter IDs unlocked
  sandboxPresetLoadedCount: number;
  totalLessonsCompleted: number;
  lastSelectedLessonId?: string; // ID của bài học đang học dở hoặc gần nhất
}
