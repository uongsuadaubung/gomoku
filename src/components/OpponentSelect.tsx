import { type Component, type JSX, For, Show } from 'solid-js';
import { ChevronDown } from 'lucide-solid';
import { AI_LEVELS } from '../game/constants';
import type { LevelConfig } from '../game/types';

export interface OpponentSelectProps {
  /** Cấp độ đối thủ hiện tại đang chọn (1 - 12) */
  value: number;
  /** Hàm callback khi người chơi chọn cấp độ mới */
  onChange: (level: number) => void;
  /** Cấp độ tối đa đã mở khóa (nếu không truyền isUnlocked) */
  maxUnlockedLevel?: number;
  /** Hàm tùy chỉnh kiểm tra cấp độ đã mở khóa */
  isUnlocked?: (levelId: number) => boolean;
  /** Nếu true (mặc định): chỉ liệt kê các bot đã mở; Nếu false: liệt kê cả 12 bot kèm icon 🔒 và disabled */
  unlockedOnly?: boolean;
  /** Tiêu đề / Nhãn hiển thị */
  label?: string;
  /** Icon hiển thị cạnh nhãn */
  icon?: JSX.Element;
  /** Tông màu chủ đạo */
  theme?: 'amber' | 'purple' | 'indigo' | 'emerald' | 'rose' | 'slate';
  /** Bố cục nhãn và ô chọn: 'stacked' (trên - dưới) hoặc 'inline' (ngang hàng) */
  layout?: 'stacked' | 'inline';
  /** Kích thước: 'sm' | 'md' */
  size?: 'sm' | 'md';
  /** Tùy chọn định dạng nhãn hiển thị trong option: 'full' (Cấp X - Tên (Tag)) | 'compact' (Bot Tên (Cấp X)) | 'standard' (Cấp X - Tên) */
  optionFormat?: 'full' | 'compact' | 'standard';
  /** Class tùy biến cho container bên ngoài */
  class?: string;
  /** Class tùy biến cho thẻ select */
  selectClass?: string;
  /** Vô hiệu hóa toàn bộ select */
  disabled?: boolean;
}

export const OpponentSelect: Component<OpponentSelectProps> = (props) => {
  const theme = () => props.theme || 'amber';
  const layout = () => props.layout || 'stacked';
  const size = () => props.size || 'sm';
  const optionFormat = () => props.optionFormat || 'standard';
  const unlockedOnly = () => props.unlockedOnly !== false; // Mặc định là true (ẩn các bot chưa mở khóa)

  const checkUnlocked = (lvlId: number): boolean => {
    if (props.isUnlocked) {
      return props.isUnlocked(lvlId);
    }
    if (props.maxUnlockedLevel !== undefined) {
      return lvlId <= props.maxUnlockedLevel;
    }
    return true; // Mặc định mở khóa nếu không cung cấp điều kiện
  };

  const availableLevels = () => {
    if (unlockedOnly()) {
      return AI_LEVELS.filter(lvl => checkUnlocked(lvl.id));
    }
    return AI_LEVELS;
  };

  // Màu sắc theo theme
  const themeStyles = () => {
    switch (theme()) {
      case 'purple':
        return {
          label: 'text-purple-300/90',
          borderHover: 'hover:border-purple-500/50',
          focus: 'focus:border-purple-500 focus:ring-purple-500/40',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'indigo':
        return {
          label: 'text-indigo-300/90',
          borderHover: 'hover:border-indigo-500/50',
          focus: 'focus:border-indigo-500 focus:ring-indigo-500/40',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
      case 'emerald':
        return {
          label: 'text-emerald-300/90',
          borderHover: 'hover:border-emerald-500/50',
          focus: 'focus:border-emerald-500 focus:ring-emerald-500/40',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'rose':
        return {
          label: 'text-rose-300/90',
          borderHover: 'hover:border-rose-500/50',
          focus: 'focus:border-rose-500 focus:ring-rose-500/40',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'slate':
        return {
          label: 'text-slate-300/90',
          borderHover: 'hover:border-slate-500/50',
          focus: 'focus:border-slate-500 focus:ring-slate-500/40',
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        };
      case 'amber':
      default:
        return {
          label: 'text-amber-300/90',
          borderHover: 'hover:border-amber-500/60',
          focus: 'focus:border-amber-500 focus:ring-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
    }
  };

  const formatOptionLabel = (lvl: LevelConfig, isLvlUnlocked: boolean): string => {
    let base = '';
    if (optionFormat() === 'compact') {
      base = `Bot ${lvl.vietnameseName} (Cấp ${lvl.id})`;
    } else if (optionFormat() === 'full') {
      base = `Cấp ${lvl.id} - ${lvl.vietnameseName} • ${lvl.tag}`;
    } else {
      base = `Cấp ${lvl.id} - ${lvl.vietnameseName}`;
    }

    if (!unlockedOnly()) {
      return isLvlUnlocked ? `${base} ✓` : `${base} 🔒 (Chưa mở)`;
    }
    return base;
  };

  const selectPaddingClass = () => {
    return size() === 'md'
      ? 'py-2 px-3 pr-8 text-xs rounded-xl'
      : 'py-1.5 px-2.5 pr-7 text-xs rounded-lg';
  };

  return (
    <div
      class={`select-none ${
        layout() === 'inline'
          ? 'flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800'
          : 'space-y-1.5'
      } ${props.class || ''}`}
    >
      <Show when={props.label}>
        <label
          class={`font-bold flex items-center gap-1.5 shrink-0 ${themeStyles().label} ${
            layout() === 'inline' ? 'text-[11px]' : 'text-[10px] block'
          }`}
        >
          <Show when={props.icon}>
            <span class="shrink-0">{props.icon}</span>
          </Show>
          <span>{props.label}</span>
        </label>
      </Show>

      <div class={`relative ${layout() === 'inline' ? 'flex-1' : 'w-full'}`}>
        <select
          value={props.value}
          disabled={props.disabled}
          onChange={e => {
            const val = Number(e.currentTarget.value);
            if (!isNaN(val)) {
              props.onChange(val);
            }
          }}
          class={`w-full bg-slate-950/90 text-slate-100 font-bold border border-slate-800 hover:bg-slate-950 focus:outline-none focus:ring-1 appearance-none cursor-pointer shadow-inner transition-all ${
            themeStyles().borderHover
          } ${themeStyles().focus} ${selectPaddingClass()} ${
            props.disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${props.selectClass || ''}`}
        >
          <For each={availableLevels()}>
            {lvl => {
              const isLvlUnlocked = checkUnlocked(lvl.id);
              return (
                <option
                  value={lvl.id}
                  disabled={!isLvlUnlocked}
                  class={`bg-slate-900 py-1.5 ${
                    isLvlUnlocked ? 'text-slate-100 font-semibold' : 'text-slate-500 font-normal'
                  }`}
                >
                  {formatOptionLabel(lvl, isLvlUnlocked)}
                </option>
              );
            }}
          </For>
        </select>
        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={size() === 'md' ? 14 : 13} />
        </div>
      </div>
    </div>
  );
};
