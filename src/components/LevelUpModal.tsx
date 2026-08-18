import { type Component, Show } from 'solid-js';
import { Sparkles, ArrowRight } from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import { BLACK } from '../game/types';

interface LevelUpModalProps {
  store: GameStore;
}

export const LevelUpModal: Component<LevelUpModalProps> = props => {
  const { store } = props;
  const level = () => store.showLevelUpAlert();

  return (
    <Show when={level()}>
      <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl shadow-amber-500/20 animate-scale-in relative overflow-hidden">
          {/* Background Glow */}
          <div class="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
          <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

          {/* Level Avatar Banner */}
          <div class="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 text-4xl mb-4 shadow-inner">
            <span>{level()?.avatar}</span>
            <div class="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-500 text-slate-950 font-bold shadow-md">
              <Sparkles size={16} />
            </div>
          </div>

          <span class="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
            Chúc mừng bạn đã thăng cấp!
          </span>
          <h2 class="text-2xl font-black text-white mb-2">
            Bot Thăng Cấp: Level {level()?.id}
          </h2>
          <span class={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border mb-4 ${level()?.badgeBg}`}>
            {level()?.vietnameseName} ({level()?.tag})
          </span>

          <p class="text-xs text-slate-300 mb-6 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-left leading-relaxed">
            <strong class="text-amber-400 block mb-1">Đặc tính mới của Bot:</strong>
            {level()?.description}
            <br />
            <span class="text-slate-400 text-[11px] block mt-1">
              • Chiến thuật: {level()?.tactics}
            </span>
          </p>

          <button
            onClick={() => {
              store.setShowLevelUpAlert(null);
              store.startNewGame(store.playerColor() === BLACK);
            }}
            class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Thử Thách Ván Mới Ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Show>
  );
};
