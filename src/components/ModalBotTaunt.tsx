import { Component, Show } from 'solid-js';
import { MessageSquareQuote } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { getMoodEmoji } from '../services/tauntService';

export const ModalBotTaunt: Component = () => {
  const store = useGame();
  const taunt = () => store.tauntState();
  const config = () => store.currentLevelConfig();

  return (
    <Show when={taunt().visible}>
      <div
        class={`mb-4 p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-3 animate-scale-in transition-all ${
          store.enableTaunts()
            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border-2 border-amber-300 shadow-xl shadow-amber-950/40'
            : 'bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 text-rose-400 border-2 border-rose-500/70 shadow-xl shadow-rose-950/50 font-mono tracking-wider'
        }`}
      >
        <div class="w-10 h-10 rounded-xl bg-slate-950/20 border border-slate-950/30 flex items-center justify-center text-2xl shrink-0">
          {store.enableTaunts() ? getMoodEmoji(taunt().mood, config().avatar) : '🤐'}
        </div>
        <span class="leading-snug flex-1">{taunt().text}</span>
      </div>
    </Show>
  );
};
