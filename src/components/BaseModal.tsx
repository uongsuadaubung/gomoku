import { type Component, type JSX, Show } from 'solid-js';
import { X } from 'lucide-solid';
import { ModalBotTaunt } from './ModalBotTaunt';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: JSX.Element;
  iconColorClass?: string;
  maxWidth?: string;
  showBotTaunt?: boolean;
  children: JSX.Element;
  footer?: JSX.Element;
}

export const BaseModal: Component<BaseModalProps> = (props) => {
  const maxWidth = () => props.maxWidth || 'max-w-2xl';
  const iconStyle = () => props.iconColorClass || 'bg-slate-800 text-slate-200 border-slate-700';
  const showTaunt = () => props.showBotTaunt !== false;

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div class={`bg-slate-900 border border-slate-800 rounded-3xl ${maxWidth()} w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl`}>
          {/* Modal Header */}
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Show when={props.icon}>
                <div class={`p-2.5 rounded-2xl border ${iconStyle()}`}>
                  {props.icon}
                </div>
              </Show>
              <div>
                <h2 class="text-lg font-black text-white">{props.title}</h2>
                <Show when={props.subtitle}>
                  <p class="text-xs text-slate-400">{props.subtitle}</p>
                </Show>
              </div>
            </div>

            <button
              type="button"
              onClick={() => props.onClose()}
              class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div class="p-5 overflow-y-auto space-y-4 flex-1">
            <Show when={showTaunt()}>
              <ModalBotTaunt />
            </Show>
            {props.children}
          </div>

          {/* Modal Footer (Optional) */}
          <Show when={props.footer}>
            <div class="p-4 border-t border-slate-800 bg-slate-950/40">
              {props.footer}
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
