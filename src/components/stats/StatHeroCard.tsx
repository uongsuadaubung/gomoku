import { type Component, type JSX, Show } from 'solid-js';

export interface StatHeroCardProps {
  title: string;
  value?: string | number;
  subtext?: string;
  customValueElement?: JSX.Element;
  theme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  icon: JSX.Element;
}

export const StatHeroCard: Component<StatHeroCardProps> = (props) => {
  const theme = () => props.theme || 'indigo';

  const containerStyle = () => {
    switch (theme()) {
      case 'rose':
        return 'from-rose-950/60 to-slate-900 border-rose-500/30';
      case 'amber':
        return 'from-amber-950/60 to-slate-900 border-amber-500/30';
      case 'emerald':
        return 'from-emerald-950/60 to-slate-900 border-emerald-500/30';
      case 'purple':
        return 'from-purple-950/60 to-slate-900 border-purple-500/30';
      case 'indigo':
      default:
        return 'from-indigo-950/60 to-slate-900 border-indigo-500/30';
    }
  };

  const titleColor = () => {
    switch (theme()) {
      case 'rose':
        return 'text-rose-300';
      case 'amber':
        return 'text-amber-300';
      case 'emerald':
        return 'text-emerald-300';
      case 'purple':
        return 'text-purple-300';
      case 'indigo':
      default:
        return 'text-indigo-300';
    }
  };

  const valueColor = () => {
    switch (theme()) {
      case 'rose':
        return 'text-rose-400';
      case 'amber':
        return 'text-amber-400';
      case 'emerald':
        return 'text-emerald-400';
      case 'purple':
        return 'text-purple-400';
      case 'indigo':
      default:
        return 'text-indigo-400';
    }
  };

  const iconContainerStyle = () => {
    switch (theme()) {
      case 'rose':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'emerald':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'purple':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
      case 'indigo':
      default:
        return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400';
    }
  };

  return (
    <div class={`p-4 rounded-2xl bg-gradient-to-br border flex items-center justify-between shadow-lg ${containerStyle()}`}>
      <div>
        <span class={`text-xs font-semibold block mb-1 ${titleColor()}`}>
          {props.title}
        </span>

        <Show
          when={props.customValueElement}
          fallback={
            <div class="flex items-baseline space-x-2">
              <span class={`text-3xl font-black font-mono ${valueColor()}`}>
                {props.value}
              </span>
              <Show when={props.subtext}>
                <span class="text-xs text-slate-400 font-medium">
                  {props.subtext}
                </span>
              </Show>
            </div>
          }
        >
          {props.customValueElement}
        </Show>
      </div>

      <div class={`p-3 rounded-2xl border shadow-inner ${iconContainerStyle()}`}>
        {props.icon}
      </div>
    </div>
  );
};
