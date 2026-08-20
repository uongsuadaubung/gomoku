import { type Component, For, Show } from 'solid-js';
import { Palette, Volume2, VolumeX, Hash, Grid3X3, Crosshair, MessageSquareQuote } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import type { ThemeType, BoardStyle } from '../game/types';
import { BaseModal } from './BaseModal';
import { SettingToggleRow } from './SettingToggleRow';

export const SettingsModal: Component = () => {
  const store = useGame();

  const themes: Array<{ id: ThemeType; name: string; desc: string; previewBg: string }> = [
    {
      id: 'paper',
      name: 'Giấy Trắng Ô Ly',
      desc: 'Phong cách trang giấy vở học trò tinh khôi',
      previewBg: 'bg-amber-50 border-stone-300',
    },
    {
      id: 'wood',
      name: 'Gỗ Cổ Điển',
      desc: 'Bàn cờ gỗ vân tự nhiên truyền thống',
      previewBg: 'bg-amber-700 border-amber-600',
    },
    {
      id: 'jade',
      name: 'Ngọc Bích',
      desc: 'Màu xanh lục bảo thanh tao quý phái',
      previewBg: 'bg-emerald-800 border-emerald-500',
    },
    {
      id: 'slate',
      name: 'Tối Giản Slate',
      desc: 'Phong cách hiện đại tinh tế',
      previewBg: 'bg-slate-700 border-slate-500',
    },
    {
      id: 'cyber',
      name: 'Hắc Ám Cyber',
      desc: 'Không gian công nghệ neon huyền ảo',
      previewBg: 'bg-slate-900 border-cyan-500',
    },
  ];

  const boardStyles: Array<{ id: BoardStyle; name: string; desc: string; icon: typeof Crosshair }> = [
    {
      id: 'intersections',
      name: 'Giao Điểm Đường Kẻ',
      desc: 'Đặt cờ lên điểm giao cắt giữa các đường kẻ',
      icon: Crosshair,
    },
    {
      id: 'cells',
      name: 'Nằm Giữa Ô Vuông',
      desc: 'Đặt cờ lọt lòng trong từng ô vuông (Kiểu Cờ Carô ô ly tập vở)',
      icon: Grid3X3,
    },
  ];

  return (
    <BaseModal
      isOpen={store.showSettingsModal()}
      onClose={() => store.setShowSettingsModal(false)}
      title="Cài Đặt Trò Chơi"
      subtitle="Tùy biến phong cách bàn cờ, màu sắc và âm thanh"
      icon={<Palette size={20} />}
      maxWidth="max-w-lg"
    >
      {/* 1. Board Style: Intersections vs Cells */}
      <div>
        <label class="text-xs font-bold text-slate-300 block mb-2.5">
          Phong Cách Đặt Quân Cờ
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <For each={boardStyles}>
            {bs => {
              const isSelected = () => store.boardStyle() === bs.id;
              const IconComponent = bs.icon;
              return (
                <button
                  type="button"
                  onClick={() => store.setBoardStyle(bs.id)}
                  class={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${
                    isSelected()
                      ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-500/15 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    class={`p-2 rounded-xl border mt-0.5 ${
                      isSelected()
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">{bs.name}</span>
                    <span class="text-[11px] text-slate-400 leading-tight mt-0.5 block">
                      {bs.desc}
                    </span>
                  </div>
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* 2. Theme Selector */}
      <div>
        <label class="text-xs font-bold text-slate-300 block mb-2.5">
          Giao Diện / Màu Sắc Bàn Cờ
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <For each={themes}>
            {th => {
              const isSelected = () => store.theme() === th.id;
              return (
                <button
                  type="button"
                  onClick={() => store.setTheme(th.id)}
                  class={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 cursor-pointer ${
                    isSelected()
                      ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-500/15'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div class={`w-8 h-8 rounded-xl border ${th.previewBg} shadow-inner`} />
                  <div>
                    <span class="text-xs font-bold text-white block">{th.name}</span>
                    <span class="text-[10px] text-slate-400 hidden sm:block">{th.desc}</span>
                  </div>
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* 3. Gameplay Options */}
      <div class="space-y-3 pt-4 border-t border-slate-800">
        {/* Toggle Sound */}
        <SettingToggleRow
          label="Âm thanh hiệu ứng"
          description="Tiếng gõ cờ gỗ, thắng thua và thăng cấp"
          icon={
            <Show
              when={!store.isMuted()}
              fallback={<VolumeX size={18} class="text-rose-400" />}
            >
              <Volume2 size={18} class="text-emerald-400" />
            </Show>
          }
          isChecked={!store.isMuted()}
          onToggle={() => store.toggleSound()}
          color="emerald"
        />

        {/* Toggle Step Numbers */}
        <SettingToggleRow
          label="Đánh số thứ tự nước đi"
          description="Hiển thị số 1, 2, 3... trên từng quân cờ"
          icon={<Hash size={18} class="text-amber-400" />}
          isChecked={store.showStepNumbers()}
          onToggle={() => store.toggleStepNumbers()}
          color="amber"
        />

        {/* Toggle Taunts */}
        <SettingToggleRow
          label="Lời thoại cà khịa của Bot"
          description="BẬT để nghe gáy bẩn (TẮT sẽ bịt miệng Bot thành ký tự !@#$#%$&%*)"
          icon={<MessageSquareQuote size={18} class="text-rose-400" />}
          isChecked={store.enableTaunts()}
          onToggle={() => store.toggleEnableTaunts()}
          color="rose"
        />
      </div>
    </BaseModal>
  );
};
