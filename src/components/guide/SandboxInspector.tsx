import { Component, For, Show, createSignal } from 'solid-js';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Flame,
  Zap,
  Play,
  Trash2,
  HelpCircle,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE, EMPTY } from '../../game/types';
import { PRESET_BOARDS } from '../../data/guide/presets';
import { formatCoord } from '../../game/constants';

export const SandboxInspector: Component = () => {
  const store = useGame();
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');

  const evalData = () => store.sandboxEval();
  const explanation = () => store.selectedCellExplanation();
  const whatIfList = () => store.whatIfSteps();

  const filteredPresets = () => {
    const cat = selectedCategory();
    if (cat === 'all') return PRESET_BOARDS;
    return PRESET_BOARDS.filter(p => p.category === cat);
  };

  return (
    <div class="w-full flex flex-col gap-3 sm:gap-3.5 select-none">
      {/* 1. THANH ĐÁNH GIÁ THẾ TRẬN (EVALUATION BAR & WIN PROBABILITY) */}
      <div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity size={16} />
            </div>
            <span class="text-xs font-black text-white">Đánh Giá Thế Trận</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono font-bold">
            <span class="text-slate-300">Đen: {evalData().winProbabilityBlack}%</span>
            <span class="text-slate-500">|</span>
            <span class="text-slate-400">Trắng: {100 - evalData().winProbabilityBlack}%</span>
          </div>
        </div>

        {/* Thanh Eval Bar song phương */}
        <div class="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700/80">
          <div
            class="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_8px_#06b6d4]"
            style={{ width: `${evalData().winProbabilityBlack}%` }}
          />
          <div
            class="h-full bg-rose-500 transition-all duration-300 shadow-[0_0_8px_#f43f5e]"
            style={{ width: `${100 - evalData().winProbabilityBlack}%` }}
          />
        </div>

        <p class="text-[11px] text-slate-300 font-medium mt-2 leading-tight">
          💡 {evalData().summaryText}
        </p>
      </div>

      {/* 2. THANH CÔNG CỤ ĐIỀU KHIỂN BÀN CỜ (SANDBOX TOOLBAR) */}
      <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 flex-wrap shadow-md">
        {/* Nút Đổi Lượt Đi */}
        <button
          type="button"
          onClick={() => store.toggleSandboxTurn()}
          class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
        >
          <span
            class={`w-2.5 h-2.5 rounded-full ${
              store.sandboxTurn() === BLACK
                ? 'bg-slate-950 border border-white'
                : 'bg-white border border-slate-900'
            }`}
          />
          <span>Lượt: {store.sandboxTurn() === BLACK ? 'Đen' : 'Trắng'}</span>
        </button>

        {/* Nút Bật/Tắt Heatmap */}
        <button
          type="button"
          onClick={() => store.setShowHeatmap(!store.showHeatmap())}
          class={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            store.showHeatmap()
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {store.showHeatmap() ? <Eye size={13} /> : <EyeOff size={13} />}
          <span>Radar Heatmap</span>
        </button>

        {/* Nút Bật/Tắt Nhãn Đánh Giá */}
        <button
          type="button"
          onClick={() => store.setShowQualityBadges(!store.showQualityBadges())}
          class={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            store.showQualityBadges()
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Layers size={13} />
          <span>Nhãn Phân Loại</span>
        </button>

        {/* Nút Xóa Bàn Cờ */}
        <button
          type="button"
          onClick={() => store.clearSandbox()}
          class="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all"
        >
          <Trash2 size={13} />
          <span>Xóa Bàn</span>
        </button>
      </div>

      {/* 3. BỘ NẠP THẾ TRẬN MẪU (PRESET OPENINGS & TACTICS SELECTOR) */}
      <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-black text-slate-200 flex items-center gap-1.5">
            <Sparkles size={14} class="text-amber-400" /> Thư Viện Thế Trận Mẫu ({PRESET_BOARDS.length})
          </span>

          {/* Category Filter Pills */}
          <div class="flex items-center gap-1 text-[10px] overflow-x-auto custom-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              class={`px-2 py-0.5 rounded-md font-bold transition-all ${
                selectedCategory() === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('opening_direct')}
              class={`px-2 py-0.5 rounded-md font-bold transition-all ${
                selectedCategory() === 'opening_direct'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Trực Tiếp
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('opening_indirect')}
              class={`px-2 py-0.5 rounded-md font-bold transition-all ${
                selectedCategory() === 'opening_indirect'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Gián Tiếp
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('tactical_fork')}
              class={`px-2 py-0.5 rounded-md font-bold transition-all ${
                selectedCategory() === 'tactical_fork'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Đòn Bẫy 4-3
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('vcf_chain')}
              class={`px-2 py-0.5 rounded-md font-bold transition-all ${
                selectedCategory() === 'vcf_chain'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              VCF/VCT
            </button>
          </div>
        </div>

        {/* Presets List Horizontal Carousel */}
        <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <For each={filteredPresets()}>
            {preset => {
              const isSelected = () => store.selectedPresetId() === preset.id;
              return (
                <button
                  type="button"
                  onClick={() => store.loadPreset(preset.id)}
                  class={`p-2.5 rounded-xl border text-left shrink-0 w-44 transition-all ${
                    isSelected()
                      ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div class="text-[10px] font-black text-indigo-400">{preset.categoryName}</div>
                  <h4 class="text-xs font-bold text-white truncate mt-0.5">{preset.name}</h4>
                  <p class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.description}</p>
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* 4. BẢNG THUYẾT MINH NƯỚC ĐI & MÔ PHỎNG WHAT-IF (TACTICAL INSPECTOR) */}
      <Show
        when={explanation()}
        fallback={
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs font-medium text-slate-400">
            👆 Click vào ô bất kỳ trên bàn cờ hoặc nạp thế cờ mẫu để xem AI phân tích nước Tốt vs Xấu.
          </div>
        }
      >
        {exp => (
          <div class="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 shadow-xl flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-black text-white">{exp().tacticName}</span>
                  <span class="text-xs font-mono font-bold text-indigo-400">({exp().coordLabel})</span>
                </div>
                <p class="text-[11px] text-slate-400 font-medium">Phân tích chiến thuật thời gian thực</p>
              </div>

              {/* Nút kích hoạt Mô phỏng What-If */}
              <Show when={store.selectedSandboxCell()}>
                {cell => (
                  <button
                    type="button"
                    onClick={() => store.simulateWhatIf(cell().row, cell().col)}
                    class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 shrink-0"
                  >
                    <Play size={13} class="fill-slate-950" />
                    <span>Giả Lập 5 Nước</span>
                  </button>
                )}
              </Show>
            </div>

            {/* Chi tiết giải thích */}
            <p class="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {exp().explanation}
            </p>

            {/* Điểm mạnh & Nguy cơ */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Show when={exp().pros.length > 0}>
                <div class="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                  <span class="font-bold text-emerald-300 block mb-0.5">✓ Điểm mạnh:</span>
                  <ul class="list-disc list-inside space-y-0.5 text-[11px]">
                    <For each={exp().pros}>{p => <li>{p}</li>}</For>
                  </ul>
                </div>
              </Show>

              <Show when={exp().cons.length > 0}>
                <div class="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200">
                  <span class="font-bold text-rose-300 block mb-0.5">✗ Nguy cơ / Nhược điểm:</span>
                  <ul class="list-disc list-inside space-y-0.5 text-[11px]">
                    <For each={exp().cons}>{c => <li>{c}</li>}</For>
                  </ul>
                </div>
              </Show>
            </div>

            {/* Danh sách chuỗi bước What-If nếu có */}
            <Show when={whatIfList().length > 0}>
              <div class="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-1.5">
                <div class="flex items-center justify-between text-xs font-black text-cyan-300">
                  <span>🔮 Chuỗi 5 Nước Giả Lập Tiếp Theo:</span>
                  <button
                    type="button"
                    onClick={() => store.clearWhatIf()}
                    class="text-[10px] text-slate-400 hover:text-white"
                  >
                    Xóa Chuỗi
                  </button>
                </div>
                <div class="space-y-1">
                  <For each={whatIfList()}>
                    {st => (
                      <div class="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                        <span class="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-[9px]">
                          {st.stepNumber}
                        </span>
                        <span>{st.annotation}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
};
