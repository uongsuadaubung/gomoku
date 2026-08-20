import { createSignal, createMemo } from 'solid-js';
import {
  BLACK,
  WHITE,
  EMPTY,
  type ActivePlayer,
  type BoardMatrix,
  type Move,
  type UserStats,
} from '../../game/types';
import { createEmptyBoard, cloneBoard } from '../../game/board';
import {
  GUIDE_CHAPTERS,
  getAllLessons,
  getLessonById,
} from '../../data/guide/lessons';
import { PRESET_BOARDS, getPresetById } from '../../data/guide/presets';
import { GuideEngine } from '../../game/guideEngine';
import type {
  GuideLesson,
  LessonStep,
  GuideMoveFeedback,
  HeatmapCell,
  WhatIfStep,
  PresetBoard,
} from '../../data/guide/types';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storageService';

interface GuideSliceDeps {
  stats: () => UserStats;
  setStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
  syncBoardToMain: (board: BoardMatrix, turn: ActivePlayer) => void;
}

export function createGuideSlice(deps: GuideSliceDeps) {
  const allLessons = getAllLessons();

  // Lấy bài học cần tiếp tục: Luôn ưu tiên chính xác bài học mà người chơi đã chọn gần nhất
  function getNextLessonToPlay(): string {
    const savedLast = deps.stats().guide?.lastSelectedLessonId;
    
    // 1. Nếu có bài đã chọn gần nhất -> Mở chính xác bài đó
    if (savedLast && getLessonById(savedLast)) {
      return savedLast;
    }

    // 2. Nếu chưa có -> Mở bài đầu tiên chưa hoàn thành
    const completed = new Set(deps.stats().guide?.completedLessons || []);
    const firstUncompleted = allLessons.find(l => !completed.has(l.id));
    if (firstUncompleted) {
      return firstUncompleted.id;
    }

    return allLessons[0]?.id || 'lesson_1_1';
  }

  // 1. Tab hiện tại: 'lessons' (Lộ trình bài học) | 'sandbox' (Phòng phân tích tự do)
  const [guideTab, setGuideTab] = createSignal<'lessons' | 'sandbox'>('lessons');

  // 2. State Quản lý Bài Học (Lessons)
  const [currentLessonId, setCurrentLessonId] = createSignal<string>(getNextLessonToPlay());
  const [currentStepIndex, setCurrentStepIndex] = createSignal<number>(0);
  const [lessonFeedback, setLessonFeedback] = createSignal<GuideMoveFeedback | null>(null);
  const [isStepCompleted, setIsStepCompleted] = createSignal<boolean>(false);
  const [showHint, setShowHint] = createSignal<boolean>(false);
  const [showTheoryModal, setShowTheoryModal] = createSignal<boolean>(false);
  const [showQuickLessonDrawer, setShowQuickLessonDrawer] = createSignal<boolean>(false);
  const [lessonViewMode, setLessonViewMode] = createSignal<'player' | 'curriculum'>('player');
  const [lessonBoard, setLessonBoard] = createSignal<BoardMatrix>(createEmptyBoard());

  // Thông tin bài học hiện tại
  const currentLesson = createMemo(() => {
    return getLessonById(currentLessonId()) || allLessons[0];
  });

  // Lấy bước thực hành hiện tại
  const currentStep = createMemo<LessonStep>(() => {
    const lesson = currentLesson();
    return lesson.steps[currentStepIndex()] || lesson.steps[0];
  });

  // 3. State Quản lý Sandbox & Phân Tích
  const [sandboxBoard, setSandboxBoard] = createSignal<BoardMatrix>(createEmptyBoard());
  const [sandboxTurn, setSandboxTurn] = createSignal<ActivePlayer>(BLACK);
  const [showHeatmap, setShowHeatmap] = createSignal<boolean>(true);
  const [showQualityBadges, setShowQualityBadges] = createSignal<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = createSignal<string | null>(null);
  const [selectedSandboxCell, setSelectedSandboxCell] = createSignal<Move | null>(null);
  const [whatIfSteps, setWhatIfSteps] = createSignal<WhatIfStep[]>([]);
  const [isSimulatingWhatIf, setIsSimulatingWhatIf] = createSignal<boolean>(false);

  // Tính toán Heatmap trong Sandbox
  const sandboxHeatmap = createMemo<HeatmapCell[]>(() => {
    if (guideTab() !== 'sandbox' || !showHeatmap()) return [];
    return GuideEngine.calculateHeatmap(sandboxBoard(), sandboxTurn());
  });

  // Tính toán Eval Bar trong Sandbox
  const sandboxEval = createMemo(() => {
    return GuideEngine.calculateEvaluation(sandboxBoard());
  });

  // Thuyết minh chi tiết cho ô đang chọn/hover
  const selectedCellExplanation = createMemo(() => {
    const cell = selectedSandboxCell();
    if (!cell) return null;
    return GuideEngine.getDetailedExplanation(sandboxBoard(), cell, sandboxTurn());
  });

  // Thống kê tiến độ học tập
  const completedLessonsSet = createMemo<Set<string>>(() => {
    return new Set(deps.stats().guide?.completedLessons || []);
  });

  const unlockedChaptersSet = createMemo<Set<number>>(() => {
    return new Set(deps.stats().guide?.unlockedChapters || [1]);
  });

  const progressPercent = createMemo<number>(() => {
    const total = allLessons.length;
    if (total === 0) return 0;
    const completed = completedLessonsSet().size;
    return Math.round((completed / total) * 100);
  });

  // Kiểm tra 1 bài học bất kỳ đã được mở khóa để học chưa
  function isLessonUnlocked(lessonId: string): boolean {
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true; // Bài đầu tiên luôn mở
    // Bài này đã hoàn thành -> Luôn mở
    if (completedLessonsSet().has(lessonId)) return true;
    // Hoặc bài liền trước đã hoàn thành -> Được phép mở bài này
    const prevLesson = allLessons[idx - 1];
    return completedLessonsSet().has(prevLesson.id);
  }

  // Thông tin điều hướng bài học (CHỈ CHO PHÉP NEXT KHI BÀI HIỆN TẠI ĐÃ ĐƯỢC HỌC HOÀN THÀNH)
  const lessonIndexInfo = createMemo(() => {
    const currentIdx = allLessons.findIndex(l => l.id === currentLessonId());
    const isCompleted = completedLessonsSet().has(currentLessonId()) || isStepCompleted();

    return {
      index: currentIdx + 1,
      total: allLessons.length,
      hasPrev: currentIdx > 0,
      hasNext: currentIdx < allLessons.length - 1 && isCompleted,
      isCurrentCompleted: isCompleted,
      prevLesson: currentIdx > 0 ? allLessons[currentIdx - 1] : null,
      nextLesson: currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null,
    };
  });

  // ==========================================
  // HÀNH ĐỘNG BÀI HỌC (LESSON ACTIONS)
  // ==========================================
  function selectLesson(lessonId: string, shouldPersist: boolean = true) {
    // Không cho phép chọn nếu bài chưa được mở khóa
    if (!isLessonUnlocked(lessonId)) return;

    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    setCurrentLessonId(lessonId);
    setCurrentStepIndex(0);
    setLessonFeedback(null);
    setIsStepCompleted(false);
    setShowHint(false);

    const initial = cloneBoard(lesson.steps[0].initialBoard);
    setLessonBoard(initial);
    deps.syncBoardToMain(initial, lesson.steps[0].playerColor);

    if (shouldPersist) {
      deps.setStats(prev => {
        if (prev.guide?.lastSelectedLessonId === lessonId) return prev;
        const updated: UserStats = {
          ...prev,
          guide: {
            ...prev.guide,
            lastSelectedLessonId: lessonId,
          },
        };
        StorageService.saveStats(updated);
        return updated;
      });
    }
  }

  function resumeLatestLesson() {
    const targetId = getNextLessonToPlay();
    selectLesson(targetId, true);
  }

  function resetCurrentLesson() {
    const step = currentStep();
    const initial = cloneBoard(step.initialBoard);
    setLessonBoard(initial);
    setLessonFeedback(null);
    setIsStepCompleted(false);
    setShowHint(false);
    deps.syncBoardToMain(initial, step.playerColor);
  }

  function markLessonCompleted(lessonId: string) {
    deps.setStats(prev => {
      const currentCompleted = prev.guide?.completedLessons || [];
      const newCompleted = currentCompleted.includes(lessonId) 
        ? currentCompleted 
        : [...currentCompleted, lessonId];
      
      const lesson = getLessonById(lessonId);
      const unlockedChapters = [...(prev.guide?.unlockedChapters || [1])];

      // Mở khóa chương kế tiếp nếu đã hoàn thành tất cả bài trong chương hiện tại
      if (lesson) {
        const chapter = GUIDE_CHAPTERS.find(ch => ch.id === lesson.chapterId);
        if (chapter) {
          const allChapterDone = chapter.lessons.every(l => newCompleted.includes(l.id));
          if (allChapterDone && !unlockedChapters.includes(chapter.id + 1)) {
            unlockedChapters.push(chapter.id + 1);
          }
        }
      }

      // Xác định bài học tiếp theo cần học
      const currentIdx = allLessons.findIndex(l => l.id === lessonId);
      let nextLessonId = lessonId;
      if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
        nextLessonId = allLessons[currentIdx + 1].id;
      }

      const updated: UserStats = {
        ...prev,
        guide: {
          ...prev.guide,
          completedLessons: newCompleted,
          unlockedChapters,
          totalLessonsCompleted: newCompleted.length,
          sandboxPresetLoadedCount: prev.guide?.sandboxPresetLoadedCount || 0,
          lastSelectedLessonId: nextLessonId,
        },
      };
      StorageService.saveStats(updated);
      return updated;
    });
  }

  function handleLessonMove(row: number, col: number): boolean {
    if (isStepCompleted()) return false;
    const step = currentStep();

    if (lessonBoard()[row][col] !== EMPTY) {
      soundService.playLossSound();
      return false;
    }

    const isTarget = step.targetMove.row === row && step.targetMove.col === col;
    const isAlternative = step.alternativeGoodMoves?.some(m => m.row === row && m.col === col);

    // Cập nhật quân cờ của người chơi lên bàn cờ bài học
    const newBoard = cloneBoard(lessonBoard());
    newBoard[row][col] = step.playerColor;

    if (isTarget || isAlternative) {
      // ĐI ĐÚNG!
      soundService.playStoneSound();
      soundService.playWinSound();
      setLessonBoard(newBoard);
      deps.syncBoardToMain(newBoard, step.playerColor);
      setIsStepCompleted(true);

      const specificFeedback = step.feedbacks.find(f => f.row === row && f.col === col);
      setLessonFeedback(
        specificFeedback || {
          row,
          col,
          quality: 'best',
          explanation: 'Chính xác tuyệt đối! Nước cờ hoàn hảo đạt tiêu chuẩn chiến thuật cao nhất.',
        }
      );

      // Nếu là bước cuối cùng của bài học -> Bắn pháo hoa và ghi nhận hoàn thành
      const lesson = currentLesson();
      if (currentStepIndex() >= lesson.steps.length - 1) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        markLessonCompleted(lesson.id);
      }
      return true;
    } else {
      // ĐI SAI!
      soundService.playStoneSound();
      soundService.playLossSound();

      const specificFeedback = step.feedbacks.find(f => f.row === row && f.col === col);
      const feedback = specificFeedback || {
        row,
        col,
        quality: 'blunder',
        explanation: 'Nước đi này chưa tối ưu hoặc để lộ sơ hở nguy hiểm cho đối thủ khai thác.',
      };

      // Nếu có nước phản công của đối thủ -> Mô phỏng đặt quân đối thủ để người học thấy ngay hậu quả
      if (feedback.opponentResponse) {
        const oppColor: ActivePlayer = step.playerColor === BLACK ? WHITE : BLACK;
        newBoard[feedback.opponentResponse.row][feedback.opponentResponse.col] = oppColor;
      }

      setLessonBoard(newBoard);
      deps.syncBoardToMain(newBoard, step.playerColor);
      setLessonFeedback(feedback);
      return false;
    }
  }

  function nextLessonStep() {
    const lesson = currentLesson();
    if (currentStepIndex() < lesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      const nextStep = lesson.steps[currentStepIndex()];
      const initial = cloneBoard(nextStep.initialBoard);
      setLessonBoard(initial);
      setLessonFeedback(null);
      setIsStepCompleted(false);
      setShowHint(false);
      deps.syncBoardToMain(initial, nextStep.playerColor);
    } else {
      // Chuyển sang bài học tiếp theo nếu có
      const currentIdx = allLessons.findIndex(l => l.id === currentLessonId());
      if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
        selectLesson(allLessons[currentIdx + 1].id);
      }
    }
  }

  // ==========================================
  // HÀNH ĐỘNG SANDBOX (SANDBOX ACTIONS)
  // ==========================================
  function startSandboxMode() {
    setGuideTab('sandbox');
    const empty = createEmptyBoard();
    setSandboxBoard(empty);
    setSandboxTurn(BLACK);
    setWhatIfSteps([]);
    setSelectedSandboxCell(null);
    setSelectedPresetId(null);
    deps.syncBoardToMain(empty, BLACK);
  }

  function handleSandboxCellClick(row: number, col: number) {
    const board = sandboxBoard();
    const cell = board[row][col];

    if (cell === EMPTY) {
      // Đặt quân cờ mới
      const nextBoard = cloneBoard(board);
      const currentTurn = sandboxTurn();
      nextBoard[row][col] = currentTurn;
      soundService.playStoneSound();

      const nextTurn: ActivePlayer = currentTurn === BLACK ? WHITE : BLACK;
      setSandboxBoard(nextBoard);
      setSandboxTurn(nextTurn);
      setWhatIfSteps([]);
      setSelectedSandboxCell({ row, col });
      deps.syncBoardToMain(nextBoard, nextTurn);
    } else {
      // Click vào quân đã có -> Xóa quân cờ
      const nextBoard = cloneBoard(board);
      nextBoard[row][col] = EMPTY;
      soundService.playClickSound();
      setSandboxBoard(nextBoard);
      setWhatIfSteps([]);
      setSelectedSandboxCell(null);
      deps.syncBoardToMain(nextBoard, sandboxTurn());
    }
  }

  function clearSandbox() {
    const empty = createEmptyBoard();
    setSandboxBoard(empty);
    setSandboxTurn(BLACK);
    setWhatIfSteps([]);
    setSelectedSandboxCell(null);
    setSelectedPresetId(null);
    deps.syncBoardToMain(empty, BLACK);
  }

  function toggleSandboxTurn() {
    const nextTurn: ActivePlayer = sandboxTurn() === BLACK ? WHITE : BLACK;
    setSandboxTurn(nextTurn);
    deps.syncBoardToMain(sandboxBoard(), nextTurn);
  }

  function loadPreset(presetId: string) {
    const preset = getPresetById(presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    const newBoard = cloneBoard(preset.board);
    setSandboxBoard(newBoard);
    setSandboxTurn(preset.turnPlayer);
    setWhatIfSteps([]);
    setSelectedSandboxCell(preset.recommendedMove || null);
    deps.syncBoardToMain(newBoard, preset.turnPlayer);

    deps.setStats(prev => {
      const count = (prev.guide?.sandboxPresetLoadedCount || 0) + 1;
      const updated = {
        ...prev,
        guide: {
          ...prev.guide,
          sandboxPresetLoadedCount: count,
        },
      };
      StorageService.saveStats(updated);
      return updated;
    });
  }

  function simulateWhatIf(row: number, col: number) {
    if (sandboxBoard()[row][col] !== EMPTY) return;
    setIsSimulatingWhatIf(true);
    const steps = GuideEngine.simulateFutureLine(sandboxBoard(), { row, col }, sandboxTurn(), 5);
    setWhatIfSteps(steps);
    setSelectedSandboxCell({ row, col });
    setIsSimulatingWhatIf(false);
  }

  function clearWhatIf() {
    setWhatIfSteps([]);
  }

  function goToPrevLesson() {
    const currentIdx = allLessons.findIndex(l => l.id === currentLessonId());
    if (currentIdx > 0) {
      selectLesson(allLessons[currentIdx - 1].id, true);
    }
  }

  function goToNextLesson() {
    const currentIdx = allLessons.findIndex(l => l.id === currentLessonId());
    if (currentIdx < allLessons.length - 1) {
      const isCompleted = completedLessonsSet().has(currentLessonId()) || isStepCompleted();
      if (!isCompleted) return; // CHỈ CHO PHÉP NEXT KHI BÀI ĐÃ ĐƯỢC HỌC
      selectLesson(allLessons[currentIdx + 1].id, true);
    }
  }

  return {
    // Signals
    guideTab,
    setGuideTab,
    currentLessonId,
    currentLesson,
    currentStepIndex,
    currentStep,
    lessonFeedback,
    isStepCompleted,
    showHint,
    setShowHint,
    showTheoryModal,
    setShowTheoryModal,
    showQuickLessonDrawer,
    setShowQuickLessonDrawer,
    lessonViewMode,
    setLessonViewMode,
    lessonIndexInfo,
    isLessonUnlocked,
    lessonBoard,
    sandboxBoard,
    sandboxTurn,
    showHeatmap,
    setShowHeatmap,
    showQualityBadges,
    setShowQualityBadges,
    selectedPresetId,
    selectedSandboxCell,
    setSelectedSandboxCell,
    whatIfSteps,
    isSimulatingWhatIf,
    sandboxHeatmap,
    sandboxEval,
    selectedCellExplanation,
    completedLessonsSet,
    unlockedChaptersSet,
    progressPercent,

    // Actions
    selectLesson,
    resumeLatestLesson,
    getNextLessonToPlay,
    resetCurrentLesson,
    handleLessonMove,
    nextLessonStep,
    goToPrevLesson,
    goToNextLesson,
    startSandboxMode,
    handleSandboxCellClick,
    clearSandbox,
    toggleSandboxTurn,
    loadPreset,
    simulateWhatIf,
    clearWhatIf,
  };
}
