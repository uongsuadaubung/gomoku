import { type Component, type JSX, Show } from 'solid-js';
import { ChevronRight } from 'lucide-solid';

export type ModeTheme = 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';

export interface ModeCardProps {
  title: string;
  description: string;
  badgeText: string;
  badgeIcon?: JSX.Element;
  theme: ModeTheme;
  icon: JSX.Element;
  buttonText: string;
  buttonIcon?: JSX.Element;
  onAction: () => void;
  children?: JSX.Element;
}

export const ModeCard: Component<ModeCardProps> = (props) => {
  const theme = () => props.theme;

  const cardContainerStyle = () => {
    switch (theme()) {
      case 'cyan':
        return 'from-cyan-950/70 border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-cyan-500/15';
      case 'emerald':
        return 'from-emerald-950/70 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-emerald-500/10';
      case 'amber':
        return 'from-amber-950/70 border-amber-500/30 hover:border-amber-400/80 hover:shadow-amber-500/15';
      case 'rose':
        return 'from-rose-950/70 border-rose-500/30 hover:border-rose-400/70 hover:shadow-rose-500/10';
      case 'purple':
        return 'from-purple-950/70 border-purple-500/30 hover:border-purple-400/70 hover:shadow-purple-500/10';
      case 'indigo':
      default:
        return 'from-indigo-950/70 border-indigo-500/30 hover:border-indigo-400/70 hover:shadow-indigo-500/10';
    }
  };

  const iconBadgeStyle = () => {
    switch (theme()) {
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'amber':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'rose':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'purple':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'indigo':
      default:
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
    }
  };

  const pillBadgeStyle = () => {
    switch (theme()) {
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'rose':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'indigo':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  const titleHoverStyle = () => {
    switch (theme()) {
      case 'cyan':
        return 'group-hover:text-cyan-200';
      case 'emerald':
        return 'group-hover:text-emerald-200';
      case 'amber':
        return 'group-hover:text-amber-200';
      case 'rose':
        return 'group-hover:text-rose-200';
      case 'purple':
        return 'group-hover:text-purple-200';
      case 'indigo':
      default:
        return 'group-hover:text-indigo-200';
    }
  };

  const buttonStyle = () => {
    switch (theme()) {
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 shadow-cyan-500/25 text-slate-950 font-black';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25 text-white';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/25 text-slate-950';
      case 'rose':
        return 'bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 shadow-rose-500/25 text-white';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 text-white';
      case 'indigo':
      default:
        return 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 shadow-indigo-500/25 text-white';
    }
  };

  return (
    <div class={`group relative rounded-3xl bg-gradient-to-b via-slate-900 to-slate-950 border transition-all duration-300 p-5 flex flex-col justify-between shadow-xl hover:-translate-y-1 ${cardContainerStyle()}`}>
      <div class="space-y-3.5">
        {/* Mode Header */}
        <div class="flex items-start justify-between">
          <div class={`p-2.5 rounded-2xl border shadow-inner ${iconBadgeStyle()}`}>
            {props.icon}
          </div>
          <span class={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${pillBadgeStyle()}`}>
            <Show when={props.badgeIcon}>
              {props.badgeIcon}
            </Show>
            <span>{props.badgeText}</span>
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h2 class={`text-base sm:text-lg font-black text-white transition-colors ${titleHoverStyle()}`}>
            {props.title}
          </h2>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {props.description}
          </p>
        </div>

        {/* Custom Body / Preview */}
        <Show when={props.children}>
          {props.children}
        </Show>
      </div>

      {/* Action CTA Button */}
      <button
        type="button"
        onClick={() => props.onAction()}
        class={`w-full mt-4 py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer ${buttonStyle()}`}
      >
        <Show when={props.buttonIcon}>
          {props.buttonIcon}
        </Show>
        <span>{props.buttonText}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
};
