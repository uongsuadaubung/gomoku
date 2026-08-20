import { Component, For, Show } from 'solid-js';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE, EMPTY } from '../../game/types';
import type { HeatmapCell, WhatIfStep } from '../../data/guide/types';

interface GuideBoardOverlayProps {
  row: number;
  col: number;
}

export const GuideBoardOverlay: Component<GuideBoardOverlayProps> = (props) => {
  const store = useGame();

  // 1. Dữ liệu Heatmap cho ô hiện tại
  const heatmapCell = (): HeatmapCell | undefined => {
    if (store.guideTab() !== 'sandbox' || !store.showHeatmap()) return undefined;
    if (store.sandboxBoard()[props.row][props.col] !== EMPTY) return undefined;
    return store.sandboxHeatmap().find(h => h.row === props.row && h.col === props.col);
  };

  // 2. Dữ liệu bước What-If mô phỏng cho ô hiện tại
  const whatIfStep = (): WhatIfStep | undefined => {
    return store.whatIfSteps().find(s => s.move.row === props.row && s.move.col === props.col);
  };

  // 3. Kiểm tra ô gợi ý trong chế độ Bài học (Hint)
  const isHintCell = (): boolean => {
    if (store.guideTab() !== 'lessons' || !store.showHint()) return false;
    const step = store.currentStep();
    return step.targetMove.row === props.row && step.targetMove.col === props.col;
  };

  // 4. Kiểm tra ô đang được chọn trong Sandbox
  const isSelectedSandbox = (): boolean => {
    const sel = store.selectedSandboxCell();
    return sel !== null && sel.row === props.row && sel.col === props.col;
  };

  // Style màu sắc Heatmap
  const getHeatmapDotStyle = (quality: HeatmapCell['quality']) => {
    switch (quality) {
      case 'win':
      case 'vcf':
        return 'bg-amber-400 border-amber-300 shadow-[0_0_10px_#f59e0b] animate-pulse';
      case 'vct':
        return 'bg-purple-400 border-purple-300 shadow-[0_0_8px_#c084fc]';
      case 'best':
        return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]';
      case 'good':
        return 'bg-sky-400 border-sky-300 shadow-[0_0_6px_#38bdf8]';
      case 'passive':
        return 'bg-amber-500/60 border-amber-400/40';
      case 'blunder':
      default:
        return 'bg-rose-500/80 border-rose-400 shadow-[0_0_6px_#f43f5e]';
    }
  };

  const getHeatmapBadgeText = (quality: HeatmapCell['quality'], tacticName?: string) => {
    if (tacticName?.includes('VCF')) return 'VCF';
    if (tacticName?.includes('VCT')) return 'VCT';
    if (tacticName?.includes('4-3')) return '4-3';
    if (tacticName?.includes('3-3')) return '3-3';
    if (quality === 'win') return '★ WIN';
    if (quality === 'best') return '★ TỐT';
    if (quality === 'blunder') return '✗';
    return null;
  };

  return (
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center z-10 select-none">
      {/* A. Gợi ý trong Bài học (Hint Glow) */}
      <Show when={isHintCell()}>
        <div class="absolute inset-1 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_12px_#fbbf24] animate-ping" />
        <div class="absolute inset-1 rounded-full border-2 border-amber-300 bg-amber-400/30 flex items-center justify-center">
          <span class="text-[9px] font-black text-amber-200">ĐÍCH</span>
        </div>
      </Show>

      {/* B. Ô đang chọn trong Sandbox */}
      <Show when={isSelectedSandbox()}>
        <div class="absolute inset-0.5 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
      </Show>

      {/* C. Điểm Heatmap Radar */}
      <Show when={heatmapCell()}>
        {cell => (
          <div class="flex flex-col items-center justify-center">
            {/* Chấm tròn Heatmap */}
            <div
              class={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border ${getHeatmapDotStyle(
                cell().quality
              )} transition-all duration-300`}
            />

            {/* Badge chữ chất lượng nếu được bật */}
            <Show when={store.showQualityBadges() && getHeatmapBadgeText(cell().quality, cell().tacticName)}>
              {badge => (
                <span
                  class={`mt-0.5 text-[8px] sm:text-[9px] font-extrabold px-1 rounded-md leading-tight shadow-sm ${
                    cell().quality === 'win' || cell().quality === 'vcf'
                      ? 'bg-amber-500 text-slate-950'
                      : cell().quality === 'best'
                      ? 'bg-emerald-500 text-slate-950'
                      : cell().quality === 'vct'
                      ? 'bg-purple-500 text-white'
                      : cell().quality === 'blunder'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {badge()}
                </span>
              )}
            </Show>
          </div>
        )}
      </Show>

      {/* D. Bước mô phỏng What-If (Đánh số 1, 2, 3, 4, 5) */}
      <Show when={whatIfStep()}>
        {step => (
          <div
            class={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center font-mono font-black text-xs shadow-lg animate-bounce ${
              step().player === BLACK
                ? 'bg-slate-950 border-cyan-400 text-cyan-300 shadow-cyan-950/80'
                : 'bg-slate-100 border-rose-400 text-slate-900 shadow-rose-950/80'
            }`}
          >
            {step().stepNumber}
          </div>
        )}
      </Show>
    </div>
  );
};
