import { Component, Show } from 'solid-js';
import { BookOpen, Activity, ArrowLeft } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { LessonPlayer } from './LessonPlayer';
import { SandboxInspector } from './SandboxInspector';

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
        <LessonPlayer />
      </Show>
    </div>
  );
};
