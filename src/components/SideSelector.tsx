import { type Component } from 'solid-js';
import { User, Bot } from 'lucide-solid';

export interface SideSelectorProps {
  onSelectSide: (playAsBlack: boolean) => void;
  theme?: 'emerald' | 'purple' | 'rose' | 'amber' | 'indigo';
  label?: string;
  blackLabel?: string;
  blackSubtext?: string;
  whiteLabel?: string;
  whiteSubtext?: string;
}

export const SideSelector: Component<SideSelectorProps> = (props) => {
  const theme = () => props.theme || 'purple';

  const whiteHoverStyle = () => {
    switch (theme()) {
      case 'rose':
        return 'hover:bg-rose-500 hover:text-slate-950 border-rose-500/50 hover:border-rose-400 group animate-glow-purple';
      case 'indigo':
        return 'hover:bg-indigo-500 hover:text-slate-950 border-indigo-500/50 hover:border-indigo-400 group animate-glow-indigo';
      case 'amber':
        return 'hover:bg-amber-500 hover:text-slate-950 border-amber-500/50 hover:border-amber-400 group animate-glow-amber';
      case 'emerald':
        return 'hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/50 hover:border-emerald-400 group animate-glow-emerald';
      case 'purple':
      default:
        return 'hover:bg-purple-500 hover:text-slate-950 border-purple-500/50 hover:border-purple-400 group animate-glow-purple';
    }
  };

  const whiteIconColor = () => {
    switch (theme()) {
      case 'rose':
        return 'text-rose-400';
      case 'indigo':
        return 'text-indigo-400';
      case 'amber':
        return 'text-amber-400';
      case 'emerald':
        return 'text-emerald-400';
      case 'purple':
      default:
        return 'text-purple-400';
    }
  };

  return (
    <div class="flex flex-col gap-1.5 pt-1">
      <span class="text-[11px] font-bold text-slate-300">
        {props.label || 'Chọn bên đi trước để bắt đầu:'}
      </span>
      <div class="grid grid-cols-2 gap-2.5">
        {/* Nút Bạn Đi Trước (Quân Đen) */}
        <button
          type="button"
          onClick={() => props.onSelectSide(true)}
          class="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold shadow-md active:scale-95 transition-all group animate-glow-emerald cursor-pointer"
        >
          <div class="flex items-center gap-1.5">
            <User size={15} class="group-hover:scale-110 transition-transform text-emerald-400 group-hover:text-slate-950" />
            <span>{props.blackLabel || 'Bạn Đi Trước'}</span>
          </div>
          <span class="text-[10px] opacity-75 font-normal">
            {props.blackSubtext || 'Quân Đen (●)'}
          </span>
        </button>

        {/* Nút Bot Đi Trước (Bot cầm Đen, Bạn cầm Trắng) */}
        <button
          type="button"
          onClick={() => props.onSelectSide(false)}
          class={`flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800/90 text-slate-200 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${whiteHoverStyle()}`}
        >
          <div class="flex items-center gap-1.5">
            <Bot size={15} class={`group-hover:scale-110 transition-transform group-hover:text-slate-950 ${whiteIconColor()}`} />
            <span>{props.whiteLabel || 'Bot Đi Trước'}</span>
          </div>
          <span class="text-[10px] opacity-75 font-normal">
            {props.whiteSubtext || 'Bot cầm Đen (●)'}
          </span>
        </button>
      </div>
    </div>
  );
};
