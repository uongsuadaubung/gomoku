import {
  GameMode,
  LevelConfig,
  UserStats,
  ActivePlayer,
  BoardMatrix,
  Move,
  CustomGameConfig,
} from '../types';
import { TauntEvent } from '../../data/taunts/types';
import { TutorGeneralEvent, TutorDialogueContext } from '../../data/tutor/types';

export interface BotLevelContext {
  stats: UserStats;
  customConfig?: CustomGameConfig;
  tutorLevel?: number;
}

export interface SeriesPlayerSideContext {
  currentPlayerColor: ActivePlayer;
  customConfig?: CustomGameConfig;
}

export interface GameOverPresentationContext {
  won: boolean;
  draw: boolean;
  lastResigned: boolean;
  botConfig: LevelConfig;
  blitzTimeLimit?: number;
  isBlitzTimeout?: boolean;
  currentPuzzleName?: string;
}

export interface GameStartContext {
  lastGameResult: 'win' | 'loss' | 'draw' | null;
  botConfig: LevelConfig;
  board: BoardMatrix;
  playerColor: ActivePlayer;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    analyzePreMove?: (board: BoardMatrix, playerColor: ActivePlayer) => void;
    resetTutorMatchSession?: () => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
    startBlitzTimer?: () => void;
  };
}

export interface PlayerTurnStartContext {
  board: BoardMatrix;
  playerColor: ActivePlayer;
  services: {
    startBlitzTimer?: () => void;
    analyzePreMove?: (board: BoardMatrix, playerColor: ActivePlayer) => void;
  };
}

export interface PlayerMoveContext {
  previousBoard: BoardMatrix;
  currentBoard: BoardMatrix;
  move: Move;
  playerColor: ActivePlayer;
  services: {
    stopBlitzTimer?: () => void;
    evaluatePostMove?: (previousBoard: BoardMatrix, move: Move, playerColor: ActivePlayer) => void;
  };
}

export interface UndoContext {
  board: BoardMatrix;
  playerColor: ActivePlayer;
  isInstantUndo: boolean;
  recentUndoCount: number;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    analyzePreMove?: (board: BoardMatrix, playerColor: ActivePlayer) => void;
    popLastEvaluation?: () => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
  };
}

export interface ResignContext {
  botConfig: LevelConfig;
  board: BoardMatrix;
  aiColor: ActivePlayer;
  isAiThinking: boolean;
  isLongThinking: boolean;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    finalizeMatchReview?: (result: 'win' | 'loss' | 'draw' | 'resign', opponentName: string, opponentLevel: number) => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
  };
}

export interface GameOverWinContext {
  botConfig: LevelConfig;
  oldLevel: number;
  prevStats: UserStats;
  newStats: UserStats;
  moveCount: number;
  hadComeback: boolean;
  undoCount: number;
  wasUndoJustUsed: boolean;
  botEverHadOpenThreat: boolean;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    finalizeMatchReview?: (result: 'win' | 'loss' | 'draw' | 'resign', opponentName: string, opponentLevel: number) => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
    playLevelUpSound?: () => void;
    setShowLevelUpAlert?: (level: LevelConfig) => void;
    setSafeTimeout?: (fn: () => void, delay: number) => void;
    clearActivePuzzle?: () => void;
  };
}

export interface GameOverLossContext {
  botConfig: LevelConfig;
  moveCount: number;
  durationMs: number;
  winningMove?: { row: number; col: number } | null;
  wasLastGameSpeedLoss: boolean;
  isHeavyLossStreak: boolean;
  isImmediateRevenge: boolean;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    finalizeMatchReview?: (result: 'win' | 'loss' | 'draw' | 'resign', opponentName: string, opponentLevel: number) => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
    clearActivePuzzle?: () => void;
  };
}

export interface GameOverDrawContext {
  botConfig: LevelConfig;
  consecutiveDrawsCount: number;
  services: {
    triggerTutorSpeech?: (event: TutorGeneralEvent, context?: TutorDialogueContext) => void;
    finalizeMatchReview?: (result: 'win' | 'loss' | 'draw' | 'resign', opponentName: string, opponentLevel: number) => void;
    triggerTaunt?: (event: TauntEvent, priority?: number) => void;
    clearActivePuzzle?: () => void;
  };
}

export interface GameModeStrategy {
  readonly mode: GameMode;

  /**
   * Xác định cấu hình AI tương ứng với chế độ chơi này
   */
  getBotLevel(ctx: BotLevelContext | UserStats, customConfig?: { botLevel?: number }): LevelConfig;

  /**
   * Xác định phe quân cho ván tiếp theo trong chuỗi ván
   */
  getNextSeriesPlayerSide(ctx: SeriesPlayerSideContext): boolean;

  /**
   * Lấy chuỗi thắng hiện tại của chế độ
   */
  getCurrentStreak(stats: UserStats): number;

  /**
   * Lấy tiêu đề hiển thị kết thúc ván đấu
   */
  getGameOverTitle(ctx: GameOverPresentationContext): { text: string; color: string };

  /**
   * Lấy mô tả chi tiết kết thúc ván đấu
   */
  getGameOverDescription(ctx: GameOverPresentationContext): string;

  /**
   * Lấy tên tóm tắt chế độ
   */
  getModeSummary(ctx: GameOverPresentationContext): string;

  /**
   * Định dạng chuỗi hiển thị số nước đi
   */
  getMoveCountDisplay(historyLength: number, puzzleInitialLength?: number): string;

  /**
   * Kiểm tra xem có hiển thị BotCharacter (Nhân vật đối thủ & câu thoại cà khịa) trên bàn cờ hay không
   */
  shouldShowBotCharacter(): boolean;

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
    extra?: { stars?: number; botLevel?: number; isTimeout?: boolean; timeSeconds?: 5 | 10 | 15 }
  ): UserStats;

  /**
   * Lifecycle Hook: Khi bắt đầu ván mới
   */
  onGameStart(ctx: GameStartContext): void;

  /**
   * Lifecycle Hook: Khi bắt đầu lượt của Người chơi (sau khi bot đi hoặc ván mới)
   */
  onPlayerTurnStart(ctx: PlayerTurnStartContext): void;

  /**
   * Lifecycle Hook: Sau khi Người chơi vừa hạ quân
   */
  onPlayerMove(ctx: PlayerMoveContext): void;

  /**
   * Lifecycle Hook: Khi Người chơi thực hiện Đi Lại (Undo)
   */
  onUndo(ctx: UndoContext): void;

  /**
   * Lifecycle Hook: Khi Người chơi Đầu hàng (Resign)
   */
  onResign(ctx: ResignContext): void;

  /**
   * Lifecycle Hook: Khi Người chơi Thắng trận
   */
  onPlayerWin(ctx: GameOverWinContext): void;

  /**
   * Lifecycle Hook: Khi Bot Thắng trận
   */
  onBotWin(ctx: GameOverLossContext): void;

  /**
   * Lifecycle Hook: Khi Ván cờ Hòa
   */
  onDraw(ctx: GameOverDrawContext): void;
}
