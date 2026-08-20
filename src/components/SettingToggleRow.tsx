import { type Component, type JSX } from 'solid-js';

export interface SettingToggleRowProps {
  label: string;
  description: string;
  icon: JSX.Element;
  isChecked: boolean;
  onToggle: () => void;
  color?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
}

export const SettingToggleRow: Component<SettingToggleRowProps> = (props) => {
  const activeColor = () => {
    switch (props.color) {
      case 'amber':
        return 'bg-amber-500';
      case 'rose':
        return 'bg-rose-500';
      case 'indigo':
        return 'bg-indigo-500';
      case 'purple':
        return 'bg-purple-500';
      case 'emerald':
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 transition-all hover:border-slate-700/80">
      <div class="flex items-center space-x-3">
        <div class="shrink-0">
          {props.icon}
        </div>
        <div>
          <span class="text-xs font-bold text-white block">{props.label}</span>
          <span class="text-[11px] text-slate-400">{props.description}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => props.onToggle()}
        class={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
          props.isChecked ? activeColor() : 'bg-slate-800'
        }`}
      >
        <div
          class={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
            props.isChecked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
