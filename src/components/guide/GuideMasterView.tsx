import { Component, Show } from 'solid-js';
import { BookOpen, Activity, ArrowLeft, Target, Map } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { LessonCurriculum } from './LessonCurriculum';
import { LessonPlayer } from './LessonPlayer';
import { SandboxInspector } from './SandboxInspector';
import { GUIDE_CHAPTERS } from '../../data/guide/lessons';

export const GuideMasterView: Component = () => {
  const store = useGame();

  return (
    <div class="w-full flex flex-col gap-3 sm:gap-3.5 select-none">
      {/* 1. Thanh Chuyển Đổi Tab Chính (Tab Switcher) & Nút Trở Về */}
      <div class="w-full flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => {
              store.setGuideTab('lessons');
              store.selectLesson(store.currentLessonId());
            }}
            class={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              store.guideTab() === 'lessons'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>📖 Kỳ Viện ({store.lessonIndexInfo().total} Bài)</span>
          </button>

          <button
            type="button"
            onClick={() => store.startSandboxMode()}
            class={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              store.guideTab() === 'sandbox'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} />
            <span>🔬 Phòng Giả Lập Radar</span>
          </button>
        </div>

        {/* Nút Quay Về Menu Chính */}
        <button
          type="button"
          onClick={() => store.goToMainMenu()}
          class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 transition-all shadow-sm"
        >
          <ArrowLeft size={13} />
          <span>Về Menu</span>
        </button>
      </div>

      {/* 2. Nội Dung Theo Tab Đang Chọn */}
      <Show
        when={store.guideTab() === 'lessons'}
        fallback={<SandboxInspector />}
      >
        <div class="w-full flex flex-col gap-2.5">
          {/* Sub-Nav Chuyển Đổi Nhanh Giữa Bàn Học Tập Trung & Lộ Trình 8 Chương */}
          <div class="w-full flex items-center justify-between gap-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div class="flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => store.setLessonViewMode('player')}
                class={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  store.lessonViewMode() === 'player'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Target size={13} />
                <span>Bàn Học & Thực Hành</span>
              </button>

              <button
                type="button"
                onClick={() => store.setLessonViewMode('curriculum')}
                class={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  store.lessonViewMode() === 'curriculum'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Map size={13} />
                <span>Bản Đồ {GUIDE_CHAPTERS.length} Chương</span>
              </button>
            </div>

            <span class="text-[11px] text-slate-400 font-medium px-2 hidden sm:inline">
              Đã xong {store.completedLessonsSet().size}/{store.lessonIndexInfo().total} bài ({store.progressPercent()}%)
            </span>
          </div>

          {/* Hiển thị View Mode tương ứng */}
          <Show
            when={store.lessonViewMode() === 'player'}
            fallback={<LessonCurriculum />}
          >
            <LessonPlayer />
          </Show>
        </div>
      </Show>
    </div>
  );
};
