import { Component, Show, For } from 'solid-js';
import {
  BookOpen,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Target,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { formatCoord } from '../../game/constants';
import { GUIDE_CHAPTERS } from '../../data/guide/lessons';

export const LessonPlayer: Component = () => {
  const store = useGame();

  const lesson = () => store.currentLesson();
  const step = () => store.currentStep();
  const feedback = () => store.lessonFeedback();
  const isDone = () => store.isStepCompleted();
  const nav = () => store.lessonIndexInfo();

  return (
    <div class="w-full flex flex-col gap-3 sm:gap-3.5 select-none">
      {/* 1. THANH ĐIỀU HƯỚNG NHANH CẤP TỐC (QUICK NAVIGATOR - ZERO SCROLLING) */}
      <div class="w-full flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-md">
        {/* Nút Bài Trước */}
        <button
          type="button"
          disabled={!nav().hasPrev}
          onClick={() => store.goToPrevLesson()}
          class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-bold flex items-center gap-1 transition-all border border-slate-700/80 shadow-sm"
          title="Chuyển sang bài trước"
        >
          <ChevronLeft size={15} />
          <span class="hidden sm:inline">Bài Trước</span>
        </button>

        {/* Nút Mở Khay Chọn Bài Nhanh (Teleport Drawer) */}
        <button
          type="button"
          onClick={() => store.setShowQuickLessonDrawer(true)}
          class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-800/90 to-indigo-950/80 hover:border-indigo-400 text-indigo-200 border border-indigo-500/40 text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm group"
          title={`Bấm để mở danh sách ${nav().total} bài học`}
        >
          <ListOrdered size={14} class="text-indigo-400 group-hover:scale-110 transition-transform" />
          <span class="text-white">Bài {nav().index} / {nav().total}</span>
          <span class="text-indigo-300/80 text-[10px] hidden md:inline font-normal max-w-[150px] truncate">
            ({lesson().title})
          </span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
            Đổi bài ▼
          </span>
        </button>

        {/* Nút Bài Sau */}
        <button
          type="button"
          disabled={!nav().hasNext}
          onClick={() => store.goToNextLesson()}
          class={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
            nav().hasNext
              ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/80'
              : 'bg-slate-900/50 text-slate-500 border-slate-800/50 cursor-not-allowed opacity-50'
          }`}
          title={
            nav().hasNext
              ? 'Chuyển sang bài kế tiếp'
              : !nav().isCurrentCompleted && nav().index < nav().total
              ? 'Cần hoàn thành bài học này để mở khóa bài tiếp theo'
              : 'Đã là bài cuối cùng'
          }
        >
          <span class="hidden sm:inline">Bài Sau</span>
          <Show when={!nav().isCurrentCompleted && nav().index < nav().total}>
            <Lock size={12} class="text-amber-400/80" />
          </Show>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* 2. BẢNG PHẢN HỒI CHIẾN THUẬT NGAY ĐẦU TRANG KHI ĐÃ ĐÁNH (THÀNH CÔNG HOẶC THẤT BẠI) */}
      <Show when={feedback()}>
        {fb => (
          <div
            class={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-xl animate-fade-in ${
              fb().quality === 'best' || fb().quality === 'good'
                ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-400/60 shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-400/60 shadow-rose-950/40 ring-1 ring-rose-500/30'
            }`}
          >
            <div class="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <div class="flex items-center gap-2.5">
                {fb().quality === 'best' || fb().quality === 'good' ? (
                  <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                    <CheckCircle size={20} />
                  </div>
                ) : (
                  <div class="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                )}
                <div>
                  <h4
                    class={`text-xs sm:text-sm font-black ${
                      fb().quality === 'best' || fb().quality === 'good'
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {fb().quality === 'best' || fb().quality === 'good'
                      ? 'Nước Cờ Xuất Sắc (Chuẩn Nguyên Lý)!'
                      : 'Nước Cờ Chưa Chuẩn!'}
                  </h4>
                  <span class="text-[10px] text-slate-400 font-mono font-bold">
                    Tọa độ đã chọn: <strong class="text-white">{formatCoord(fb().row, fb().col)}</strong>
                  </span>
                </div>
              </div>

              {/* Badges */}
              <span
                class={`text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm ${
                  fb().quality === 'best' || fb().quality === 'good'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {fb().quality === 'best'
                  ? '★ TỐI ƯU'
                  : fb().quality === 'good'
                  ? 'TỐT'
                  : 'SƠ HỞ'}
              </span>
            </div>

            {/* Phân tích vì sao đúng / sai */}
            <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1">
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Phân tích chiến thuật:
              </span>
              <p class="text-xs font-medium text-slate-200 leading-relaxed">
                {fb().explanation}
              </p>
            </div>

            {/* Giải thích nước phản công của đối thủ nếu đi sai */}
            <Show when={fb().opponentExplanation}>
              <div class="mt-2.5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-200 font-medium leading-relaxed">
                <span class="font-bold text-rose-300">⚔️ Hậu Quả & Đòn Phản Công Của Đối Thủ: </span>
                {fb().opponentExplanation}
              </div>
            </Show>

            {/* Nút Hành Động: Thử Lại hoặc Bài Tiếp Theo */}
            <div class="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => store.resetCurrentLesson()}
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 shadow-sm"
              >
                <RotateCcw size={13} />
                <span>Thử Lại</span>
              </button>

              <Show when={isDone()}>
                <button
                  type="button"
                  onClick={() => store.nextLessonStep()}
                  class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Show
                    when={store.currentStepIndex() < lesson().steps.length - 1}
                    fallback={<span>Bài Tiếp Theo</span>}
                  >
                    <span>Bước Tiếp Theo</span>
                  </Show>
                  <ArrowRight size={14} />
                </button>
              </Show>
            </div>
          </div>
        )}
      </Show>

      {/* 3. THẺ BÀI HỌC CHÍNH: LÝ THUYẾT & NGUYÊN LÝ HIỂN THỊ TRỰC TIẾP 100% */}
      <div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900/95 to-slate-950/95 border border-indigo-500/30 shadow-xl backdrop-blur-md space-y-3">
        
        {/* A. Header Bài Học */}
        <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80 flex-wrap">
          <div>
            <div class="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
              <span>Chương {lesson().chapterId}</span>
              <span>•</span>
              <span>Bài {lesson().order}</span>
            </div>
            <h2 class="text-sm sm:text-base font-black text-white mt-0.5">{lesson().title}</h2>
            <p class="text-[11px] text-indigo-200/80 font-medium">{lesson().subtitle}</p>
          </div>

          {/* Tags Khái Niệm Cốt Lõi */}
          <div class="flex items-center gap-1.5 flex-wrap">
            <For each={lesson().coreConcepts}>
              {tag => (
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  #{tag}
                </span>
              )}
            </For>
          </div>
        </div>

        {/* B. KHỐI LÝ THUYẾT & NGUYÊN LÝ CHIẾN THUẬT (HIỂN THỊ TRỰC TIẾP ĐẦY ĐỦ) */}
        <div class="p-3.5 rounded-2xl bg-slate-950/85 border border-indigo-500/30 space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-black text-sky-300">
            <div class="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <BookOpen size={15} />
            </div>
            <span>1. Lý Thuyết & Nguyên Lý Thế Cờ (Vì sao phải làm thế?):</span>
          </div>

          {/* Phân Tích Chuyên Sâu Chi Tiết Từng Nước Cờ */}
          <div class="whitespace-pre-line text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/90 font-normal">
            {lesson().detailedArticle || lesson().description}
          </div>

          {/* Bí Kíp Đúc Kết Cốt Lõi */}
          <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2 text-emerald-200">
            <Sparkles size={14} class="text-emerald-400 shrink-0 mt-0.5" />
            <div class="text-[11px] leading-relaxed">
              <strong class="text-emerald-300 font-black">Bí kíp cốt lõi: </strong>
              <span>{lesson().summaryTakeaway}</span>
            </div>
          </div>
        </div>

        {/* C. KHỐI NHIỆM VỤ THỰC HÀNH CẦM TAY CHỈ VIỆC */}
        <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-black text-amber-300">
              <div class="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Target size={15} />
              </div>
              <span>2. Nhiệm Vụ Thực Hành Của Bạn:</span>
            </div>

            {/* Nút Xem Gợi Ý */}
            <button
              type="button"
              onClick={() => store.setShowHint(!store.showHint())}
              class={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all ${
                store.showHint()
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Lightbulb size={12} />
              <span>{store.showHint() ? 'Ẩn Gợi Ý' : 'Gợi Ý'}</span>
            </button>
          </div>

          <p class="text-xs font-semibold text-amber-100 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/20">
            {step().instruction}
          </p>

          {/* Gợi Ý Chiến Thuật */}
          <Show when={store.showHint() && step().hint}>
            <div class="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-1.5 animate-fade-in">
              <Lightbulb size={13} class="text-amber-400 shrink-0 mt-0.5" />
              <span><strong class="text-amber-300">Gợi ý:</strong> {step().hint}</span>
            </div>
          </Show>
        </div>
      </div>

      {/* 4. KHAY CHỌN BÀI HỌC NHANH (TELEPORT DRAWER MODAL) */}
      <Show when={store.showQuickLessonDrawer()}>
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div class="w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Drawer Header */}
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ListOrdered size={20} />
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black text-white">Chọn Bài Học Nhanh ({nav().total} Bài)</h3>
                  <p class="text-xs text-indigo-300 font-medium">Bấm vào bất kỳ bài nào để tải bài học ngay lập tức</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => store.setShowQuickLessonDrawer(false)}
                class="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content: Danh Sách 8 Chương & 28 Bài */}
            <div class="flex-1 overflow-y-auto py-3 space-y-3 pr-1 custom-scrollbar">
              <For each={GUIDE_CHAPTERS}>
                {chapter => {
                  const completedInChapter = () =>
                    chapter.lessons.filter(l => store.completedLessonsSet().has(l.id)).length;

                  return (
                    <div class="rounded-2xl bg-slate-950/60 border border-slate-800 p-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-black text-indigo-300">
                            Chương {chapter.id}: {chapter.vietnameseTitle}
                          </span>
                          <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {chapter.badge}
                          </span>
                        </div>
                        <span class="text-[10px] text-slate-400 font-medium">
                          {completedInChapter()} / {chapter.lessons.length} bài
                        </span>
                      </div>

                      {/* Danh sách bài trong chương */}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <For each={chapter.lessons}>
                          {item => {
                            const isCurrent = () => store.currentLessonId() === item.id;
                            const isDone = () => store.completedLessonsSet().has(item.id);
                            const isUnlocked = () => store.isLessonUnlocked(item.id);

                            return (
                              <button
                                type="button"
                                disabled={!isUnlocked()}
                                onClick={() => {
                                  if (!isUnlocked()) return;
                                  store.selectLesson(item.id);
                                  store.setShowQuickLessonDrawer(false);
                                }}
                                class={`p-2 rounded-xl text-left border flex items-center justify-between gap-2 transition-all ${
                                  isCurrent()
                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                                    : isDone()
                                    ? 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/20'
                                    : isUnlocked()
                                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                                    : 'bg-slate-950/40 text-slate-500 border-slate-900/80 cursor-not-allowed opacity-50'
                                }`}
                                title={isUnlocked() ? item.title : 'Hoàn thành bài học trước để mở khóa bài này'}
                              >
                                <div class="flex items-center gap-2 min-w-0">
                                  <div
                                    class={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                      isCurrent()
                                        ? 'bg-white text-indigo-950'
                                        : isDone()
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : isUnlocked()
                                        ? 'bg-slate-800 text-slate-400'
                                        : 'bg-slate-900 text-slate-600'
                                    }`}
                                  >
                                    <Show
                                      when={isDone()}
                                      fallback={
                                        <Show when={isUnlocked()} fallback={<Lock size={11} class="text-slate-500" />}>
                                          <span>{item.order}</span>
                                        </Show>
                                      }
                                    >
                                      <CheckCircle2 size={12} />
                                    </Show>
                                  </div>
                                  <span class="text-xs font-bold truncate">{item.title}</span>
                                </div>
                                <Show when={!isUnlocked()}>
                                  <Lock size={12} class="text-slate-600 shrink-0" />
                                </Show>
                              </button>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
