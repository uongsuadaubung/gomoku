import { type Component, Show } from 'solid-js';
import { ShieldAlert } from 'lucide-solid';
import type { TacticalWinType } from '../game/types';

export interface TacticalAlertProps {
  tacticalType?: TacticalWinType | null;
}

export const TacticalAlert: Component<TacticalAlertProps> = (props) => {
  return (
    <Show when={props.tacticalType && props.tacticalType !== 'none'}>
      <Show
        when={props.tacticalType === 'vcf'}
        fallback={
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold animate-bounce shadow-md shadow-purple-500/20">
            <ShieldAlert size={14} class="text-purple-400" />
            <span>Bot kích hoạt chuỗi Đòn Bẫy VCT kết liễu!</span>
          </div>
        }
      >
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-bounce shadow-md shadow-red-500/20">
          <ShieldAlert size={14} class="text-red-400" />
          <span>Bot kích hoạt chuỗi Sát Cục VCF kết liễu!</span>
        </div>
      </Show>
    </Show>
  );
};
