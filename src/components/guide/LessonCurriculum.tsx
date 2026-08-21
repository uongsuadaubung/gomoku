import { Component, For, Show, createSignal, createEffect } from 'solid-js';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  Compass,
  Flame,
  Sparkles,
  Zap,
  Award,
  Shield,
  Clock,
  GraduationCap,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { GUIDE_CHAPTERS, getAllLessons } from '../../data/guide/lessons';
import type { GuideChapter, GuideLesson } from '../../data/guide/types';

export const LessonCurriculum: Component = () => {
  const store = useGame();
  const [expandedChapter, setExpandedChapter] = createSignal<number>(
    store.currentLesson().chapterId || 1
  );

  // Tự động mở rộng chương chứa bài học đang chọn
  createEffect(() => {
    const chapterId = store.currentLesson().chapterId;
    if (chapterId) {
      setExpandedChapter(chapterId);
    }
  });

  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass size={18} class="text-sky-400" />;
      case 'Flame':
        return <Flame size={18} class="text-amber-400" />;
      case 'Sparkles':
        return <Sparkles size={18} class="text-purple-400" />;
      case 'Zap':
        return <Zap size={18} class="text-yellow-400" />;
      case 'Clock':
        return <Clock size={18} class="text-indigo-400" />;
      case 'Award':
        return <Award size={18} class="text-rose-400" />;
      case 'GraduationCap':
      case 'BookOpen':
        return <GraduationCap size={18} class="text-amber-400" />;
      case 'Shield':
      default:
        return <Shield size={18} class="text-emerald-400" />;
    }
  };

  const getDifficultyBadge = (difficulty: GuideLesson['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return (
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Cơ bản
          </span>
        );
      case 'intermediate':
        return (
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Trung cấp
          </span>
        );
      case 'advanced':
        return (
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Nâng cao
          </span>
        );
      case 'master':
      default:
        return (
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Cao thủ
          </span>
        );
    }
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter(prev => (prev === chapterId ? -1 : chapterId));
  };

  return (
    <div class="w-full flex flex-col gap-3.5 select-none">
      {/* 1. Header Card & Tiến độ tổng thể */}
      <div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 shadow-lg">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 class="text-sm font-black text-white flex items-center gap-1.5">
                Kỳ Viện Bách Khoa
              </h3>
              <p class="text-[11px] text-indigo-200/70 font-medium">
                Giáo trình Gomoku chuẩn {GUIDE_CHAPTERS.length} chương ({getAllLessons().length} bài)
              </p>
            </div>
          </div>

          <div class="text-right">
            <span class="text-xs font-black text-indigo-300">
              {store.completedLessonsSet().size} / {getAllLessons().length} Bài
            </span>
            <p class="text-[10px] text-slate-400 font-bold">{store.progressPercent()}%</p>
          </div>
        </div>

        {/* Thanh Tiến Độ Progress Bar */}
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative mt-1">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${store.progressPercent()}%` }}
          />
        </div>
      </div>

      {/* 2. Danh Sách 6 Chương & Bài Học (Mở rộng tự nhiên, hiển thị trọn vẹn 100% các bài học) */}
      <div class="flex flex-col gap-2.5 w-full">
        <For each={GUIDE_CHAPTERS}>
          {chapter => {
            const isExpanded = () => expandedChapter() === chapter.id;
            const completedInChapter = () =>
              chapter.lessons.filter(l => store.completedLessonsSet().has(l.id)).length;
            const isChapterUnlocked = () => store.unlockedChaptersSet().has(chapter.id);

            return (
              <div class="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all duration-200">
                {/* Chapter Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  class="w-full p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors text-left"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getChapterIcon(chapter.iconName)}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-extrabold text-white">{chapter.vietnameseTitle}</span>
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {chapter.badge}
                        </span>
                      </div>
                      <p class="text-[10px] text-slate-400 font-medium line-clamp-1">
                        {completedInChapter()} / {chapter.lessons.length} bài hoàn thành
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 text-slate-400">
                    <Show
                      when={completedInChapter() === chapter.lessons.length}
                      fallback={
                        <Show when={!isChapterUnlocked()}>
                          <Lock size={14} class="text-slate-500" />
                        </Show>
                      }
                    >
                      <CheckCircle2 size={16} class="text-emerald-400" />
                    </Show>
                    {isExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {/* Chapter Lessons List */}
                <Show when={isExpanded()}>
                  <div class="p-2 pt-0 flex flex-col gap-1.5 border-t border-slate-800/60 bg-slate-950/40">
                    <For each={chapter.lessons}>
                      {lesson => {
                        const isCurrent = () => store.currentLessonId() === lesson.id;
                        const isDone = () => store.completedLessonsSet().has(lesson.id);
                        const isUnlocked = () => store.isLessonUnlocked(lesson.id);

                        return (
                          <div
                            onClick={() => {
                              if (!isUnlocked()) return;
                              store.selectLesson(lesson.id);
                              store.setShowQuickLessonDrawer(false);
                            }}
                            class={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                              isCurrent()
                                ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-950/50 cursor-pointer'
                                : isDone()
                                ? 'bg-slate-900/60 border-emerald-500/20 hover:border-slate-700 cursor-pointer'
                                : isUnlocked()
                                ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 cursor-pointer'
                                : 'bg-slate-950/30 border-slate-900/80 opacity-50 cursor-not-allowed'
                            }`}
                            title={isUnlocked() ? lesson.title : 'Hoàn thành bài trước để mở khóa'}
                          >
                            <div class="flex items-center gap-2.5 min-w-0">
                              <div
                                class={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isDone()
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isCurrent()
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : isUnlocked()
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-slate-900 text-slate-600'
                                }`}
                              >
                                <Show
                                  when={isDone()}
                                  fallback={
                                    <Show when={isUnlocked()} fallback={<Lock size={12} class="text-slate-500" />}>
                                      <span>{lesson.order}</span>
                                    </Show>
                                  }
                                >
                                  <CheckCircle2 size={14} />
                                </Show>
                              </div>

                              <div class="min-w-0">
                                <h4
                                  class={`text-xs font-bold truncate ${
                                    isCurrent() ? 'text-indigo-200' : isUnlocked() ? 'text-slate-200' : 'text-slate-500'
                                  }`}
                                >
                                  {lesson.title}
                                </h4>
                                <div class="flex items-center gap-2 mt-0.5">
                                  {getDifficultyBadge(lesson.difficulty)}
                                  <span class="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                    <Clock size={10} /> {lesson.durationMinutes}p
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Show when={isCurrent()}>
                              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500 text-white shrink-0 animate-pulse">
                                Đang học
                              </span>
                            </Show>

                            <Show when={!isUnlocked()}>
                              <Lock size={14} class="text-slate-600 shrink-0 mr-1" />
                            </Show>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
