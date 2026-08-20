import { type Component, type JSX, Show } from 'solid-js';

export interface HeaderIconButtonProps {
  title: string;
  icon: JSX.Element;
  label?: string;
  onClick: () => void;
}

export const HeaderIconButton: Component<HeaderIconButtonProps> = (props) => {
  return (
    <button
      type="button"
      onClick={() => props.onClick()}
      title={props.title}
      class="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1 sm:gap-1.5 text-xs font-medium cursor-pointer"
    >
      {props.icon}
      <Show when={props.label}>
        <span class="hidden md:inline">{props.label}</span>
      </Show>
    </button>
  );
};
